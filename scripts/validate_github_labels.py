#!/usr/bin/env python3
"""Validate repository GitHub label references against the local label contract."""

# ruff: noqa: D103, TRY003, TRY004

from __future__ import annotations

import json
from pathlib import Path
import sys
from typing import cast

LABEL_CONTRACT = Path(".github") / "label-contract.json"
LABELER_CONFIG = Path(".github") / "labeler.yml"
ISSUE_TEMPLATES = Path(".github") / "ISSUE_TEMPLATE"
LABELER_OPTIONS = {"changed-files-labels-limit", "max-files-changed"}
ROOT_ARGUMENT_COUNT = 2


def main() -> None:
    root = resolve_root(sys.argv[1:])
    labels = load_contract_labels(root / LABEL_CONTRACT)
    references = collect_references(root)
    missing = sorted(label for label in references if label not in labels)
    if missing:
        formatted = ", ".join(missing)
        raise ValueError(f"GitHub label references missing from {LABEL_CONTRACT}: {formatted}")
    print(f"Validated {len(labels)} GitHub labels and {len(references)} referenced labels.")


def resolve_root(args: list[str]) -> Path:
    if not args:
        return Path(__file__).resolve().parents[1]
    if len(args) == ROOT_ARGUMENT_COUNT and args[0] == "--root" and args[1]:
        return Path(args[1]).resolve()
    raise ValueError("usage: --root <repository-root>")


def load_contract_labels(path: Path) -> set[str]:
    contract = cast("object", json.loads(path.read_text(encoding="utf-8")))
    if not isinstance(contract, dict):
        raise ValueError(f"{LABEL_CONTRACT} must contain a JSON object")
    contract_record = cast("dict[str, object]", contract)
    labels = contract_record.get("labels")
    if not isinstance(labels, list) or not labels:
        raise ValueError(f"{LABEL_CONTRACT} must contain a non-empty labels array")
    label_entries = cast("list[object]", labels)
    names: set[str] = set()
    for index, entry in enumerate(label_entries):
        if not isinstance(entry, dict):
            raise ValueError(f"{LABEL_CONTRACT} labels[{index}] must be an object")
        entry_record = cast("dict[str, object]", entry)
        name = entry_record.get("name")
        if not isinstance(name, str) or not name:
            raise ValueError(f"{LABEL_CONTRACT} labels[{index}].name must be a non-empty string")
        if name in names:
            raise ValueError(f"{LABEL_CONTRACT} contains duplicate label: {name}")
        names.add(name)
    return names


def collect_references(root: Path) -> set[str]:
    references: set[str] = set()
    labeler = root / LABELER_CONFIG
    if labeler.exists():
        references.update(read_labeler_labels(labeler))
    templates = root / ISSUE_TEMPLATES
    if templates.exists():
        for template in sorted(templates.glob("*.yml")):
            references.update(read_issue_template_labels(template))
    return references


def read_labeler_labels(path: Path) -> set[str]:
    labels: set[str] = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line or line[0].isspace() or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key = line.split(":", 1)[0].strip().strip("'\"")
        if key and key not in LABELER_OPTIONS:
            labels.add(key)
    return labels


def read_issue_template_labels(path: Path) -> set[str]:
    labels: set[str] = set()
    in_labels = False
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if stripped == "labels:":
            in_labels = True
            continue
        if in_labels and line and not line.startswith((" ", "-")):
            in_labels = False
        if in_labels and stripped.startswith("- "):
            labels.add(stripped.removeprefix("- ").strip().strip("'\""))
    return labels


def run() -> int:
    try:
        main()
    except Exception as error:  # noqa: BLE001 - command-line validator reports all failures.
        print(str(error) or error.__class__.__name__, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(run())
