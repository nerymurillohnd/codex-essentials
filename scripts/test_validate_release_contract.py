"""Tests for the Release Please contract validator."""

# ruff: noqa: D101, D102, PT009, S603

from __future__ import annotations

import json
from pathlib import Path
import subprocess
import sys
import tempfile
from typing import cast
import unittest

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
VALIDATOR = REPOSITORY_ROOT / "scripts" / "validate_release_contract.py"
BOOTSTRAP_SHA = "86127842c7629bd1a4c38b4113e8d034f346ff4f"


class ValidateReleaseContractTests(unittest.TestCase):
    def test_accepts_complete_release_contract(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_contract(root)

            result = self._run_validator(root)

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn("Validated Release Please contract for 1 plugin.", result.stdout)

    def test_rejects_manifest_version_mismatch(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_contract(root)
            self._write_json(root / ".release-please-manifest.json", {"plugins/alpha": "0.2.0"})

            result = self._run_validator(root)

            self.assertEqual(result.returncode, 1)
            self.assertIn(
                "release manifest version must match plugins/alpha/plugin.json", result.stderr
            )

    def test_rejects_missing_plugin_component(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_contract(root)
            config = self._read_object(root / "release-please-config.json")
            config["packages"] = {}
            self._write_json(
                root / "release-please-config.json",
                config,
            )

            result = self._run_validator(root)

            self.assertEqual(result.returncode, 1)
            self.assertIn("release config must cover exactly every plugin path", result.stderr)

    def test_rejects_unapproved_bootstrap_sha(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_contract(root)
            config = self._read_object(root / "release-please-config.json")
            config["bootstrap-sha"] = "0000000000000000000000000000000000000000"
            self._write_json(root / "release-please-config.json", config)

            result = self._run_validator(root)

            self.assertEqual(result.returncode, 1)
            self.assertIn(
                "release config bootstrap-sha must match the approved baseline", result.stderr
            )

    def test_rejects_invalid_plugin_tag(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_contract(root)

            result = self._run_validator(root, "--tag", "plugin/alpha/v0.2.0")

            self.assertEqual(result.returncode, 1)
            self.assertIn("release tag version must match plugins/alpha/plugin.json", result.stderr)

    def test_rejects_workflow_that_uploads_release_assets(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_contract(root)
            workflow = root / ".github" / "workflows" / "release-please.yml"
            _ = workflow.write_text(
                workflow.read_text(encoding="utf-8") + "\n      - run: npm publish\n",
                encoding="utf-8",
            )

            result = self._run_validator(root)

            self.assertEqual(result.returncode, 1)
            self.assertIn(
                "release workflow must not publish packages or upload assets", result.stderr
            )

    def test_rejects_workflow_with_extra_secret_or_write_permission(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_contract(root)
            workflow = root / ".github" / "workflows" / "release-please.yml"
            _ = workflow.write_text(
                workflow.read_text(encoding="utf-8")
                .replace("  issues: write\n", "  actions: write\n  issues: write\n")
                .replace(
                    "          token: ${{ secrets.GITHUB_TOKEN }}\n",
                    "          token: ${{ secrets.RELEASE_PLEASE_TOKEN }}\n",
                ),
                encoding="utf-8",
            )

            result = self._run_validator(root)

            self.assertEqual(result.returncode, 1)
            self.assertIn(
                "release workflow must use only the repository GITHUB_TOKEN", result.stderr
            )

    def test_rejects_workflow_with_extra_action_step(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_contract(root)
            workflow = root / ".github" / "workflows" / "release-please.yml"
            _ = workflow.write_text(
                workflow.read_text(encoding="utf-8").replace(
                    "    steps:\n",
                    "    steps:\n      - uses: actions/checkout@v5\n",
                ),
                encoding="utf-8",
            )

            result = self._run_validator(root)

            self.assertEqual(result.returncode, 1)
            self.assertIn("release workflow must contain exactly one action step", result.stderr)

    def _run_validator(self, root: Path, *args: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(VALIDATOR), "--root", str(root), *args],
            check=False,
            capture_output=True,
            text=True,
        )

    def _write_contract(self, root: Path) -> None:
        plugin = root / "plugins" / "alpha"
        plugin.mkdir(parents=True)
        self._write_json(plugin / "plugin.json", {"name": "alpha", "version": "0.1.0"})
        self._write_json(
            root / "release-please-config.json",
            {
                "bootstrap-sha": BOOTSTRAP_SHA,
                "release-type": "go",
                "include-component-in-tag": True,
                "include-v-in-tag": True,
                "tag-separator": "/",
                "separate-pull-requests": True,
                "packages": {
                    "plugins/alpha": {
                        "component": "plugin/alpha",
                        "package-name": "alpha",
                        "changelog-path": "CHANGELOG.md",
                        "extra-files": [
                            {"type": "json", "path": "plugin.json", "jsonpath": "$.version"}
                        ],
                    }
                },
            },
        )
        self._write_json(root / ".release-please-manifest.json", {"plugins/alpha": "0.1.0"})
        workflow = root / ".github" / "workflows" / "release-please.yml"
        workflow.parent.mkdir(parents=True)
        _ = workflow.write_text(
            """name: Release Please
on:
  push:
    branches:
      - main
permissions:
  contents: write
  issues: write
  pull-requests: write
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          config-file: release-please-config.json
          manifest-file: .release-please-manifest.json
""",
            encoding="utf-8",
        )

    def _write_json(self, path: Path, content: object) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        _ = path.write_text(json.dumps(content, indent=2) + "\n", encoding="utf-8")

    def _read_object(self, path: Path) -> dict[str, object]:
        raw = cast("object", json.loads(path.read_text(encoding="utf-8")))
        self.assertIsInstance(raw, dict)
        return cast("dict[str, object]", raw)


if __name__ == "__main__":
    _ = unittest.main()
