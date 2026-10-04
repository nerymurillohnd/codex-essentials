#!/usr/bin/env python3
"""Check ADR filenames, required metadata, sections, and unfilled placeholders."""

from __future__ import annotations

import re
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DECISIONS = ROOT / "docs" / "decisions"
FILENAME = re.compile(r"ADR_(\d{4}-\d{2}-\d{2})_([a-z0-9]+(?:-[a-z0-9]+)*)\.md$")
STATUSES = {"proposed", "accepted", "rejected", "deprecated", "superseded"}
SECTIONS = (
    "Purpose",
    "Scope",
    "Context and problem statement",
    "Decision drivers",
    "Considered options",
    "Decision outcome",
)


def validate(path: Path) -> list[str]:
    errors: list[str] = []
    match = FILENAME.fullmatch(path.name)
    if match is None:
        return [f"{path.name}: invalid ADR filename"]
    record_date, slug = match.groups()
    try:
        date.fromisoformat(record_date)
    except ValueError:
        errors.append("filename date is not a real date")
    content = path.read_text(encoding="utf-8")
    parts = content.split("---", 2)
    if len(parts) < 3 or parts[0] != "":
        return [f"{path.name}: missing YAML frontmatter"]
    metadata, body = parts[1], parts[2]
    if not re.search(rf"(?m)^date:\s*['\"]?{re.escape(record_date)}['\"]?\s*$", metadata):
        errors.append(f"date must match filename date {record_date}")
    status_match = re.search(r"(?m)^status:\s*(\S+)\s*$", metadata)
    if status_match is None or status_match.group(1) not in STATUSES:
        errors.append("status must be an allowed status")
    if not re.search(r"(?m)^decision-makers:\s*\n\s+-\s+\S", metadata):
        errors.append("decision-makers must name at least one accountable person or role")
    for section in SECTIONS:
        if not re.search(rf"(?m)^## {re.escape(section)}\s*$", body):
            errors.append(f"missing section: {section}")
    for section in ("Consequences", "Confirmation"):
        if not re.search(rf"(?m)^### {section}\s*$", body):
            errors.append(f"missing section: {section}")
    if re.search(r"\{[^{}\n]+\}", content) or "YYYY-MM-DD" in content:
        errors.append("unfilled template placeholder")
    if re.search(r"(?m)^(aliases|consulted|informed):\s*\[\s*\]\s*$", metadata):
        errors.append("remove unused optional metadata instead of empty arrays")
    return [f"{path.name}: {error}" for error in errors]


def main() -> int:
    files = sorted(DECISIONS.glob("ADR_*.md"))
    errors = [error for path in files for error in validate(path)]
    for error in errors:
        print(error, file=sys.stderr)
    if errors:
        print(f"ADR validation failed: {len(errors)} error(s).", file=sys.stderr)
        return 1
    print(f"Validated {len(files)} ADR(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
