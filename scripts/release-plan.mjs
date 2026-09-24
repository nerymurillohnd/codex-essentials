import semver from "semver";

const pluginIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const shaPattern = /^[0-9a-f]{40}$/;

export function tagFor(name, version) {
  if (!pluginIdPattern.test(name))
    throw new Error(`invalid plugin ID: ${name}`);
  if (!semver.valid(version))
    throw new Error(`invalid plugin version: ${version}`);
  return `codex-essentials/${name}/v${version}`;
}

export function releaseNotes(changelog, version) {
  if (!semver.valid(version))
    throw new Error(`invalid plugin version: ${version}`);
  const escaped = version.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const heading = new RegExp(`^## \\[${escaped}\\][^\\n]*$`, "m");
  const match = heading.exec(changelog);
  if (match === null)
    throw new Error(`changelog is missing release section ${version}`);
  const start = match.index + match[0].length;
  const next = /^## \[/m.exec(changelog.slice(start));
  const body = changelog
    .slice(start, next === null ? undefined : start + next.index)
    .trim();
  if (body === "")
    throw new Error(`changelog release section ${version} is empty`);
  return body;
}

export function planPackageRelease({
  name,
  version,
  headSha,
  previousVersion = null,
  bootstrap = false,
  tagSha = null,
  release = null,
}) {
  const tag = tagFor(name, version);
  if (!shaPattern.test(headSha))
    throw new Error(`invalid main SHA: ${headSha}`);
  if (tagSha !== null && !shaPattern.test(tagSha))
    throw new Error(`invalid tag SHA: ${tagSha}`);
  if (bootstrap && version !== "0.1.0") {
    throw new Error(`${name}: bootstrap requires the initial 0.1.0 version`);
  }
  if (release !== null && tagSha === null) {
    throw new Error(`${tag}: GitHub Release exists without a tag ref`);
  }
  if (tagSha !== null && bootstrap && tagSha !== headSha) {
    throw new Error(`${tag}: bootstrap tag points at the wrong SHA`);
  }
  if (release !== null) {
    if (release.tagName !== tag || release.targetSha !== tagSha) {
      throw new Error(
        `${tag}: GitHub Release conflicts with tag identity or SHA`,
      );
    }
  }
  if (tagSha === null && !bootstrap && previousVersion === version) {
    throw new Error(`${tag}: version is unchanged at the current commit`);
  }
  return {
    tag,
    targetSha: tagSha ?? headSha,
    createTag: tagSha === null,
    createRelease: release === null,
  };
}
