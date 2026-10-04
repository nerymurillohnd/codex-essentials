"""Integration checks for the repeatable plugin authoring workflow."""

from __future__ import annotations

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
        (self.root / "plugins").mkdir()
        shutil.copy(SOURCE / "plugins" / "README.md", self.root / "plugins" / "README.md")
        shutil.copy(SOURCE / "README.md", self.root / "README.md")
        shutil.copy(SOURCE / "AGENTS.md", self.root / "AGENTS.md")
        shutil.copy(SOURCE / "CONTRIBUTING.md", self.root / "CONTRIBUTING.md")
        shutil.copy(SOURCE / "LICENSE", self.root / "LICENSE")
        shutil.copy(SOURCE / "SECURITY.md", self.root / "SECURITY.md")
        shutil.copytree(SOURCE / "docs", self.root / "docs")
        shutil.copytree(SOURCE / ".github", self.root / ".github")
        shutil.copytree(SOURCE / ".agents", self.root / ".agents")

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


if __name__ == "__main__":
    unittest.main()
