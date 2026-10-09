import { createHash, randomUUID } from "node:crypto";
import { lstat, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { z } from "zod";

const Digest = z.string().regex(/^[a-f0-9]{64}$/);
const Artifact = z.object({ version: z.string(), sha256: Digest }).strict();
const State = z
  .object({
    managed: z.literal(true),
    version: z.string(),
    sha256: Digest,
    previous: Artifact.nullable(),
  })
  .strict();
const Legacy = z
  .object({ managed: z.literal(true), version: z.string(), rollback: z.boolean() })
  .strict();
const Journal = z
  .object({
    id: z.string().uuid(),
    beforeActive: Artifact.nullable(),
    beforePrevious: Artifact.nullable(),
    beforeState: z.string().nullable(),
    nextState: State,
  })
  .strict();
type ManagedState = z.infer<typeof State>;
export interface CommitHooks {
  beforeStateCommit?: () => Promise<void>;
}
const hash = (data: Buffer) => createHash("sha256").update(data).digest("hex");
function missing(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
async function regularBytes(file: string): Promise<Buffer | null> {
  try {
    const info = await lstat(file);
    if (!info.isFile() || info.isSymbolicLink())
      throw new Error("Managed runtime paths must be regular files");
    return await readFile(file);
  } catch (error) {
    if (missing(error)) return null;
    throw error;
  }
}
async function atomicWrite(file: string, data: Buffer | string, mode = 0o600): Promise<void> {
  const temp = join(dirname(file), `.write-${randomUUID()}`);
  try {
    await writeFile(temp, data, { mode });
    await rename(temp, file);
  } finally {
    await rm(temp, { force: true });
  }
}
async function replace(file: string, data: Buffer | null, mode: number): Promise<void> {
  if (data) await atomicWrite(file, data, mode);
  else await rm(file, { force: true });
}
async function stateText(root: string): Promise<string | null> {
  const bytes = await regularBytes(join(root, "bridge-state.json"));
  return bytes?.toString("utf8") ?? null;
}
async function readOwned(
  root: string,
  trusted?: { data: Buffer; version: string },
): Promise<{ state: ManagedState | null; text: string | null }> {
  const text = await stateText(root);
  const active = await regularBytes(join(root, "bin", "mcpls")),
    previous = await regularBytes(join(root, "bin", "mcpls.previous"));
  if (!text) {
    if (active || previous) throw new Error("Refusing to replace an unowned executable");
    return { state: null, text };
  }
  const value: unknown = JSON.parse(text);
  const current = State.safeParse(value);
  let state: ManagedState;
  if (current.success) state = current.data;
  else {
    const legacy = Legacy.safeParse(value);
    if (
      !legacy.success ||
      !trusted ||
      !active ||
      legacy.data.version !== trusted.version ||
      hash(active) !== hash(trusted.data) ||
      (previous && hash(previous) !== hash(trusted.data))
    )
      throw new Error("Legacy runtime ownership requires a matching verified official artifact");
    state = {
      managed: true,
      version: legacy.data.version,
      sha256: hash(active),
      previous: previous ? { version: legacy.data.version, sha256: hash(previous) } : null,
    };
  }
  if (!active || hash(active) !== state.sha256)
    throw new Error("Active executable identity was externally modified");
  if (state.previous ? !previous || hash(previous) !== state.previous.sha256 : previous !== null)
    throw new Error("Rollback executable identity was externally modified");
  return { state, text };
}
async function recover(root: string): Promise<void> {
  const encoded = await regularBytes(join(root, "transaction.json"));
  if (!encoded) return;
  const journal = Journal.parse(JSON.parse(encoded.toString("utf8")));
  const dir = join(root, "transactions", journal.id);
  const before = journal.beforeActive ? await regularBytes(join(dir, "active.before")) : null;
  const previous = journal.beforePrevious ? await regularBytes(join(dir, "previous.before")) : null;
  if (journal.beforeActive && (!before || hash(before) !== journal.beforeActive.sha256))
    throw new Error("Recovery snapshot identity mismatch");
  if (journal.beforePrevious && (!previous || hash(previous) !== journal.beforePrevious.sha256))
    throw new Error("Recovery backup identity mismatch");
  const activeNow = await regularBytes(join(root, "bin", "mcpls"));
  const previousNow = await regularBytes(join(root, "bin", "mcpls.previous"));
  if (
    activeNow &&
    ![journal.beforeActive?.sha256, journal.nextState.sha256].includes(hash(activeNow))
  )
    throw new Error("External executable change prevents automatic recovery");
  if (
    previousNow &&
    ![journal.beforePrevious?.sha256, journal.beforeActive?.sha256].includes(hash(previousNow))
  )
    throw new Error("External rollback change prevents automatic recovery");
  const textNow = await stateText(root);
  if (textNow !== journal.beforeState && textNow !== `${JSON.stringify(journal.nextState)}\n`)
    throw new Error("External state change prevents automatic recovery");
  await replace(join(root, "bin", "mcpls"), before, 0o755);
  await replace(join(root, "bin", "mcpls.previous"), previous, 0o755);
  await replace(
    join(root, "bridge-state.json"),
    journal.beforeState === null ? null : Buffer.from(journal.beforeState),
    0o600,
  );
  await rm(join(root, "transaction.json"));
  await rm(dir, { recursive: true, force: true });
}
export async function withRuntimeLock<T>(root: string, operation: () => Promise<T>): Promise<T> {
  await mkdir(root, { recursive: true, mode: 0o700 });
  const lock = join(root, ".mutation.lock"),
    ownerFile = join(lock, "owner.json");
  const take = async () => {
    try {
      await mkdir(lock, { mode: 0o700 });
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "EEXIST")) throw error;
      let owner: { pid: number; nonce: string };
      try {
        const bytes = await regularBytes(ownerFile);
        owner = z
          .object({ pid: z.number().int().positive(), nonce: z.string().uuid() })
          .strict()
          .parse(JSON.parse(bytes?.toString("utf8") ?? ""));
      } catch {
        throw new Error("Runtime mutation is busy; inspect an incomplete lock before retrying");
      }
      try {
        process.kill(owner.pid, 0);
        throw new Error("Runtime mutation is busy");
      } catch (error) {
        if (!(error instanceof Error && "code" in error && error.code === "ESRCH")) throw error;
      }
      const files = await readdir(lock);
      if (files.length !== 1 || files[0] !== "owner.json")
        throw new Error("Unexpected runtime lock contents");
      await rm(lock, { recursive: true });
      await mkdir(lock, { mode: 0o700 });
    }
  };
  await take();
  const nonce = randomUUID();
  await writeFile(ownerFile, JSON.stringify({ pid: process.pid, nonce }), { mode: 0o600 });
  try {
    await recover(root);
    return await operation();
  } finally {
    const bytes = await regularBytes(ownerFile);
    if (bytes && JSON.parse(bytes.toString("utf8")).nonce === nonce)
      await rm(lock, { recursive: true });
  }
}
async function transact(
  root: string,
  data: Buffer,
  version: string,
  previousData: Buffer | null,
  previousArtifact: z.infer<typeof Artifact> | null,
  before: { state: ManagedState | null; text: string | null },
  hooks: CommitHooks,
): Promise<void> {
  await mkdir(join(root, "bin"), { recursive: true, mode: 0o700 });
  const id = randomUUID(),
    dir = join(root, "transactions", id);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const beforeActive = await regularBytes(join(root, "bin", "mcpls")),
    beforePrevious = await regularBytes(join(root, "bin", "mcpls.previous"));
  if (beforeActive) await writeFile(join(dir, "active.before"), beforeActive, { mode: 0o700 });
  if (beforePrevious)
    await writeFile(join(dir, "previous.before"), beforePrevious, { mode: 0o700 });
  const nextState: ManagedState = {
    managed: true,
    version,
    sha256: hash(data),
    previous: previousArtifact,
  };
  const journal: z.infer<typeof Journal> = {
    id,
    beforeActive: before.state
      ? { version: before.state.version, sha256: before.state.sha256 }
      : null,
    beforePrevious: before.state?.previous ?? null,
    beforeState: before.text,
    nextState,
  };
  await atomicWrite(join(root, "transaction.json"), `${JSON.stringify(journal)}\n`);
  try {
    // Never remove the active path first: each replacement is one atomic rename.
    await atomicWrite(join(root, "bin", "mcpls"), data, 0o755);
    await replace(join(root, "bin", "mcpls.previous"), previousData, 0o755);
    await hooks.beforeStateCommit?.();
    await atomicWrite(join(root, "bridge-state.json"), `${JSON.stringify(nextState)}\n`);
    await rm(join(root, "transaction.json"));
  } catch (error) {
    await recover(root);
    throw error;
  } finally {
    if (!(await regularBytes(join(root, "transaction.json"))))
      await rm(dir, { recursive: true, force: true });
  }
}
export async function activateBridgeUnlocked(
  root: string,
  data: Buffer,
  version: string,
  update: boolean,
  hooks: CommitHooks = {},
): Promise<void> {
  const before = await readOwned(root, { data, version });
  if (before.state && !update) {
    if (before.state.sha256 === hash(data) && before.state.version === version) return;
    throw new Error("Bridge is already installed; use update explicitly");
  }
  const old = before.state ? await regularBytes(join(root, "bin", "mcpls")) : null;
  await transact(
    root,
    data,
    version,
    old,
    before.state ? { version: before.state.version, sha256: before.state.sha256 } : null,
    before,
    hooks,
  );
}
export async function activateBridge(
  root: string,
  data: Buffer,
  version: string,
  update: boolean,
  hooks: CommitHooks = {},
): Promise<void> {
  return withRuntimeLock(root, () => activateBridgeUnlocked(root, data, version, update, hooks));
}
export async function rollbackBridge(root: string): Promise<void> {
  return withRuntimeLock(root, async () => {
    const before = await readOwned(root);
    if (!before.state?.previous) throw new Error("No managed rollback is available");
    const bytes = await regularBytes(join(root, "bin", "mcpls.previous"));
    if (!bytes) throw new Error("No rollback executable is available");
    await transact(root, bytes, before.state.previous.version, null, null, before, {});
  });
}
