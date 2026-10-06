#!/usr/bin/env python3
"""Render or check manifest-backed catalog and plugin README metadata."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]


def replace_region(path: Path, start: str, end: str, body: str, write: bool) -> bool:
    content = path.read_text(encoding="utf-8")
    pattern = re.compile(rf"(?s)({re.escape(start)}\n).*?(\n{re.escape(end)})")
    if len(pattern.findall(content)) != 1:
        raise ValueError(f"{path.relative_to(ROOT)}: expected one generated region")
    updated = pattern.sub(lambda match: f"{match.group(1)}{body}{match.group(2)}", content)
    if updated == content:
        return True
    if write:
        path.write_text(updated, encoding="utf-8")
    return False


def safe_cell(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", " ").strip()


def badge(label: str, value: str, color: str = "blue") -> str:
    return f"https://img.shields.io/badge/{quote(label, safe='')}-{quote(value, safe='')}-{color}"


def skill_rows(directory: Path) -> list[str]:
    rows: list[str] = []
    for skill in sorted((directory / "skills").glob("*/SKILL.md")):
        content = skill.read_text(encoding="utf-8")
        frontmatter = (
            content.split("---\n", 2)[1]
            if content.startswith("---\n") and "---\n" in content[4:]
            else ""
        )
        match = re.search(r"(?m)^description:\s*(.+)$", frontmatter)
        description = (
            match.group(1).strip().strip("\"'") if match else "Description missing in SKILL.md"
        )
        rows.append(
            f"| [{skill.parent.name}](skills/{skill.parent.name}/SKILL.md) | {safe_cell(description)} |"
        )
    return rows


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true")
    mode.add_argument("--check", action="store_true")
    args = parser.parse_args(argv)
    rows: list[str] = []
    entries: list[dict] = []
    stale: list[str] = []
    for directory in sorted((ROOT / "plugins").iterdir()):
        if not directory.is_dir():
            continue
        manifest = json.loads((directory / "plugin.json").read_text(encoding="utf-8"))
        interface = manifest.get("extensions", {}).get("com.openai", {}).get("interface", {})
        display_name = interface.get("displayName") or manifest["name"]
        description = manifest["description"]
        version = manifest["version"]
        readme = directory / "README.md"
        if not readme.is_file():
            raise ValueError(f"{readme.relative_to(ROOT)}: missing README")
        skills = skill_rows(directory)
        mcp_path = directory / "mcp.json"
        has_mcp = mcp_path.is_file()
        badges = [f"[![Version: {version}]({badge('version', version)})](CHANGELOG.md)"]
        license_name = manifest.get("license")
        if isinstance(license_name, str) and license_name:
            badges.append(
                f"[![License: {license_name}]({badge('license', license_name, 'green')})](LICENSE)"
            )
        badges.append(
            f"[![Skills: {len(skills)}]({badge('skills', str(len(skills)), 'informational')})](#capabilities)"
        )
        if has_mcp:
            badges.append(
                f"[![MCP: included]({badge('MCP', 'included', 'brightgreen')})](mcp.json)"
            )
        body = f"# {display_name}\n\n{description}\n\n" + " ".join(badges)
        if not replace_region(
            readme, "<!-- plugin-meta:start -->", "<!-- plugin-meta:end -->", body, args.write
        ):
            stale.append(str(readme.relative_to(ROOT)))
        capability_rows = skills or ["| No bundled skills | This plugin uses MCP tools directly. |"]
        capability = "| Skill | Workflow |\n| --- | --- |\n" + "\n".join(capability_rows)
        if has_mcp:
            mcp = json.loads(mcp_path.read_text(encoding="utf-8"))
            servers = ", ".join(sorted(mcp.get("mcpServers", {}))) or "No servers declared"
            capability += f"\n\n**MCP connection:** [{safe_cell(servers)}](mcp.json)."
        if not replace_region(
            readme,
            "<!-- plugin-capabilities:start -->",
            "<!-- plugin-capabilities:end -->",
            capability,
            args.write,
        ):
            stale.append(str(readme.relative_to(ROOT)))
        rows.append(
            f"| [{safe_cell(display_name)}](plugins/{directory.name}/README.md) | {safe_cell(description)} | {version} |"
        )
        entries.append(
            {
                "name": directory.name,
                "source": {"source": "local", "path": f"./plugins/{directory.name}"},
                "policy": {"installation": "AVAILABLE", "authentication": "ON_INSTALL"},
                "category": interface.get("category", "Productivity"),
            }
        )
    catalog = f"![Plugins: {len(rows)}]({badge('plugins', str(len(rows)), 'informational')})\n\n"
    catalog += (
        "| Plugin | Purpose | Version |\n| --- | --- | --- |\n" + "\n".join(rows)
        if rows
        else "No plugins have been added yet."
    )
    if not replace_region(
        ROOT / "README.md", "<!-- catalog:start -->", "<!-- catalog:end -->", catalog, args.write
    ):
        stale.append("README.md")
    marketplace_path = ROOT / ".agents" / "plugins" / "marketplace.json"
    marketplace = {
        "name": "codex-essentials",
        "interface": {"displayName": "Codex Essentials"},
        "plugins": entries,
    }
    expected = json.dumps(marketplace, indent=2, ensure_ascii=False) + "\n"
    actual = marketplace_path.read_text(encoding="utf-8") if marketplace_path.is_file() else ""
    if actual != expected:
        stale.append(str(marketplace_path.relative_to(ROOT)))
        if args.write:
            marketplace_path.parent.mkdir(parents=True, exist_ok=True)
            marketplace_path.write_text(expected, encoding="utf-8")
    if stale and args.check:
        print("Generated content is stale: " + ", ".join(stale), file=sys.stderr)
        print("Run: python3 scripts/sync_catalog.py --write", file=sys.stderr)
        return 1
    print(f"Catalog {'updated' if args.write else 'current'}: {len(rows)} plugin(s).")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, KeyError, TypeError) as exc:
        print(exc, file=sys.stderr)
        raise SystemExit(1) from exc
