#!/usr/bin/env python3
"""Check issue form labels against the repository label catalog."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GITHUB = ROOT / ".github"


def main() -> int:
    errors: list[str] = []
    catalog = (GITHUB / "labels.yml").read_text(encoding="utf-8")
    names = re.findall(r'(?m)^- name: "([^"]+)"\s*$', catalog)
    if len(names) != len(set(names)):
        errors.append("labels.yml: duplicate label name")
    if not names:
        errors.append("labels.yml: no labels defined")
    for path in sorted((GITHUB / "ISSUE_TEMPLATE").glob("*.yml")):
        if path.name == "config.yml":
            continue
        content = path.read_text(encoding="utf-8")
        for field in ("name", "description", "body"):
            if not re.search(rf"(?m)^{field}:.*$", content):
                errors.append(f"{path.name}: missing {field}")
        label_line = re.search(r"(?m)^labels: (\[.*\])\s*$", content)
        if label_line is None:
            errors.append(f"{path.name}: missing labels list")
            continue
        try:
            applied = json.loads(label_line.group(1))
        except json.JSONDecodeError:
            errors.append(f"{path.name}: labels list must use quoted JSON strings")
            continue
        for label in applied:
            if label not in names:
                errors.append(f"{path.name}: undefined label: {label}")
    for error in errors:
        print(error, file=sys.stderr)
    if errors:
        print(f"Issue configuration failed: {len(errors)} error(s).", file=sys.stderr)
        return 1
    print(f"Validated {len(names)} labels and issue form references.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
