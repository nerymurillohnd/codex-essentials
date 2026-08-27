import { createRequire } from "node:module";
import childProcess from "node:child_process";
import { afterEach, describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);

interface ProjectModule {
  buildProjectSpec(title: string): {
    title: string;
    fields: string[];
    views: string[];
    workflows: string[];
  };
  parseArgs(
    argv: string[],
    environment?: Record<string, string | undefined>,
  ): {
    organization: string;
    title: string;
    dryRun: boolean;
  };
  bootstrapProject(
    options: { organization: string; title: string; dryRun: boolean },
    runner?: (command: string, args: string[]) => string,
  ): { created: boolean; command?: string[]; project?: { title: string } };
  parseProjectList(output: string): Array<{ title: string }>;
  parseProjectObject(output: string): { title: string };
  listCommand(organization: string): string[];
  createCommand(organization: string, title: string): string[];
  execute(command: string, args: string[]): string;
  main(): void;
  errorMessage(error: unknown): string;
}

const project = require("../scripts/bootstrap_project.cjs") as ProjectModule;

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

describe("GitHub Projects bootstrap", () => {
  it("defines the community project contract", () => {
    const spec = project.buildProjectSpec("Codex Essentials");
    expect(spec.title).toBe("Codex Essentials");
    expect(spec.fields).toEqual(
      expect.arrayContaining([
        "Status",
        "Plugin",
        "Review",
        "Documentation",
        "Security",
        "Release target",
      ]),
    );
    expect(spec.views).toEqual(
      expect.arrayContaining(["Backlog", "Release readiness", "Security"]),
    );
    expect(spec.workflows).toEqual(
      expect.arrayContaining(["auto-add", "closed-to-done", "auto-archive"]),
    );
  });

  it("parses explicit and environment project inputs", () => {
    expect(
      project.parseArgs(["--org", "community", "--title", "Marketplace"]),
    ).toEqual({
      organization: "community",
      title: "Marketplace",
      dryRun: false,
    });
    expect(
      project.parseArgs([], {
        GITHUB_ORG: "community",
        PROJECT_TITLE: "Marketplace",
      }),
    ).toEqual({
      organization: "community",
      title: "Marketplace",
      dryRun: false,
    });
    expect(() => project.parseArgs([])).toThrow("GITHUB_ORG");
    expect(() => project.parseArgs(["--org"])).toThrow("requires a value");
    expect(() =>
      project.parseArgs(["--unknown"], { GITHUB_ORG: "org" }),
    ).toThrow("unknown argument");
    expect(() =>
      project.parseArgs(["--title", ""], { GITHUB_ORG: "org" }),
    ).toThrow("requires a value");
    expect(() =>
      project.parseArgs([], { GITHUB_ORG: "org", PROJECT_TITLE: "" }),
    ).toThrow("cannot be empty");
    expect(
      project.parseArgs(["--org", "org", "--title", "Project", "--dry-run"]),
    ).toEqual({ organization: "org", title: "Project", dryRun: true });
  });

  it("supports dry-run, reuse, and creation without exposing credentials", () => {
    const dryRun = project.bootstrapProject({
      organization: "org",
      title: "Project",
      dryRun: true,
    });
    expect(dryRun.created).toBe(false);
    expect(dryRun.command).toEqual([
      "project",
      "create",
      "--owner",
      "org",
      "--title",
      "Project",
      "--format",
      "json",
    ]);

    const calls: string[][] = [];
    const runner = (_command: string, args: string[]): string => {
      calls.push(args);
      return JSON.stringify([{ title: "Project", number: 1 }]);
    };
    const reused = project.bootstrapProject(
      { organization: "org", title: "Project", dryRun: false },
      runner,
    );
    expect(reused.created).toBe(false);
    expect(reused.project?.title).toBe("Project");
    expect(calls).toHaveLength(1);

    let createCall = 0;
    const createRunner = (_command: string, _args: string[]): string => {
      createCall += 1;
      return createCall === 1
        ? JSON.stringify([])
        : JSON.stringify({ title: "Project", id: "PVT_1" });
    };
    const created = project.bootstrapProject(
      { organization: "org", title: "Project", dryRun: false },
      createRunner,
    );
    expect(created.created).toBe(true);
    expect(created.project?.title).toBe("Project");
    expect(project.listCommand("org")).toContain("org");
    expect(project.createCommand("org", "Project")).toContain("Project");
    expect(
      project.execute(process.execPath, ["-e", "process.stdout.write('ok')"]),
    ).toBe("ok");
    expect(
      project.parseProjectList(JSON.stringify([null, {}, { title: "No id" }])),
    ).toEqual([]);
    expect(() => project.parseProjectList("{}")).toThrow("non-array");
    expect(() => project.parseProjectObject("{}")).toThrow("invalid project");
    expect(project.errorMessage(new Error("failure"))).toBe("failure");
    expect(project.errorMessage("failure")).toBe("failure");
  });

  it("runs the CLI main path for dry-run and reused projects", () => {
    const previousArgv = process.argv;
    const previousOrganization = process.env["GITHUB_ORG"];
    const previousTitle = process.env["PROJECT_TITLE"];
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    try {
      process.env["GITHUB_ORG"] = "org";
      process.env["PROJECT_TITLE"] = "Project";
      process.argv = [process.execPath, "bootstrap_project.cjs", "--dry-run"];
      project.main();
      expect(log).toHaveBeenCalledWith(expect.stringContaining("Dry run:"));

      const runner = vi
        .spyOn(childProcess, "execFileSync")
        .mockReturnValueOnce('[{"title":"Project","number":1}]' as never);
      process.argv = [process.execPath, "bootstrap_project.cjs"];
      project.main();
      expect(runner).toHaveBeenCalled();
      expect(log).toHaveBeenCalledWith(
        expect.stringContaining("Reused project:"),
      );
    } finally {
      process.argv = previousArgv;
      if (previousOrganization === undefined) {
        delete process.env["GITHUB_ORG"];
      } else {
        process.env["GITHUB_ORG"] = previousOrganization;
      }
      if (previousTitle === undefined) {
        delete process.env["PROJECT_TITLE"];
      } else {
        process.env["PROJECT_TITLE"] = previousTitle;
      }
    }
  });
});
