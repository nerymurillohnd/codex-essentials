"""Integration checks for the repeatable plugin authoring workflow."""

from __future__ import annotations

import json
import pathlib
import shutil
import subprocess
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

    def run_script(self, *args: str, succeeds: bool = True) -> subprocess.CompletedProcess[str]:
        result = subprocess.run(["python3", *args], cwd=self.root, text=True, capture_output=True)
        self.assertEqual(result.returncode == 0, succeeds, result.stdout + result.stderr)
        return result

    def test_documentation_link_drift_is_detected(self) -> None:
        self.run_script("scripts/validate.py")
        guide = self.root / "docs" / "roadmap.md"
        guide.write_text(guide.read_text() + "\n[Missing guide](missing-guide.md)\n")
        result = self.run_script("scripts/validate.py", succeeds=False)
        self.assertIn("docs/roadmap.md: broken relative link: missing-guide.md", result.stderr)

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
        self.assertIn("[![License: Apache-2.0]", (plugin / "README.md").read_text())

    def test_documentation_heading_drift_is_detected(self) -> None:
        guide = self.root / "docs" / "roadmap.md"
        guide.write_text(
            guide.read_text()
            + "\n[Valid section](maintenance.md#sources-of-truth)\n"
            + "[Missing section](maintenance.md#not-a-heading)\n"
        )
        result = self.run_script("scripts/validate.py", succeeds=False)
        self.assertIn(
            "docs/roadmap.md: broken relative anchor: maintenance.md#not-a-heading",
            result.stderr,
        )
        self.assertNotIn("maintenance.md#sources-of-truth", result.stderr)

    def test_duplicate_heading_anchor_changes_when_heading_is_removed(self) -> None:
        guide = self.root / "docs" / "roadmap.md"
        original = guide.read_text()
        guide.write_text(original + "\n## Repeated\n\n## Repeated\n\n[Second](#repeated-1)\n")
        self.run_script("scripts/validate.py")
        guide.write_text(original + "\n## Repeated\n\n[Second](#repeated-1)\n")
        result = self.run_script("scripts/validate.py", succeeds=False)
        self.assertIn("broken relative anchor: #repeated-1", result.stderr)

    def test_scaffold_requires_completion_and_detects_catalog_drift(self) -> None:
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
        self.assertEqual((plugin / "LICENSE").read_text(), (self.root / "LICENSE").read_text())
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
            "---\nname: sample-workflow\ndescription: Use for sample work.\n---\n\n# Workflow\n\nFollow the steps.\n"
        )
        readme = plugin / "README.md"
        content = readme.read_text()
        replacements = {
            "{{USER_PROBLEM_AND_PURPOSE}}": "Maintainers need a repeatable way to complete sample work.",
            "{{PRACTICAL_BEHAVIOR}}": "The plugin activates one skill and follows its documented steps.",
            "{{SUPPORTED_CLIENTS_AND_VERSIONS}}": "Codex CLI with local marketplace support.",
            "{{PREREQUISITES}}": "Access to this repository marketplace.",
            "{{PERMISSIONS_AND_SIDE_EFFECTS}}": "No external account or write action is required.",
            "{{INSTALLATION_STEPS}}": "Install from the verified local marketplace in Codex.",
            "{{EXAMPLE_PROMPT}}": "Use sample-plugin for this task.",
            "{{EXPECTED_RESULT}}": "The skill follows its documented steps.",
            "{{VERIFICATION_STEPS}}": "Start a new conversation and confirm the sample workflow activates.",
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
        self.run_script("scripts/validate.py", succeeds=False)
        self.run_script("scripts/sync_catalog.py", "--check", succeeds=False)
        self.run_script("scripts/sync_catalog.py", "--write")
        self.run_script("scripts/validate.py")
        self.run_script("scripts/sync_catalog.py", "--check")
        self.run_script("scripts/package_release.py", "sample-plugin")
        with zipfile.ZipFile(self.root / "dist" / "sample-plugin-v0.1.0.zip") as archive:
            self.assertIn("sample-plugin/LICENSE", archive.namelist())
        self.assertIn("[sample-workflow](skills/sample-workflow/SKILL.md)", readme.read_text())
        self.assertNotIn("MCP: included", readme.read_text())
        (plugin / "mcp.json").write_text(
            '{"$schema":"https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",'
            '"mcpServers":{"example":{"type":"streamable-http","url":"https://example.com/mcp"}}}\n'
        )
        self.run_script("scripts/sync_catalog.py", "--check", succeeds=False)
        self.run_script("scripts/sync_catalog.py", "--write")
        self.assertIn("MCP: included", readme.read_text())
        self.assertIn("[example](mcp.json)", readme.read_text())
        marketplace = self.root / ".agents" / "plugins" / "marketplace.json"
        self.assertIn('"path": "./plugins/sample-plugin"', marketplace.read_text())
        catalog = self.root / "README.md"
        catalog.write_text(catalog.read_text().replace("A sample workflow.", "Wrong purpose."))
        self.run_script("scripts/sync_catalog.py", "--check", succeeds=False)
        self.run_script("scripts/sync_catalog.py", "--write")
        self.run_script(
            "scripts/bump_version.py", "sample-plugin", "patch", "--summary", "Improve workflow"
        )
        self.run_script("scripts/validate.py")
        self.run_script("scripts/sync_catalog.py", "--check")
        notes = self.run_script("scripts/release_notes.py", "sample-plugin", "0.1.1")
        self.assertIn("Improve workflow", notes.stdout)
        self.assertIn("Version: 0.1.1", readme.read_text())
        self.assertIn("| 0.1.1 |", catalog.read_text())
        self.assertRegex(changelog.read_text(), r"## \[0\.1\.1\] - \d{4}-\d{2}-\d{2}")
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
        self.assertIn(
            "Correct activation for indirect requests",
            self.run_script("scripts/release_notes.py", "sample-plugin", "0.1.2").stdout,
        )
        missing_icons = self.run_script(
            "scripts/preflight.py", "release", "sample-plugin", succeeds=False
        )
        self.assertIn("logo", missing_icons.stderr)
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
        self.assertIn("Local release preflight passed: sample-plugin v0.1.2", preflight.stdout)
        self.assertTrue((self.root / "dist" / "sample-plugin-v0.1.2.zip").is_file())
        interface["logo"] = "./../../LICENSE"
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
        self.run_script("scripts/sync_catalog.py", "--write")
        outside_icon = self.run_script(
            "scripts/preflight.py", "release", "sample-plugin", succeeds=False
        )
        self.assertIn("must reference a packaged file", outside_icon.stderr)
        interface["logo"] = "./assets/icon.svg"
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
        self.run_script("scripts/sync_catalog.py", "--write")
        local_secret = plugin / ".env"
        local_secret.write_text("TOKEN=example\n")
        rejected = self.run_script("scripts/package_release.py", "sample-plugin", succeeds=False)
        self.assertIn("forbidden release file", rejected.stderr)
        local_secret.unlink()
        example_env = plugin / ".env.example"
        example_env.write_text("TOKEN=\n")
        self.run_script("scripts/package_release.py", "sample-plugin")
        with zipfile.ZipFile(self.root / "dist" / "sample-plugin-v0.1.2.zip") as archive:
            self.assertIn("sample-plugin/.env.example", archive.namelist())
        catalog.write_text(catalog.read_text().replace("A sample workflow.", "Wrong purpose."))
        self.run_script("scripts/preflight.py", "release", "sample-plugin", succeeds=False)


if __name__ == "__main__":
    unittest.main()
