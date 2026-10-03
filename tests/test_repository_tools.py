"""Integration checks for the repeatable plugin authoring workflow."""

from __future__ import annotations

import pathlib
import shutil
import subprocess
import tempfile
import unittest

SOURCE = pathlib.Path(__file__).resolve().parents[1]


class RepositoryToolsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = pathlib.Path(self.temp.name)
        shutil.copytree(SOURCE / "scripts", self.root / "scripts", ignore=shutil.ignore_patterns("__pycache__"))
        shutil.copytree(SOURCE / "templates", self.root / "templates")
        (self.root / "plugins").mkdir()
        shutil.copy(SOURCE / "plugins" / "README.md", self.root / "plugins" / "README.md")
        shutil.copy(SOURCE / "README.md", self.root / "README.md")
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

    def test_scaffold_requires_completion_and_detects_catalog_drift(self) -> None:
        self.run_script(
            "scripts/new_plugin.py", "sample-plugin", "--display-name", "Sample Plugin",
            "--short-description", "Sample workflow", "--description", "A sample workflow.",
            "--author", "Sample Author",
        )
        self.run_script("scripts/validate.py", succeeds=False)
        plugin = self.root / "plugins" / "sample-plugin"
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
            "{{INSTALL_COMMAND}}": "codex plugin marketplace add ./",
            "{{EXAMPLE_PROMPT}}": "Use sample-plugin for this task.",
            "{{EXPECTED_RESULT}}": "The skill follows its documented steps.",
            "{{VERIFICATION_STEPS}}": "Start a new conversation and confirm the sample workflow activates.",
            "{{UPDATE_INSTRUCTIONS}}": "Refresh the marketplace and reinstall the plugin.",
            "{{REMOVAL_INSTRUCTIONS}}": "Remove the plugin from the local plugin list.",
            "{{LIMITATION_OR_BOUNDARY}}": "No live service access is included.",
        }
        for placeholder, value in replacements.items():
            content = content.replace(placeholder, value)
        content = "\n".join(line for line in content.split("\n") if not line.startswith("<!-- Optional:"))
        readme.write_text(content)
        self.run_script("scripts/validate.py", succeeds=False)
        self.run_script("scripts/sync_catalog.py", "--check", succeeds=False)
        self.run_script("scripts/sync_catalog.py", "--write")
        self.run_script("scripts/validate.py")
        self.run_script("scripts/sync_catalog.py", "--check")
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
        self.run_script("scripts/bump_version.py", "sample-plugin", "patch", "--summary", "Improve workflow")
        self.run_script("scripts/validate.py")
        self.run_script("scripts/sync_catalog.py", "--check")
        notes = self.run_script("scripts/release_notes.py", "sample-plugin", "0.1.1")
        self.assertIn("Improve workflow", notes.stdout)
        self.assertIn("Version: 0.1.1", readme.read_text())
        self.assertIn("| 0.1.1 |", catalog.read_text())
        changelog = plugin / "CHANGELOG.md"
        self.assertRegex(changelog.read_text(), r"## \[0\.1\.1\] - \d{4}-\d{2}-\d{2}")
        changelog.write_text(changelog.read_text().replace(
            "## [Unreleased]\n", "## [Unreleased]\n\n### Fixed\n\n- Correct activation for indirect requests.\n"
        ))
        self.run_script("scripts/bump_version.py", "sample-plugin", "patch", "--summary", "Duplicate", succeeds=False)
        self.run_script("scripts/bump_version.py", "sample-plugin", "patch")
        self.run_script("scripts/validate.py")
        self.assertIn("Correct activation for indirect requests", self.run_script(
            "scripts/release_notes.py", "sample-plugin", "0.1.2"
        ).stdout)


if __name__ == "__main__":
    unittest.main()
