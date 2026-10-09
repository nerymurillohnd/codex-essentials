"""Integration checks for the repeatable plugin authoring workflow."""

from __future__ import annotations

import json
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile

SOURCE = pathlib.Path(__file__).resolve().parents[1]


class RepositoryToolsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = pathlib.Path(self.temp.name)
        shutil.copytree(
            SOURCE / "scripts", self.root / "scripts", ignore=shutil.ignore_patterns("__pycache__")
        )
        shutil.copytree(SOURCE / "templates", self.root / "templates")
        shutil.copytree(SOURCE / "plugins", self.root / "plugins")
        shutil.copy(SOURCE / "README.md", self.root / "README.md")
        shutil.copy(SOURCE / "AGENTS.md", self.root / "AGENTS.md")
        shutil.copy(SOURCE / "CONTRIBUTING.md", self.root / "CONTRIBUTING.md")
        shutil.copy(SOURCE / "LICENSE", self.root / "LICENSE")
        shutil.copy(SOURCE / "SECURITY.md", self.root / "SECURITY.md")
        shutil.copytree(SOURCE / "docs", self.root / "docs")
        shutil.copytree(SOURCE / ".github", self.root / ".github")
        shutil.copytree(SOURCE / ".agents", self.root / ".agents")
        shutil.copytree(SOURCE / ".codex", self.root / ".codex")
        # Preflight now owns the LSP Node toolchain too. Exercise it in the
        # complete fixture instead of bypassing the new quality gates.
        for name in ("package.json", "package-lock.json", "tsconfig.json", "biome.json"):
            shutil.copy(SOURCE / name, self.root / name)
        shutil.copytree(SOURCE / "node_modules", self.root / "node_modules", symlinks=True)
        shutil.copytree(
            SOURCE / "tests" / "lsp-intelligence", self.root / "tests" / "lsp-intelligence"
        )
        # Include a real, non-recursive Python suite for the fixture preflight.
        shutil.copy(
            SOURCE / "tests" / "test_release_tag.py", self.root / "tests" / "test_release_tag.py"
        )

    def run_script(self, *args: str, succeeds: bool = True) -> subprocess.CompletedProcess[str]:
        result = subprocess.run(
            [sys.executable, *args], cwd=self.root, text=True, capture_output=True, check=False
        )
        assert (result.returncode == 0) == (succeeds), result.stdout + result.stderr
        return result

    def test_documentation_link_drift_is_detected(self) -> None:
        self.run_script("scripts/validate.py")
        guide = self.root / "docs" / "roadmap.md"
        guide.write_text(guide.read_text() + "\n[Missing guide](missing-guide.md)\n")
        result = self.run_script("scripts/validate.py", succeeds=False)
        assert ("docs/roadmap.md: broken relative link: missing-guide.md") in (result.stderr)

    def test_plugin_license_badge_comes_from_manifest(self) -> None:
        self.run_script(
            "scripts/new_plugin.py",
            "badge-plugin",
            "--display-name",
            "Badge Plugin",
            "--short-description",
            "Badge checks",
            "--description",
            "Check generated metadata.",
            "--author",
            "Test Maintainer",
        )
        plugin = self.root / "plugins" / "badge-plugin"
        manifest_path = plugin / "plugin.json"
        manifest = json.loads(manifest_path.read_text())
        manifest["license"] = "Apache-2.0"
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
        self.run_script("scripts/sync_catalog.py", "--write")
        assert ("[![License: Apache-2.0]") in ((plugin / "README.md").read_text())

    def test_documentation_heading_drift_is_detected(self) -> None:
        guide = self.root / "docs" / "roadmap.md"
        guide.write_text(
            guide.read_text()
            + "\n[Valid section](maintenance.md#sources-of-truth)\n"
            + "[Missing section](maintenance.md#not-a-heading)\n"
        )
        result = self.run_script("scripts/validate.py", succeeds=False)
        assert ("docs/roadmap.md: broken relative anchor: maintenance.md#not-a-heading") in (
            result.stderr
        )
        assert ("maintenance.md#sources-of-truth") not in (result.stderr)

    def test_duplicate_heading_anchor_changes_when_heading_is_removed(self) -> None:
        guide = self.root / "docs" / "roadmap.md"
        original = guide.read_text()
        guide.write_text(original + "\n## Repeated\n\n## Repeated\n\n[Second](#repeated-1)\n")
        self.run_script("scripts/validate.py")
        guide.write_text(original + "\n## Repeated\n\n[Second](#repeated-1)\n")
        result = self.run_script("scripts/validate.py", succeeds=False)
        assert ("broken relative anchor: #repeated-1") in (result.stderr)

    def test_scaffold_requires_completion_and_detects_catalog_drift(self) -> None:
        plugin, readme, changelog = self.complete_sample_plugin()
        self.check_sample_catalog(plugin, readme)
        self.check_sample_versions(readme, changelog)
        self.check_sample_release(plugin)

    def complete_sample_plugin(self) -> tuple[pathlib.Path, pathlib.Path, pathlib.Path]:
        self.run_script(
            "scripts/new_plugin.py",
            "sample-plugin",
            "--display-name",
            "Sample Plugin",
            "--short-description",
            "Sample workflow",
            "--description",
            "A sample workflow.",
            "--author",
            "Sample Author",
        )
        plugin = self.root / "plugins" / "sample-plugin"
        assert ((plugin / "LICENSE").read_text()) == ((self.root / "LICENSE").read_text())
        self.run_script("scripts/validate.py", succeeds=False)
        changelog = plugin / "CHANGELOG.md"
        changelog.write_text(
            changelog.read_text().replace(
                "- Initial plugin release.", "- Add the sample workflow for maintainers."
            )
        )
        skill = plugin / "skills" / "example-workflow"
        skill.rename(plugin / "skills" / "sample-workflow")
        (plugin / "skills" / "sample-workflow" / "SKILL.md").write_text(
            "---\nname: sample-workflow\ndescription: Use for sample work.\n"
            "---\n\n# Workflow\n\nFollow the steps.\n"
        )
        readme = plugin / "README.md"
        content = readme.read_text()
        replacements = {
            "{{USER_PROBLEM_AND_PURPOSE}}": (
                "Maintainers need a repeatable way to complete sample work."
            ),
            "{{PRACTICAL_BEHAVIOR}}": (
                "The plugin activates one skill and follows its documented steps."
            ),
            "{{SUPPORTED_CLIENTS_AND_VERSIONS}}": "Codex CLI with local marketplace support.",
            "{{PREREQUISITES}}": "Access to this repository marketplace.",
            "{{PERMISSIONS_AND_SIDE_EFFECTS}}": "No external account or write action is required.",
            "{{INSTALLATION_STEPS}}": "Install from the verified local marketplace in Codex.",
            "{{EXAMPLE_PROMPT}}": "Use sample-plugin for this task.",
            "{{EXPECTED_RESULT}}": "The skill follows its documented steps.",
            "{{VERIFICATION_STEPS}}": (
                "Start a new conversation and confirm the sample workflow activates."
            ),
            "{{UPDATE_INSTRUCTIONS}}": "Refresh the marketplace and reinstall the plugin.",
            "{{REMOVAL_INSTRUCTIONS}}": "Remove the plugin from the local plugin list.",
            "{{LIMITATION_OR_BOUNDARY}}": "No live service access is included.",
        }
        for placeholder, value in replacements.items():
            content = content.replace(placeholder, value)
        content = "\n".join(
            line for line in content.split("\n") if not line.startswith("<!-- Optional:")
        )
        readme.write_text(content)
        return plugin, readme, changelog

    def check_sample_catalog(self, plugin: pathlib.Path, readme: pathlib.Path) -> None:
        self.run_script("scripts/validate.py", succeeds=False)
        self.run_script("scripts/sync_catalog.py", "--check", succeeds=False)
        self.run_script("scripts/sync_catalog.py", "--write")
        self.run_script("scripts/validate.py")
        self.run_script("scripts/sync_catalog.py", "--check")
        self.run_script("scripts/package_release.py", "sample-plugin")
        with zipfile.ZipFile(self.root / "dist" / "sample-plugin-v0.1.0.zip") as archive:
            assert ("sample-plugin/LICENSE") in (archive.namelist())
        assert ("[sample-workflow](skills/sample-workflow/SKILL.md)") in (readme.read_text())
        assert ("MCP: included") not in (readme.read_text())
        (plugin / "mcp.json").write_text(
            '{"$schema":"https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",'
            '"mcpServers":{"example":{"type":"streamable-http","url":"https://example.com/mcp"}}}\n'
        )
        self.run_script("scripts/sync_catalog.py", "--check", succeeds=False)
        self.run_script("scripts/sync_catalog.py", "--write")
        assert ("MCP: included") in (readme.read_text())
        assert ("[example](mcp.json)") in (readme.read_text())
        marketplace = self.root / ".agents" / "plugins" / "marketplace.json"
        assert ('"path": "./plugins/sample-plugin"') in (marketplace.read_text())
        catalog = self.root / "README.md"
        catalog.write_text(catalog.read_text().replace("A sample workflow.", "Wrong purpose."))
        self.run_script("scripts/sync_catalog.py", "--check", succeeds=False)
        self.run_script("scripts/sync_catalog.py", "--write")

    def check_sample_versions(self, readme: pathlib.Path, changelog: pathlib.Path) -> None:
        catalog = self.root / "README.md"
        self.run_script(
            "scripts/bump_version.py", "sample-plugin", "patch", "--summary", "Improve workflow"
        )
        self.run_script("scripts/validate.py")
        self.run_script("scripts/sync_catalog.py", "--check")
        notes = self.run_script("scripts/release_notes.py", "sample-plugin", "0.1.1")
        assert ("Improve workflow") in (notes.stdout)
        assert ("Version: 0.1.1") in (readme.read_text())
        assert ("| 0.1.1 |") in (catalog.read_text())
        assert re.search(r"## \[0\.1\.1\] - \d{4}-\d{2}-\d{2}", changelog.read_text())

        changelog.write_text(
            changelog.read_text().replace(
                "## [Unreleased]\n",
                "## [Unreleased]\n\n### Fixed\n\n- Correct activation for indirect requests.\n",
            )
        )
        self.run_script(
            "scripts/bump_version.py",
            "sample-plugin",
            "patch",
            "--summary",
            "Duplicate",
            succeeds=False,
        )
        self.run_script("scripts/bump_version.py", "sample-plugin", "patch")
        self.run_script("scripts/validate.py")
        assert ("Correct activation for indirect requests") in (
            self.run_script("scripts/release_notes.py", "sample-plugin", "0.1.2").stdout
        )

    def check_sample_release(self, plugin: pathlib.Path) -> None:
        catalog = self.root / "README.md"
        missing_icons = self.run_script(
            "scripts/preflight.py", "release", "sample-plugin", succeeds=False
        )
        assert ("logo") in (missing_icons.stderr), missing_icons.stdout + missing_icons.stderr
        assets = plugin / "assets"
        assets.mkdir()
        (assets / "icon.svg").write_text(
            '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" '
            'viewBox="0 0 48 48"><rect width="48" height="48" fill="blue"/></svg>\n'
        )
        manifest_path = plugin / "plugin.json"
        manifest = json.loads(manifest_path.read_text())
        interface = manifest["extensions"]["com.openai"]["interface"]
        interface["logo"] = "./assets/icon.svg"
        interface["composerIcon"] = "./assets/icon.svg"
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
        self.run_script("scripts/sync_catalog.py", "--write")
        preflight = self.run_script("scripts/preflight.py", "release", "sample-plugin")
        assert ("Local release preflight passed: sample-plugin v0.1.2") in (preflight.stdout)
        assert (self.root / "dist" / "sample-plugin-v0.1.2.zip").is_file()
        interface["logo"] = "./../../LICENSE"
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
        self.run_script("scripts/sync_catalog.py", "--write")
        outside_icon = self.run_script(
            "scripts/preflight.py", "release", "sample-plugin", succeeds=False
        )
        assert ("must reference a packaged file") in (outside_icon.stderr)
        interface["logo"] = "./assets/icon.svg"
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
        self.run_script("scripts/sync_catalog.py", "--write")
        local_secret = plugin / ".env"
        local_secret.write_text("TOKEN=example\n")
        rejected = self.run_script("scripts/package_release.py", "sample-plugin", succeeds=False)
        assert ("forbidden release file") in (rejected.stderr)
        local_secret.unlink()
        example_env = plugin / ".env.example"
        example_env.write_text("TOKEN=\n")
        self.run_script("scripts/package_release.py", "sample-plugin")
        with zipfile.ZipFile(self.root / "dist" / "sample-plugin-v0.1.2.zip") as archive:
            assert ("sample-plugin/.env.example") in (archive.namelist())
        catalog.write_text(catalog.read_text().replace("A sample workflow.", "Wrong purpose."))
        self.run_script("scripts/preflight.py", "release", "sample-plugin", succeeds=False)


if __name__ == "__main__":
    unittest.main()
