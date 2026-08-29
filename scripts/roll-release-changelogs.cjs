#!/usr/bin/env node
// @ts-check

const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { configuredPaths } = require("./capture-release-please-outputs.cjs");

/** @typedef {{heading: string, body: string, start: number, end: number}} ChangelogSection */

/** @param {string} value */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

/** @param {string} heading */
function isUnreleasedHeading(heading) {
  return /^## \[Unreleased\]\s*$/u.test(heading);
}

/** @param {string} heading @param {string} version */
function isVersionHeading(heading, version) {
  const escaped = escapeRegExp(version);
  return new RegExp(
    `^##\\s+(?:${escaped}\\s+\\(\\d{4}-\\d{2}-\\d{2}\\)|\\[${escaped}\\]\\s+-\\s+\\d{4}-\\d{2}-\\d{2}|\\[${escaped}\\]\\([^\\r\\n)]+\\)\\s+\\(\\d{4}-\\d{2}-\\d{2}\\))\\s*$`,
    "u",
  ).test(heading);
}

/** @param {string} body */
function trimSectionBody(body) {
  return body
    .replace(/^(?:[ \t]*\r?\n)+/u, "")
    .replace(/(?:\r?\n[ \t]*)+$/u, "");
}

/** @param {string} content */
function parseChangelog(content) {
  const headings = [...content.matchAll(/^## .*(?:\r?\n|$)/gmu)].map(
    (match) => ({
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
      heading: match[0].trimEnd(),
    }),
  );
  if (headings.length === 0) {
    return { preamble: content, sections: [] };
  }
  const sections = headings.map((heading, index) => ({
    heading: heading.heading,
    body: content.slice(
      heading.end,
      headings[index + 1]?.start ?? content.length,
    ),
    start: heading.start,
    end: headings[index + 1]?.start ?? content.length,
  }));
  return {
    preamble: content.slice(0, headings[0].start),
    sections,
  };
}

/** @param {ChangelogSection} section @param {string[]} bodies */
function renderSection(section, bodies) {
  const body = bodies.map(trimSectionBody).filter(Boolean).join("\n\n");
  return body ? `${section.heading}\n\n${body}\n` : `${section.heading}\n`;
}

/** @param {string} content @param {string} version */
function rollReleaseChangelog(content, version) {
  const parsed = parseChangelog(content);
  const unreleased = parsed.sections.findIndex((section) =>
    isUnreleasedHeading(section.heading),
  );
  const versionSections = parsed.sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => isVersionHeading(section.heading, version));
  if (unreleased === -1 || versionSections.length === 0) {
    return { changed: false, content };
  }

  const firstVersion = versionSections[0];
  if (!firstVersion) {
    return { changed: false, content };
  }
  const firstVersionIndex = firstVersion.index;
  const duplicateVersionIndexes = new Set(
    versionSections.slice(1).map(({ index }) => index),
  );
  const unreleasedBody = parsed.sections[unreleased]?.body ?? "";
  const duplicateBodies = versionSections
    .slice(1)
    .map(({ section }) => section.body);
  const changed =
    trimSectionBody(unreleasedBody).length > 0 || duplicateBodies.length > 0;
  if (!changed) {
    return { changed: false, content };
  }

  const renderedSections = parsed.sections.flatMap((section, index) => {
    if (index === unreleased) {
      return [renderSection(section, [])];
    }
    if (duplicateVersionIndexes.has(index)) {
      return [];
    }
    if (index === firstVersionIndex) {
      return [
        renderSection(section, [
          unreleasedBody,
          section.body,
          ...duplicateBodies,
        ]),
      ];
    }
    return [content.slice(section.start, section.end).trimEnd() + "\n"];
  });
  const nextContent = `${parsed.preamble}${renderedSections.join("\n")}`;
  return {
    changed: nextContent !== content,
    content: nextContent,
  };
}

/** @param {string[]} args @param {string} defaultRoot */
function parseArguments(args, defaultRoot) {
  let root = defaultRoot;
  let base;
  let head = "HEAD";
  let write = false;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    const value = args[index + 1];
    if (
      argument === "--root" ||
      argument === "--base" ||
      argument === "--head"
    ) {
      if (!value || value.startsWith("--")) {
        throw new Error(usage());
      }
      if (argument === "--root") {
        root = path.resolve(value);
      }
      if (argument === "--base") {
        base = value;
      }
      if (argument === "--head") {
        head = value;
      }
      index += 1;
    } else if (argument === "--write") {
      write = true;
    } else {
      throw new Error(usage());
    }
  }
  if (!base) {
    throw new Error(usage());
  }
  return { root, base, head, write };
}

function usage() {
  return "usage: [--root <repository-root>] --base <ref> [--head <ref>] [--write]";
}

/** @param {string} root @param {string} base @param {string} head */
function changedPaths(root, base, head) {
  const output = childProcess.execFileSync(
    "git",
    ["diff", "--name-only", `${base}...${head}`],
    { cwd: root, encoding: "utf8" },
  );
  return new Set(output.split(/\r?\n/u).filter(Boolean));
}

/** @param {string} root @param {string} pluginPath */
function pluginVersion(root, pluginPath) {
  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(root, pluginPath, ".codex-plugin", "plugin.json"),
      "utf8",
    ),
  );
  if (
    typeof manifest !== "object" ||
    manifest === null ||
    Array.isArray(manifest) ||
    typeof manifest.version !== "string"
  ) {
    throw new Error(`${pluginPath}/.codex-plugin/plugin.json has no version`);
  }
  return manifest.version;
}

/** @param {string} root @param {string} base @param {string} head @param {boolean} write */
function rollReleaseChangelogs(root, base, head, write = false) {
  const changed = changedPaths(root, base, head);
  const rolled = [];
  for (const pluginPath of configuredPaths(root)) {
    const relevant = [...changed].some((filePath) =>
      filePath.startsWith(`${pluginPath}/`),
    );
    if (!relevant) {
      continue;
    }
    const changelogPath = path.join(root, pluginPath, "CHANGELOG.md");
    const content = fs.readFileSync(changelogPath, "utf8");
    const result = rollReleaseChangelog(
      content,
      pluginVersion(root, pluginPath),
    );
    if (!result.changed) {
      continue;
    }
    if (write) {
      fs.writeFileSync(changelogPath, result.content, "utf8");
    }
    rolled.push(path.relative(root, changelogPath).split(path.sep).join("/"));
  }
  return rolled;
}

function main() {
  const options = parseArguments(
    process.argv.slice(2),
    path.resolve(__dirname, ".."),
  );
  const rolled = rollReleaseChangelogs(
    options.root,
    options.base,
    options.head,
    options.write,
  );
  console.log(
    `Rolled ${rolled.length} release changelog${rolled.length === 1 ? "" : "s"}.`,
  );
}

try {
  if (require.main === module) {
    main();
  }
} catch (error) {
  console.error(/** @type {Error} */ (error).message);
  process.exitCode = 1;
}

module.exports = {
  changedPaths,
  parseArguments,
  parseChangelog,
  rollReleaseChangelog,
  rollReleaseChangelogs,
};
