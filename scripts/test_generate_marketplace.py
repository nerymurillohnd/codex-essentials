#!/usr/bin/env python3
"""Tests for the standalone marketplace generator."""

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
GENERATOR = REPOSITORY_ROOT / "scripts" / "generate_marketplace.py"
JsonObject = dict[str, object]


class GenerateMarketplaceTests(unittest.TestCase):
    def test_repository_catalog_includes_typescript_pro_plugin(self) -> None:
        result = self._run_generator(REPOSITORY_ROOT)

        self.assertEqual(result.returncode, 0, result.stderr)
        raw_marketplace = cast(
            "object",
            json.loads(
                (REPOSITORY_ROOT / ".agents/plugins/marketplace.json").read_text(encoding="utf-8")
            ),
        )
        self.assertIsInstance(raw_marketplace, dict)
        marketplace = cast("JsonObject", raw_marketplace)
        plugins = cast("list[JsonObject]", marketplace["plugins"])
        self.assertIn(
            {
                "name": "typescript-pro",
                "source": {"source": "local", "path": "./plugins/typescript-pro"},
                "policy": {"installation": "AVAILABLE", "authentication": "ON_INSTALL"},
                "category": "Developer Tools",
            },
            plugins,
        )

    def test_generates_catalog_from_plugin_manifests(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_schema(root)
            self._write_plugin(root, "alpha-plugin", "Productivity")
            self._write_plugin(root, "beta-plugin", "Security")

            result = subprocess.run(
                [sys.executable, str(GENERATOR), "--root", str(root)],
                check=False,
                capture_output=True,
                text=True,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn(
                "Generated .agents/plugins/marketplace.json from 2 plugin manifests.", result.stdout
            )
            raw_marketplace = cast(
                "object",
                json.loads((root / ".agents/plugins/marketplace.json").read_text(encoding="utf-8")),
            )
            self.assertIsInstance(raw_marketplace, dict)
            marketplace = cast("JsonObject", raw_marketplace)
            self.assertEqual(marketplace["name"], "codex-essentials")
            self.assertEqual(marketplace["interface"], {"displayName": "Codex Essentials"})
            self.assertEqual(
                marketplace["plugins"],
                [
                    {
                        "name": "alpha-plugin",
                        "source": {"source": "local", "path": "./plugins/alpha-plugin"},
                        "policy": {"installation": "AVAILABLE", "authentication": "ON_INSTALL"},
                        "category": "Productivity",
                    },
                    {
                        "name": "beta-plugin",
                        "source": {"source": "local", "path": "./plugins/beta-plugin"},
                        "policy": {"installation": "AVAILABLE", "authentication": "ON_INSTALL"},
                        "category": "Security",
                    },
                ],
            )

    def test_rejects_catalog_when_manifest_name_differs_from_directory(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_schema(root)
            self._write_plugin(root, "alpha-plugin", "Productivity", manifest_name="wrong-name")

            result = subprocess.run(
                [sys.executable, str(GENERATOR), "--root", str(root)],
                check=False,
                capture_output=True,
                text=True,
            )

            self.assertEqual(result.returncode, 1)
            self.assertIn("name must match plugins/alpha-plugin", result.stderr)

    def test_accepts_plugins_with_multiple_skill_directories(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_schema(root)
            self._write_plugin(root, "alpha-plugin", "Productivity")
            self._write_skill(root / "plugins" / "alpha-plugin", "second-skill")

            result = subprocess.run(
                [sys.executable, str(GENERATOR), "--root", str(root)],
                check=False,
                capture_output=True,
                text=True,
            )

            self.assertEqual(result.returncode, 0, result.stderr)

    def test_rejects_plugin_missing_readme(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_schema(root)
            self._write_plugin(root, "alpha-plugin", "Productivity")
            _ = (root / "plugins" / "alpha-plugin" / "README.md").unlink()

            result = self._run_generator(root)

            self.assertEqual(result.returncode, 1)
            self.assertIn("plugins/alpha-plugin/README.md is missing", result.stderr)

    def test_rejects_plugin_changelog_without_unreleased_section(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_schema(root)
            self._write_plugin(root, "alpha-plugin", "Productivity")
            _ = (root / "plugins" / "alpha-plugin" / "CHANGELOG.md").write_text(
                "# Changelog\n\n## [0.1.0] - 2026-09-12\n",
                encoding="utf-8",
            )

            result = self._run_generator(root)

            self.assertEqual(result.returncode, 1)
            self.assertIn(
                "plugins/alpha-plugin/CHANGELOG.md must contain an Unreleased section",
                result.stderr,
            )

    def test_rejects_skill_missing_openai_agent_manifest(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self._write_schema(root)
            self._write_plugin(root, "alpha-plugin", "Productivity")
            _ = (
                root
                / "plugins"
                / "alpha-plugin"
                / "skills"
                / "alpha-plugin"
                / "agents"
                / "openai.yaml"
            ).unlink()

            result = self._run_generator(root)

            self.assertEqual(result.returncode, 1)
            self.assertIn(
                "skills/alpha-plugin/agents/openai.yaml is missing",
                result.stderr,
            )

    def _run_generator(self, root: Path) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [sys.executable, str(GENERATOR), "--root", str(root)],
            check=False,
            capture_output=True,
            text=True,
        )

    def _write_schema(self, root: Path) -> None:
        schema = REPOSITORY_ROOT / "schemas" / "marketplace.schema.json"
        target = root / "schemas" / "marketplace.schema.json"
        target.parent.mkdir(parents=True)
        _ = target.write_text(schema.read_text(encoding="utf-8"), encoding="utf-8")

    def _write_plugin(
        self,
        root: Path,
        plugin_id: str,
        category: str,
        *,
        manifest_name: str | None = None,
    ) -> None:
        plugin = root / "plugins" / plugin_id
        manifest = plugin / "plugin.json"
        plugin.mkdir(parents=True)
        _ = (plugin / "README.md").write_text(f"# {plugin_id}\n", encoding="utf-8")
        _ = (plugin / "CHANGELOG.md").write_text(
            "# Changelog\n\n## [Unreleased]\n", encoding="utf-8"
        )
        _ = manifest.write_text(
            json.dumps(
                {
                    "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
                    "name": manifest_name or plugin_id,
                    "version": "0.1.0",
                    "description": f"{plugin_id} test plugin.",
                    "author": {
                        "name": "Nery Samuel Murillo",
                        "email": "nerymurillohnd@gmail.com",
                        "url": "https://github.com/nerymurillohnd",
                    },
                    "homepage": "https://github.com/nerymurillohnd/codex-essentials",
                    "repository": "https://github.com/nerymurillohnd/codex-essentials",
                    "license": "MIT",
                    "keywords": [plugin_id],
                    "extensions": {
                        "com.openai": {
                            "interface": {
                                "displayName": plugin_id,
                                "shortDescription": f"{plugin_id} short description.",
                                "longDescription": f"{plugin_id} long description.",
                                "developerName": "Nery Samuel Murillo",
                                "category": category,
                                "capabilities": ["Testing"],
                                "websiteURL": "https://github.com/nerymurillohnd/codex-essentials",
                                "privacyPolicyURL": "https://github.com/nerymurillohnd/codex-essentials",
                                "termsOfServiceURL": "https://github.com/nerymurillohnd/codex-essentials",
                                "defaultPrompt": ["Use this test plugin."],
                            }
                        }
                    },
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        self._write_skill(plugin, plugin_id)

    def _write_skill(self, plugin: Path, skill_id: str) -> None:
        skill = plugin / "skills" / skill_id / "agents"
        skill.mkdir(parents=True)
        _ = (skill.parent / "SKILL.md").write_text("---\nname: test\n---\n", encoding="utf-8")
        _ = (skill / "openai.yaml").write_text(
            (
                "interface:\n"
                "  display_name: Test\n"
                "  short_description: Test skill.\n"
                "policy:\n"
                "  allow_implicit_invocation: true\n"
            ),
            encoding="utf-8",
        )


if __name__ == "__main__":
    _ = unittest.main()
