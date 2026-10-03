#!/usr/bin/env python3
"""Build a self-contained ZIP for a versioned plugin release."""

from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from pathlib import Path

from validate import validate_plugin

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plugin")
    parser.add_argument("--output-dir", type=Path, default=ROOT / "dist")
    args = parser.parse_args()
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", args.plugin):
        parser.error("plugin must be a lowercase kebab-case name")
    directory = ROOT / "plugins" / args.plugin
    if not directory.is_dir():
        parser.error("plugin directory does not exist")
    errors: list[str] = []
    validate_plugin(directory, errors)
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    manifest = json.loads((directory / "plugin.json").read_text(encoding="utf-8"))
    version = manifest["version"]
    args.output_dir.mkdir(parents=True, exist_ok=True)
    archive = args.output_dir / f"{args.plugin}-v{version}.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as zip_file:
        for path in sorted(directory.rglob("*")):
            if path.is_file():
                zip_file.write(path, arcname=f"{args.plugin}/{path.relative_to(directory)}")
    print(archive)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
