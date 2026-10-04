#!/usr/bin/env python3
"""Scaffold a skills-only plugin and refresh the repository catalog."""

from __future__ import annotations

import argparse
import json
import re
import shutil
from datetime import date
from pathlib import Path

from sync_catalog import main as sync_catalog_main

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("name")
    parser.add_argument("--display-name", required=True)
    parser.add_argument("--description", required=True)
    parser.add_argument(
        "--short-description", required=True, help="Listing subtitle, at most 30 characters"
    )
    parser.add_argument("--author", required=True)
    args = parser.parse_args()
    if len(args.name) > 64 or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", args.name):
        parser.error("name must be lowercase kebab-case and at most 64 characters")
    if any(
        not value.strip() or "\n" in value
        for value in (args.display_name, args.description, args.short_description, args.author)
    ):
        parser.error("metadata values must be nonempty single lines")
    if len(args.short_description) > 30:
        parser.error("short description must be at most 30 characters")
    target = ROOT / "plugins" / args.name
    if target.exists():
        parser.error("plugin already exists")
    shutil.copytree(ROOT / "templates" / "skills-only", target)
    shutil.copyfile(ROOT / "LICENSE", target / "LICENSE")
    changelog = (ROOT / "templates" / "changelog" / "CHANGELOG.md").read_text(encoding="utf-8")
    (target / "CHANGELOG.md").write_text(
        changelog.replace("YYYY-MM-DD", date.today().isoformat()), encoding="utf-8"
    )
    manifest_path = target / "plugin.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest["name"] = args.name
    manifest["description"] = args.description
    manifest["author"]["name"] = args.author
    interface = manifest["extensions"]["com.openai"]["interface"]
    interface["displayName"] = args.display_name
    interface["shortDescription"] = args.short_description
    interface["longDescription"] = args.description
    interface["developerName"] = args.author
    manifest_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    sync_catalog_main(["--write"])
    print(f"Created plugins/{args.name}; complete README.md and replace the example skill.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
