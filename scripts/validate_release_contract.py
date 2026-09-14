#!/usr/bin/env python3
"""Validate Release Please configuration for every marketplace plugin."""

# ruff: noqa: C901, D103, TRY003, TRY004

from __future__ import annotations

import json
from pathlib import Path
import re
import sys
from typing import cast

CONFIG_PATH = Path("release-please-config.json")
MANIFEST_PATH = Path(".release-please-manifest.json")
PLUGINS_PATH = Path("plugins")
WORKFLOW_PATH = Path(".github") / "workflows" / "release-please.yml"
BOOTSTRAP_SHA = "86127842c7629bd1a4c38b4113e8d034f346ff4f"
SEMVER_CORE = r"^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)"
SEMVER_PRERELEASE = r"(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?"
SEMVER_BUILD = r"(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$"
SEMVER_PATTERN = re.compile(SEMVER_CORE + SEMVER_PRERELEASE + SEMVER_BUILD)
TAG_PATTERN = re.compile(r"^plugin/([a-z0-9]+(?:-[a-z0-9]+)*)/v(.+)$")
FORBIDDEN_WORKFLOW_TERMS = (
    "npm publish",
    "gh release upload",
    "actions/upload-artifact",
    "softprops/action-gh-release",
)

JsonObject = dict[str, object]


def main(args: list[str] | None = None) -> None:
    root, tag = parse_arguments(sys.argv[1:] if args is None else args)
    plugin_versions = load_plugin_versions(root)
    config = load_object(root / CONFIG_PATH, str(CONFIG_PATH))
    release_manifest = load_object(root / MANIFEST_PATH, str(MANIFEST_PATH))
    validate_config(config, plugin_versions)
    validate_release_manifest(release_manifest, plugin_versions)
    validate_workflow(root / WORKFLOW_PATH)
    if tag is not None:
        validate_tag(tag, plugin_versions)
    print(f"Validated Release Please contract for {len(plugin_versions)} plugin.")


def parse_arguments(args: list[str]) -> tuple[Path, str | None]:
    root = Path(__file__).resolve().parents[1]
    tag: str | None = None
    index = 0
    while index < len(args):
        argument = args[index]
        if argument == "--root" and index + 1 < len(args):
            root = Path(args[index + 1]).resolve()
            index += 2
            continue
        if argument == "--tag" and index + 1 < len(args):
            tag = args[index + 1]
            index += 2
            continue
        raise ValueError("usage: --root <repository-root> [--tag <plugin/id/vX.Y.Z>]")
    return root, tag


def load_plugin_versions(root: Path) -> dict[str, str]:
    plugins_root = root / PLUGINS_PATH
    if not plugins_root.is_dir():
        raise ValueError("plugins directory is missing")
    versions: dict[str, str] = {}
    for plugin_root in sorted(path for path in plugins_root.iterdir() if path.is_dir()):
        manifest = load_object(plugin_root / "plugin.json", f"{plugin_root}/plugin.json")
        name = require_string(manifest, "name", f"{plugin_root}/plugin.json")
        version = require_string(manifest, "version", f"{plugin_root}/plugin.json")
        if plugin_root.name != name:
            raise ValueError(f"plugin directory must match manifest name: {plugin_root.name}")
        validate_semver(version, f"{plugin_root}/plugin.json version")
        versions[f"plugins/{name}"] = version
    if not versions:
        raise ValueError("plugins directory must contain at least one plugin")
    return versions


def validate_config(config: JsonObject, plugin_versions: dict[str, str]) -> None:
    bootstrap_sha = require_string(config, "bootstrap-sha", str(CONFIG_PATH))
    if bootstrap_sha != BOOTSTRAP_SHA:
        raise ValueError("release config bootstrap-sha must match the approved baseline")
    if config.get("release-type") != "go":
        raise ValueError("release config release-type must be go")
    if config.get("include-component-in-tag") is not True:
        raise ValueError("release config must include component in tags")
    if config.get("include-v-in-tag") is not True:
        raise ValueError("release config must include v in tags")
    if config.get("tag-separator") != "/":
        raise ValueError("release config tag-separator must be /")
    if config.get("separate-pull-requests") is not True:
        raise ValueError("release config must create separate plugin pull requests")
    packages = require_object(config, "packages", str(CONFIG_PATH))
    if set(packages) != set(plugin_versions):
        raise ValueError("release config must cover exactly every plugin path")
    for path in plugin_versions:
        package = as_object(packages[path], f"release config package {path}")
        plugin_id = path.removeprefix("plugins/")
        if package.get("component") != f"plugin/{plugin_id}":
            raise ValueError(f"release config component must be plugin/{plugin_id}")
        if package.get("package-name") != plugin_id:
            raise ValueError(f"release config package-name must be {plugin_id}")
        if package.get("changelog-path") != "CHANGELOG.md":
            raise ValueError(f"release config changelog-path must be CHANGELOG.md for {path}")
        extra_files = package.get("extra-files")
        if extra_files != [{"type": "json", "path": "plugin.json", "jsonpath": "$.version"}]:
            raise ValueError(f"release config must update {path}/plugin.json version")


