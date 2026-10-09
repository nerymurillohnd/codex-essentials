import { readFile, realpath, stat } from "node:fs/promises";
import { extname, isAbsolute, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

export const ProfileSchema = z.enum(["typescript", "svelte", "astro", "python", "bash"]);
export type Profile = z.infer<typeof ProfileSchema>;
export const PROFILES: Profile[] = ProfileSchema.options;
export const MCPLS_VERSION = "0.7.0";
export const VERSION = "0.1.0";

export function rejectSecretPath(path: string): void {
  const parts = path.split(/[\\/]/);
  if (
    parts.some(
      (part) =>
        /^(?:\.env(?:\..*)?|\.dev\.vars(?:\..*)?|auth\.json|credentials(?:\.json)?|.*\.(?:pem|key|p12|pfx))$/i.test(
          part,
        ) && !part.endsWith(".example"),
    )
  ) {
    throw new Error("Secret files are not LSP targets");
  }
}
export function selectProfile(file: string): Profile {
  rejectSecretPath(file);
  const extension = extname(file);
  if ([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"].includes(extension))
    return "typescript";
  if (extension === ".svelte") return "svelte";
  if (extension === ".astro") return "astro";
  if ([".py", ".pyi", ".pyw"].includes(extension)) return "python";
  if ([".sh", ".bash"].includes(extension)) return "bash";
  throw new Error("Unsupported source extension");
}
export function contains(root: string, file: string): boolean {
  const path = relative(root, file);
  return path === "" || (path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path));
}
export async function canonicalRoot(value: unknown): Promise<string> {
  const root = z.string().min(1).parse(value);
  if (!isAbsolute(root)) throw new Error("workspace_root must be absolute");
  const canonical = await realpath(root);
  if (!(await stat(canonical)).isDirectory()) throw new Error("workspace_root must be a directory");
  return canonical;
}
export async function canonicalFile(root: string, value: string): Promise<string> {
  rejectSecretPath(value);
  if (!isAbsolute(value)) throw new Error("Source paths must be absolute");
  const file = await realpath(value);
  rejectSecretPath(file);
  if (!contains(root, file)) throw new Error("Source file is outside workspace_root");
  const info = await stat(file);
  if (!info.isFile()) throw new Error("Source must be a regular file");
  if (info.size > 10 * 1024 * 1024) throw new Error("Source exceeds 10 MiB limit");
  return file;
}
async function validateNestedPaths(root: string, value: unknown): Promise<void> {
  if (Array.isArray(value)) {
    for (const item of value) await validateNestedPaths(root, item);
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (typeof item === "string" && ["uri", "targetUri", "target_uri"].includes(key)) {
        if (!item.startsWith("file://")) throw new Error("LSP item URI must be a local file");
        await canonicalFile(root, fileURLToPath(item));
      }
      await validateNestedPaths(root, item);
    }
  }
}
export async function validateRequest(
  args: Record<string, unknown>,
): Promise<{ root: string; profile: Profile; nativeArgs: Record<string, unknown> }> {
  const root = await canonicalRoot(args.workspace_root);
  const { workspace_root: _root, profile: profileValue, ...nativeArgs } = args;
  let profile: Profile;
  if (typeof nativeArgs.file_path === "string") {
    const file = await canonicalFile(root, nativeArgs.file_path);
    profile = selectProfile(file);
    if (profileValue !== undefined && ProfileSchema.parse(profileValue) !== profile)
      throw new Error("Profile does not match source file");
    nativeArgs.file_path = file;
    const content = await readFile(file, "utf8");
    const lines = content.split(/\r\n|\r|\n/);
    for (const [lineKey, charKey] of [
      ["line", "character"],
      ["start_line", "start_character"],
      ["end_line", "end_character"],
    ]) {
      if (!lineKey || !charKey) continue;
      const line = nativeArgs[lineKey],
        character = nativeArgs[charKey];
      if (line === undefined || line === null) continue;
      if (
        typeof line !== "number" ||
        !Number.isSafeInteger(line) ||
        line < 1 ||
        typeof character !== "number" ||
        !Number.isSafeInteger(character) ||
        character < 1
      )
        throw new Error("Positions must be positive integers");
      const text = lines[line - 1];
      if (text === undefined || character > text.length + 1)
        throw new Error("Position is outside the document");
      const previous = text.charCodeAt(character - 2),
        next = text.charCodeAt(character - 1);
      if (previous >= 0xd800 && previous <= 0xdbff && next >= 0xdc00 && next <= 0xdfff)
        throw new Error("Position splits a UTF-16 surrogate pair");
    }
    if (
      typeof nativeArgs.start_line === "number" &&
      typeof nativeArgs.end_line === "number" &&
      (nativeArgs.end_line < nativeArgs.start_line ||
        (nativeArgs.end_line === nativeArgs.start_line &&
          Number(nativeArgs.end_character) < Number(nativeArgs.start_character)))
    )
      throw new Error("Range end precedes start");
  } else {
    if (profileValue === undefined)
      throw new Error("profile is required for tools without file_path");
    profile = ProfileSchema.parse(profileValue);
  }
  await validateNestedPaths(root, nativeArgs);
  return { root, profile, nativeArgs };
}

export const COMMANDS: Record<Profile, string[]> = {
  typescript: ["typescript-language-server"],
  svelte: ["svelteserver"],
  astro: ["astro-ls"],
  python: ["basedpyright-langserver", "ruff"],
  bash: ["bash-language-server", "shellcheck"],
};
const quote = (value: string) => JSON.stringify(value);
export function renderConfig(
  root: string,
  profile: Profile,
  commands: Record<string, string>,
): string {
  let result = `[workspace]\nroots = [${quote(root)}]\nposition_encodings = ["utf-16"]\n\n`;
  const add = (
    id: string,
    name: string,
    command: string,
    args: string[],
    extensions: string[],
    handles?: string[],
  ) => {
    const binary = commands[command];
    if (!binary) throw new Error(`Missing executable: ${command}`);
    result += `[[lsp_servers]]\nlanguage_id = ${quote(id)}\nname = ${quote(name)}\ncommand = ${quote(binary)}\nargs = [${args.map(quote).join(", ")}]\nfile_patterns = [${extensions.map((e) => quote(`**/*.${e}`)).join(", ")}]\ntimeout_seconds = 30\nrequest_timeout_seconds = 30\n`;
    if (handles) result += `handles = [${handles.map(quote).join(", ")}]\n`;
    result += "\n";
  };
  if (profile === "typescript") {
    add(
      "typescript",
      "typescript",
      "typescript-language-server",
      ["--stdio"],
      ["ts", "tsx", "mts", "cts"],
    );
    add(
      "javascript",
      "javascript",
      "typescript-language-server",
      ["--stdio"],
      ["js", "jsx", "mjs", "cjs"],
    );
  } else if (profile === "svelte") {
    add("svelte", "svelte", "svelteserver", ["--stdio"], ["svelte"]);
    result += '[lsp_servers.env]\nCHOKIDAR_USEPOLLING = "1"\n';
  } else if (profile === "astro") {
    const sdk = commands["typescript-sdk"];
    if (!sdk) throw new Error("Missing JavaScript TypeScript SDK for Astro");
    add("astro", "astro", "astro-ls", ["--stdio"], ["astro"]);
    result += `[lsp_servers.initialization_options.typescript]\ntsdk = ${quote(sdk)}\n`;
  } else if (profile === "python") {
    add("python", "python", "basedpyright-langserver", ["--stdio"], ["py", "pyi", "pyw"]);
    add(
      "python",
      "python-ruff",
      "ruff",
      ["server"],
      ["py", "pyi", "pyw"],
      ["code_actions", "format_document", "format_range"],
    );
  } else add("shellscript", "bash", "bash-language-server", ["start"], ["sh", "bash"]);
  return result;
}
