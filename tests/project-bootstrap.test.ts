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
  main(
    args?: string[],
    environment?: Record<string, string | undefined>,
    io?: { error(message: string): void; log(message: string): void },
    runner?: (command: string, args: string[]) => string,
  ): number;
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

  it("executes dry-run, reuse, and failure branches without mutating process state", () => {
    const logs: string[] = [];
    const errors: string[] = [];
    const io = {
      error: (message: string) => errors.push(message),
      log: (message: string) => logs.push(message),
    };
    const environment = { GITHUB_ORG: "org", PROJECT_TITLE: "Project" };

    expect(project.main(["--dry-run"], environment, io)).toBe(0);
    expect(
      project.main(
        [],
        environment,
        io,
        () => '[{"title":"Project","number":1}]',
      ),
    ).toBe(0);
    expect(project.main([], {}, io)).toBe(1);
    expect(logs.join("\n")).toContain("Dry run: gh project create");
    expect(logs.join("\n")).toContain("Reused project: Project");
    expect(errors).toEqual([
      "Project bootstrap failed: GITHUB_ORG is required",
    ]);
  });

  it("preserves binary success and failure exit codes", () => {
    const success = childProcess.spawnSync(
      process.execPath,
      ["scripts/project-bootstrap.cjs", "--dry-run"],
      {
        cwd: require("node:path").resolve(import.meta.dirname, ".."),
        encoding: "utf8",
        env: {
          GITHUB_ORG: "org",
          PROJECT_TITLE: "Project",
          PATH: process.env["PATH"],
        },
      },
    );
    const failure = childProcess.spawnSync(
      process.execPath,
      ["scripts/project-bootstrap.cjs"],
      {
        cwd: require("node:path").resolve(import.meta.dirname, ".."),
        encoding: "utf8",
        env: { PATH: process.env["PATH"] },
      },
    );

    expect(success.status).toBe(0);
    expect(success.stdout).toContain("Dry run: gh project create");
    expect(failure.status).toBe(1);
    expect(failure.stderr).toContain("GITHUB_ORG is required");
  });
});
