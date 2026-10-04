#!/usr/bin/env python3
"""Validate the local Codex Essentials plugin layout without dependencies."""

from __future__ import annotations

from datetime import date
import html
import json
from pathlib import Path
import re
import sys
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
PLUGINS = ROOT / "plugins"
NAME = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
VERSION = re.compile(
    r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$"
)
FORBIDDEN_RELEASE_NAMES = {
    ".ds_store",
    ".git",
    ".pytest_cache",
    ".ruff_cache",
    ".venv",
    "__pycache__",
    "dist",
    "node_modules",
}
FORBIDDEN_RELEASE_SUFFIXES = (".key", ".p12", ".pem", ".pfx", ".zip", ".tar.gz")


def fail(errors: list[str], path: Path, message: str) -> None:
    errors.append(f"{path.relative_to(ROOT)}: {message}")


def read_json(path: Path, errors: list[str]) -> dict | None:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        fail(errors, path, str(exc))
        return None
    if not isinstance(value, dict):
        fail(errors, path, "must contain a JSON object")
        return None
    return value


def markdown_anchors(path: Path) -> set[str]:
    """Collect GitHub-style ATX heading and explicit HTML anchors."""
    anchors: set[str] = set()
    counts: dict[str, int] = {}
    fence: str | None = None
    for line in path.read_text(encoding="utf-8").splitlines():
        marker = re.match(r"^ {0,3}(`{3,}|~{3,})", line)
        if marker:
            chars = marker.group(1)
            if fence is None:
                fence = chars
            elif chars[0] == fence[0] and len(chars) >= len(fence):
                fence = None
            continue
        if fence is not None:
            continue
        for custom in re.findall(
            r'<a\s+[^>]*\b(?:name|id)=["\']([^"\']+)["\']', line, re.IGNORECASE
        ):
            anchors.add(custom)
        heading = re.match(r"^ {0,3}#{1,6}(?:[ \t]+|$)(.*)$", line)
        if heading is None:
            continue
        title = re.sub(r"\s+#+\s*$", "", heading.group(1).strip())
        title = re.sub(r"!?\[([^]]+)\]\([^)]+\)", r"\1", title)
        title = html.unescape(title).replace("`", "").replace("*", "").replace("_", "")
        slug = "".join(char for char in title.lower() if char.isalnum() or char in "- ")
        slug = slug.replace(" ", "-")
        count = counts.get(slug, 0)
        anchors.add(f"{slug}-{count}" if count else slug)
        counts[slug] = count + 1
    return anchors


def validate_relative_links(path: Path, errors: list[str]) -> None:
    """Check local Markdown link targets and common heading fragments."""
    content = path.read_text(encoding="utf-8")
    for raw_target in re.findall(r"(?<!!)\]\(([^)]+)\)", content):
        target = raw_target.strip()
        if re.match(r"^[a-z][a-z0-9+.-]*:", target, re.IGNORECASE):
            continue
        target_path, separator, fragment = target.partition("#")
        linked = (path.parent / unquote(target_path)).resolve() if target_path else path
        if not linked.is_relative_to(ROOT) or not linked.exists():
            fail(errors, path, f"broken relative link: {target_path}")
        elif (
            separator
            and linked.suffix.lower() == ".md"
            and unquote(fragment) not in markdown_anchors(linked)
        ):
            fail(errors, path, f"broken relative anchor: {target}")


