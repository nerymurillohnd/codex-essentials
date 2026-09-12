#!/usr/bin/env python3
"""Tests for the GitHub label contract validator."""

# ruff: noqa: D101, D102, PT009, S603

from __future__ import annotations

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
VALIDATOR = REPOSITORY_ROOT / "scripts" / "validate_github_labels.py"


class ValidateGitHubLabelsTests(unittest.TestCase):
    def test_accepts_labeler_and_issue_template_references_in_contract(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_contract(root, ["documentation", "plugin-change"])
            self._write_labeler(root, ["documentation"])
            self._write_issue_template(root, ["plugin-change"])

            result = self._run_validator(root)

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("Validated 2 GitHub labels and 2 referenced labels.", result.stdout)

    def test_rejects_labeler_reference_missing_from_contract(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_contract(root, ["documentation"])
            self._write_labeler(root, ["plugin-change"])

            result = self._run_validator(root)

            self.assertEqual(result.returncode, 1)
            self.assertIn(
                "GitHub label references missing from .github/label-contract.json: plugin-change",
                result.stderr,
            )

    def test_rejects_issue_template_reference_missing_from_contract(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_contract(root, ["documentation"])
            self._write_issue_template(root, ["plugin-change"])

            result = self._run_validator(root)

            self.assertEqual(result.returncode, 1)
            self.assertIn(
                "GitHub label references missing from .github/label-contract.json: plugin-change",
                result.stderr,
            )

    def test_rejects_duplicate_contract_label(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_contract(root, ["documentation", "documentation"])

            result = self._run_validator(root)

            self.assertEqual(result.returncode, 1)
            self.assertIn(
                ".github/label-contract.json contains duplicate label: documentation",
                result.stderr,
            )

    def _run_validator(self, root: Path) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(VALIDATOR), "--root", str(root)],
            check=False,
            capture_output=True,
            text=True,
        )

    def _write_contract(self, root: Path, labels: list[str]) -> None:
        contract = root / ".github" / "label-contract.json"
        contract.parent.mkdir(parents=True)
        _ = contract.write_text(
            json.dumps(
                {
                    "labels": [
                        {
                            "name": label,
                            "color": "0075ca",
                            "description": f"{label} changes",
                        }
                        for label in labels
                    ]
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )

    def _write_labeler(self, root: Path, labels: list[str]) -> None:
        labeler = root / ".github" / "labeler.yml"
        labeler.parent.mkdir(parents=True, exist_ok=True)
        _ = labeler.write_text(
            "".join(
                (
                    f"{label}:\n"
                    "  - changed-files:\n"
                    "      - any-glob-to-any-file:\n"
                    "          - '**/*.md'\n"
                )
                for label in labels
            ),
            encoding="utf-8",
        )

    def _write_issue_template(self, root: Path, labels: list[str]) -> None:
        template = root / ".github" / "ISSUE_TEMPLATE" / "plugin-change.yml"
        template.parent.mkdir(parents=True, exist_ok=True)
        _ = template.write_text(
            "name: Plugin change\nlabels:\n"
            + "".join(f"  - {label}\n" for label in labels)
            + "body: []\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    _ = unittest.main()
