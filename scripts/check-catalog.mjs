import { fileURLToPath } from "node:url";
import { buildCatalog } from "./build-catalog.mjs";

const result = buildCatalog(fileURLToPath(new URL("..", import.meta.url)), {
  check: true,
});
process.stdout.write(
  `Validated ${result.outputs.length} output(s) from ${result.packages.length} package(s).\n`,
);