def validate_release_manifest(
    release_manifest: JsonObject, plugin_versions: dict[str, str]
) -> None:
    if set(release_manifest) != set(plugin_versions):
        raise ValueError("release manifest must cover exactly every plugin path")
    for path, version in plugin_versions.items():
        manifest_version = release_manifest[path]
        if manifest_version != version:
            raise ValueError(f"release manifest version must match {path}/plugin.json")


def validate_workflow(path: Path) -> None:
    if not path.is_file():
        raise ValueError(f"release workflow is missing: {WORKFLOW_PATH}")
    content = path.read_text(encoding="utf-8")
    validate_workflow_token(content)
    validate_workflow_permissions(content)
    normalized = content.lower()
    if any(term in normalized for term in FORBIDDEN_WORKFLOW_TERMS):
        raise ValueError("release workflow must not publish packages or upload assets")
    required_fragments = (
        "googleapis/release-please-action@v5",
        "${{ secrets.GITHUB_TOKEN }}",
        "config-file: release-please-config.json",
        "manifest-file: .release-please-manifest.json",
        "contents: write",
        "issues: write",
        "pull-requests: write",
        "branches:\n      - main",
    )
    for fragment in required_fragments:
        if fragment not in content:
            raise ValueError(f"release workflow is missing required configuration: {fragment}")
    action_steps = re.findall(r"^\s*-\s+uses:\s*([^\s]+)", content, flags=re.MULTILINE)
    if action_steps != ["googleapis/release-please-action@v5"] or "run:" in content:
        raise ValueError("release workflow must contain exactly one action step")


def validate_workflow_permissions(content: str) -> None:
    match = re.search(r"^permissions:\n((?:  [^\n]+\n)+)", content, flags=re.MULTILINE)
    if match is None:
        raise ValueError("release workflow permissions block is missing")
    permissions = {
        key.strip(): value.strip()
        for line in match.group(1).splitlines()
        if ":" in line
        for key, value in [line.split(":", 1)]
    }
    expected = {"contents": "write", "issues": "write", "pull-requests": "write"}
    if permissions != expected:
        raise ValueError(
            "release workflow permissions must be exactly contents, issues, and pull-requests"
        )


def validate_workflow_token(content: str) -> None:
    secret_references = re.findall(r"secrets\.([A-Za-z0-9_]+)", content)
    if secret_references != ["GITHUB_TOKEN"]:
        raise ValueError("release workflow must use only the repository GITHUB_TOKEN")


def validate_tag(tag: str, plugin_versions: dict[str, str]) -> None:
    match = TAG_PATTERN.fullmatch(tag)
    if match is None:
        raise ValueError("release tag must match plugin/<plugin-id>/v<semver>")
    plugin_id, version = match.groups()
    path = f"plugins/{plugin_id}"
    if path not in plugin_versions:
        raise ValueError(f"release tag references unknown plugin: {plugin_id}")
    validate_semver(version, "release tag version")
    if plugin_versions[path] != version:
        raise ValueError(f"release tag version must match {path}/plugin.json")


def validate_semver(version: str, label: str) -> None:
    if SEMVER_PATTERN.fullmatch(version) is None:
        raise ValueError(f"{label} must be valid SemVer")


def load_object(path: Path, label: str) -> JsonObject:
    try:
        raw = cast("object", json.loads(path.read_text(encoding="utf-8")))
    except OSError as error:
        raise ValueError(f"{label} is missing") from error
    except json.JSONDecodeError as error:
        raise ValueError(f"{label} is invalid JSON: {error.msg}") from error
    return as_object(raw, label)


def require_string(record: JsonObject, key: str, label: str) -> str:
    value = record.get(key)
    if not isinstance(value, str) or not value:
        raise ValueError(f"{label} {key} must be a non-empty string")
    return value


def require_object(record: JsonObject, key: str, label: str) -> JsonObject:
    if key not in record:
        raise ValueError(f"{label} is missing {key}")
    return as_object(record[key], f"{label} {key}")


def as_object(value: object, label: str) -> JsonObject:
    if not isinstance(value, dict):
        raise ValueError(f"{label} must be a JSON object")
    return cast("JsonObject", value)


def run() -> int:
    try:
        main()
    except Exception as error:  # noqa: BLE001 - command-line validator reports contract failures.
        print(str(error) or error.__class__.__name__, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(run())
