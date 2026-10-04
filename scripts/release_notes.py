#!/usr/bin/env python3
"""Print one plugin's changelog section for a GitHub release."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("plugin")
    parser.add_argument("version")
    args = parser.parse_args()
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", args.plugin):
        parser.error("invalid plugin name")
    if not re.fullmatch(r"\d+\.\d+\.\d+", args.version):
        parser.error("invalid version")
    path = ROOT / "plugins" / args.plugin / "CHANGELOG.md"
    if not path.is_file():
        parser.error("changelog is missing")
    content = path.read_text(encoding="utf-8")
    match = re.search(
        rf"(?ms)^## \[{re.escape(args.version)}\] - \d{{4}}-\d{{2}}-\d{{2}}\s*\n(.*?)(?=^## \[|\Z)",
        content,
    )
    if match is None or not match.group(1).strip():
        parser.error("version has no changelog notes")
    print(match.group(1).strip())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