def validate_plugin(directory: Path, errors: list[str]) -> None:
    manifest_path = directory / "plugin.json"
    if not manifest_path.is_file():
        fail(errors, directory, "missing plugin.json")
        return
    manifest = read_json(manifest_path, errors)
    if manifest is None:
        return
    name = directory.name
    if len(name) > 64 or not NAME.fullmatch(name):
        fail(errors, directory, "directory name must be kebab-case and at most 64 characters")
    if manifest.get("name") != name:
        fail(errors, manifest_path, "name must match directory name")
    if manifest.get("$schema") != "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json":
        fail(errors, manifest_path, "expected Agent Plugins 1.0 schema")
    if not isinstance(manifest.get("version"), str) or not VERSION.fullmatch(manifest["version"]):
        fail(errors, manifest_path, "version must be semantic version")
    if not isinstance(manifest.get("description"), str) or not manifest["description"].strip():
        fail(errors, manifest_path, "description is required")
    license_path = directory / "LICENSE"
    if not license_path.is_file() or not license_path.read_text(encoding="utf-8").strip():
        fail(errors, directory, "missing nonempty LICENSE")
    readme_path = directory / "README.md"
    if not readme_path.is_file():
        fail(errors, directory, "missing README.md")
    else:
        readme = readme_path.read_text(encoding="utf-8")
        validate_relative_links(readme_path, errors)
        for heading in (
            "## Overview",
            "## Capabilities",
            "## Requirements",
            "## Installation",
            "## Usage",
            "## Verification",
            "## Updates and removal",
            "## Limitations",
            "## License",
            "## Related",
        ):
            if heading not in readme:
                fail(errors, readme_path, f"missing {heading} section")
        if re.search(r"\{\{[A-Z][A-Z0-9_]*\}\}", readme):
            fail(errors, readme_path, "replace all README placeholders")
        if "<!-- Optional:" in readme:
            fail(errors, readme_path, "remove optional template guidance")
    changelog_path = directory / "CHANGELOG.md"
    if not changelog_path.is_file():
        fail(errors, directory, "missing CHANGELOG.md")
    else:
        changelog = changelog_path.read_text(encoding="utf-8")
        if not re.search(r"(?m)^## \[Unreleased\]\s*$", changelog):
            fail(errors, changelog_path, "missing Unreleased section")
        match = re.search(
            rf"(?m)^## \[{re.escape(str(manifest.get('version')))}\] - (\d{{4}}-\d{{2}}-\d{{2}})\s*$",
            changelog,
        )
        if match is None:
            fail(errors, changelog_path, "missing dated section for manifest version")
        else:
            try:
                date.fromisoformat(match.group(1))
            except ValueError:
                fail(errors, changelog_path, "release date is invalid")
        if "YYYY-MM-DD" in changelog:
            fail(errors, changelog_path, "template content remains")
        if "- Initial plugin release." in changelog:
            fail(errors, changelog_path, "replace the template's initial-release note")
    if any(key in manifest for key in ("skills", "mcpServers", "apps", "interface")):
        fail(errors, manifest_path, "portable capabilities belong in fixed files or extensions")
    extensions = manifest.get("extensions")
    if extensions is not None and not isinstance(extensions, dict):
        fail(errors, manifest_path, "extensions must be an object")
        extensions = {}
    openai = (extensions or {}).get("com.openai", {})
    if not isinstance(openai, dict):
        fail(errors, manifest_path, "extensions.com.openai must be an object")
        openai = {}
    interface = openai.get("interface", {})
    if not isinstance(interface, dict):
        fail(errors, manifest_path, "interface must be an object")
        interface = {}
    if interface:
        subtitle = interface.get("shortDescription")
        if not isinstance(subtitle, str) or not 1 <= len(subtitle) <= 30:
            fail(errors, manifest_path, "shortDescription must be 1–30 characters")
        if any(isinstance(value, str) and "Replace" in value for value in interface.values()):
            fail(errors, manifest_path, "replace template interface metadata")
    skills_dir = directory / "skills"
    if not skills_dir.exists() and not (directory / "mcp.json").is_file():
        fail(errors, directory, "plugin needs at least one skill or MCP connection")
    if skills_dir.exists():
        for skill_dir in sorted(skills_dir.iterdir()):
            if not skill_dir.is_dir():
                fail(errors, skill_dir, "skills entries must be directories")
                continue
            skill_file = skill_dir / "SKILL.md"
            if skill_dir.name == "example-workflow":
                fail(errors, skill_dir, "replace the example workflow")
            if not skill_file.is_file():
                fail(errors, skill_dir, "missing SKILL.md")
                continue
            content = skill_file.read_text(encoding="utf-8")
            if not content.startswith("---\n") or "\n---\n" not in content[4:]:
                fail(errors, skill_file, "missing YAML frontmatter")
                continue
            frontmatter = content.split("---\n", 2)[1]
            if not re.search(rf"(?m)^name:\s*{re.escape(skill_dir.name)}\s*$", frontmatter):
                fail(errors, skill_file, "frontmatter name must match skill directory")
            if not re.search(r"(?m)^description:\s*\S", frontmatter):
                fail(errors, skill_file, "frontmatter description is required")
    mcp_path = directory / "mcp.json"
    if mcp_path.exists():
        mcp = read_json(mcp_path, errors)
        if mcp is not None and not isinstance(mcp.get("mcpServers"), dict):
            fail(errors, mcp_path, "mcpServers must be an object")
    for path in directory.rglob("*"):
        if path.is_symlink():
            fail(errors, path, "symlinks are not allowed in distributable plugins")
        lower_name = path.name.lower()
        if (
            lower_name in FORBIDDEN_RELEASE_NAMES
            or lower_name == ".env"
            or (lower_name.startswith(".env.") and lower_name != ".env.example")
            or lower_name.endswith(FORBIDDEN_RELEASE_SUFFIXES)
        ):
            fail(errors, path, "forbidden release file or directory")


def main() -> int:
    errors: list[str] = []
    documentation = [*ROOT.glob("*.md"), *ROOT.joinpath("docs").rglob("*.md")]
    documentation.extend(
        (ROOT / "plugins" / "README.md", ROOT / ".github" / "PULL_REQUEST_TEMPLATE.md")
    )
    for path in sorted(documentation):
        validate_relative_links(path, errors)
    directories = sorted(path for path in PLUGINS.iterdir() if path.is_dir())
    for directory in directories:
        validate_plugin(directory, errors)
    for error in errors:
        print(error, file=sys.stderr)
    if errors:
        print(f"Validation failed: {len(errors)} error(s).", file=sys.stderr)
        return 1
    print(f"Validated {len(directories)} plugin(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
