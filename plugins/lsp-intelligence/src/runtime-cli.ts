import { resolve } from "node:path";
import { defaultRuntimeRoot, runtimeStatus } from "./backend.ts";
import { PROFILES, ProfileSchema } from "./profiles.ts";
import { installRuntime, rollbackBridge } from "./runtime.ts";

async function main(): Promise<void> {
  const args = process.argv.slice(2),
    command = args.shift();
  let root = defaultRuntimeRoot(),
    profiles = PROFILES;
  for (let i = 0; i < args.length; i++) {
    const flag = args[i],
      value = args[i + 1];
    if (!value) throw new Error("Expected option value");
    if (flag === "--runtime-root") root = resolve(value);
    else if (flag === "--profile")
      profiles = value === "all" ? PROFILES : [ProfileSchema.parse(value)];
    else throw new Error("Unknown runtime option");
    i++;
  }
  if (command === "doctor") console.log(JSON.stringify(await runtimeStatus(root), null, 2));
  else if (command === "install" || command === "update") {
    await installRuntime(root, profiles, command === "update");
    console.log(JSON.stringify(await runtimeStatus(root), null, 2));
  } else if (command === "rollback") {
    await rollbackBridge(root);
    console.log(JSON.stringify(await runtimeStatus(root), null, 2));
  } else
    throw new Error(
      "Usage: node runtime.mjs doctor|install|update|rollback [--profile all|typescript|svelte|astro|python|bash] [--runtime-root PATH]",
    );
}
main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Runtime operation failed"}\n`);
  process.exitCode = 1;
});
