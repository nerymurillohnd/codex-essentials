import { createRequire } from "node:module";
import childProcess from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const project = require("../scripts/project-bootstrap.cjs") as {
  bootstrapProject(
    options: { organization: string; title: string; dryRun: boolean },
    runner?: (command: string, args: string[]) => string,
  ): { created: boolean; command?: string[]; project?: { title: string } };
  buildProjectSpec(title: string): {
    title: string;
    fields: string[];
    views: string[];
    workflows: string[];
  };
  createCommand(org: string, title: string): string[];
  errorMessage(error: unknown): string;
  execute(command: string, args: string[]): string;
  listCommand(org: string): string[];
  main(): void;
  parseArgs(
    argv: string[],
    environment?: Record<string, string | undefined>,
  ): { organization: string; title: string; dryRun: boolean };
  parseProjectList(output: string): Array<{ title: string }>;
  parseProjectObject(output: string): { title: string };
};

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

describe("GitHub Projects bootstrap", () => {
  it("defines and parses the project contract", () => {
    const spec = project.buildProjectSpec("Codex");
    expect(spec.fields).toContain("Status");
    expect(spec.fields).not.toContain("Release target");
    expect(spec.views).not.toContain("Release readiness");
    expect(
      project.parseArgs(["--org", "community", "--title", "Marketplace"]),
    ).toEqual({
      organization: "community",
      title: "Marketplace",
      dryRun: false,
    });
    expect(() => project.parseArgs([])).toThrow("GITHUB_ORG");
    expect(() => project.parseArgs(["--org"])).toThrow("requires a value");
    expect(
      project.parseArgs(["--org", "org", "--title", "Project", "--dry-run"]),
    ).toEqual({ organization: "org", title: "Project", dryRun: true });
    expect(() =>
      project.parseArgs(["--unknown"], { GITHUB_ORG: "org" }),
    ).toThrow("unknown argument");
    expect(() =>
      project.parseArgs([], { GITHUB_ORG: "org", PROJECT_TITLE: "" }),
    ).toThrow("PROJECT_TITLE cannot be empty");
  });

  it("supports dry runs, reuse, creation, and output validation", () => {
    expect(
      project.bootstrapProject({
        organization: "org",
        title: "Project",
        dryRun: true,
      }).command,
    ).toContain("create");
    const reused = project.bootstrapProject(
      { organization: "org", title: "Project", dryRun: false },
      () => JSON.stringify([{ title: "Project", number: 1 }]),
    );
    expect(reused.project?.title).toBe("Project");
    let calls = 0;
    expect(
      project.bootstrapProject(
        { organization: "org", title: "Project", dryRun: false },
        () =>
          ++calls === 1
            ? "[]"
            : JSON.stringify({ title: "Project", id: "PVT_1" }),
      ).created,
    ).toBe(true);
    expect(project.listCommand("org")).toContain("org");
    expect(project.createCommand("org", "Project")).toContain("Project");
    expect(
      project.execute(process.execPath, ["-e", "process.stdout.write('ok')"]),
    ).toBe("ok");
    expect(project.parseProjectList(JSON.stringify([null, {}]))).toEqual([]);
    expect(() => project.parseProjectList("{}")).toThrow("non-array");
    expect(() => project.parseProjectObject("{}")).toThrow("invalid project");
    expect(project.errorMessage("failure")).toBe("failure");
  });

  it("executes the dry-run and reuse CLI branches", () => {
    const argv = process.argv;
    const org = process.env["GITHUB_ORG"];
    const title = process.env["PROJECT_TITLE"];
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    process.env["GITHUB_ORG"] = "org";
    process.env["PROJECT_TITLE"] = "Project";
    process.argv = [process.execPath, "project-bootstrap.cjs", "--dry-run"];
    project.main();
    vi.spyOn(childProcess, "execFileSync").mockReturnValueOnce(
      '[{"title":"Project","number":1}]' as never,
    );
    process.argv = [process.execPath, "project-bootstrap.cjs"];
    project.main();
    expect(log).toHaveBeenCalled();
    process.argv = argv;
    if (org === undefined) delete process.env["GITHUB_ORG"];
    else process.env["GITHUB_ORG"] = org;
    if (title === undefined) delete process.env["PROJECT_TITLE"];
    else process.env["PROJECT_TITLE"] = title;
  });
});
