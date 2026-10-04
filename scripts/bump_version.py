#!/usr/bin/env python3
"""Bump one plugin's stable semantic version and start its changelog entry."""

from __future__ import annotations

import argparse
import json
import re
from datetime import date
from pathlib import Path

from sync_catalog import main as sync_catalog_main

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plugin", help="Plugin directory name")
    parser.add_argument("level", choices=("major", "minor", "patch"))
    parser.add_argument("--summary", help="Fallback note when Unreleased has no changes")
    args = parser.parse_args()
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", args.plugin):
        parser.error("plugin must be a lowercase kebab-case name")
    if args.summary is not None and (not args.summary.strip() or "\n" in args.summary):
        parser.error("summary must be one nonempty line")
    directory = ROOT / "plugins" / args.plugin
    manifest_path = directory / "plugin.json"
    changelog_path = directory / "CHANGELOG.md"
    if not manifest_path.is_file() or not changelog_path.is_file():
        parser.error("plugin.json and CHANGELOG.md must exist")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    old = manifest.get("version", "")
    if not re.fullmatch(r"(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)", old):
        parser.error("current version must be a stable semantic version")
    major, minor, patch = map(int, old.split("."))
    if args.level == "major":
        major, minor, patch = major + 1, 0, 0
    elif args.level == "minor":
        minor, patch = minor + 1, 0
    else:
        patch += 1
    new = f"{major}.{minor}.{patch}"
    changelog = changelog_path.read_text(encoding="utf-8")
    if not re.search(rf"(?m)^## \[{re.escape(old)}\] - \d{{4}}-\d{{2}}-\d{{2}}\s*$", changelog):
        parser.error("current version is missing from CHANGELOG.md")
    if f"## [{new}]" in changelog:
        parser.error("next version already exists in CHANGELOG.md")
    unreleased = re.search(r"(?ms)^## \[Unreleased\]\s*\n(.*?)(?=^## \[|\Z)", changelog)
    if unreleased is None:
        parser.error("CHANGELOG.md must have an Unreleased section")
    notes = unreleased.group(1).strip()
    if not notes:
        if args.summary is None:
            parser.error("add Unreleased notes or provide --summary")
        notes = f"### Changed\n\n- {args.summary.strip()}"
    elif args.summary is not None:
        parser.error("--summary would duplicate existing Unreleased notes")
    if not re.search(r"(?m)^### (Added|Changed|Deprecated|Removed|Fixed|Security)\s*$", notes):
        parser.error("Unreleased notes need a Keep a Changelog category heading")
    entry = f"## [Unreleased]\n\n## [{new}] - {date.today().isoformat()}\n\n{notes}\n\n"
    changelog = changelog[: unreleased.start()] + entry + changelog[unreleased.end() :]
    manifest["version"] = new
    manifest_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    changelog_path.write_text(changelog, encoding="utf-8")
    sync_catalog_main(["--write"])
    print(f"{args.plugin}: {old} → {new}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
