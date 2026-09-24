export const launchIds = [
  "agents-md-master",
  "astro-cli-commands",
  "automatic-pr-lifecycle",
  "block-no-verify",
  "configure-prettier",
  "doc-keeper",
  "hook-creator",
  "live-research",
  "optimize-memories",
  "prettier-after-edit",
  "prompt-architect",
  "repo-hygiene",
  "repo-maintenance",
  "ruff-after-edit",
  "shellcheck-after-edit",
  "skill-design-standards",
  "svelte-development",
  "system-ops-audit",
  "typescript-pro",
  "verify-completion",
];

const expectedIds = new Set(launchIds);

export function assertExpectedPackages(packages) {
  const observed = new Set(packages.map((item) => item.name));
  const missing = launchIds.filter((id) => !observed.has(id));
  const extra = [...observed].filter((id) => !expectedIds.has(id));
  if (missing.length || extra.length || packages.length !== expectedIds.size) {
    throw new Error(
      `expected exactly 20 products; missing=${missing.join(",") || "none"}; extra=${extra.join(",") || "none"}`,
    );
  }
  for (const item of packages) {
    if (item.version !== "0.1.0")
      throw new Error(`${item.name}: expected first version 0.1.0`);
  }
}
