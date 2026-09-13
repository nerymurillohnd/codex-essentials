from __future__ import annotations

# ruff: noqa: D101, D102, PT009, S603
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import tempfile
from typing import Final
import unittest

ROOT: Final = Path(__file__).resolve().parents[1]
PLUGIN: Final = ROOT / "plugins" / "shellcheck-after-edit"
SKILL: Final = PLUGIN / "skills" / "shellcheck-after-edit"
TEMPLATES: Final = SKILL / "assets" / "templates"
REQUIRED: Final = (
    "plugin.json",
    "README.md",
    "CHANGELOG.md",
    "LICENSE.md",
    "skills/shellcheck-after-edit/SKILL.md",
    "skills/shellcheck-after-edit/agents/openai.yaml",
    "skills/shellcheck-after-edit/assets/templates/shellcheck-after-edit.sh",
    "skills/shellcheck-after-edit/assets/templates/test-shellcheck-after-edit.sh",
    "skills/shellcheck-after-edit/assets/templates/project-hooks.json",
    "skills/shellcheck-after-edit/assets/templates/user-hooks.json",
    "skills/shellcheck-after-edit/assets/templates/project-config.toml.fragment",
    "skills/shellcheck-after-edit/assets/templates/user-config.toml.fragment",
    "skills/shellcheck-after-edit/assets/templates/shellcheckrc",
    "skills/shellcheck-after-edit/assets/templates/editorconfig-shell",
)


def _write_executable(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")
    path.chmod(path.stat().st_mode | stat.S_IXUSR)


def _run_handler(
    handler: Path,
    payload: str,
    scope: Path,
    path_env: str,
    *,
    shellcheckrc: Path | None = None,
) -> subprocess.CompletedProcess[str]:
    args = ["bash", str(handler), "--scope", str(scope)]
    if shellcheckrc is not None:
        args.extend(["--shellcheckrc", str(shellcheckrc)])
    return subprocess.run(
        args,
        input=payload,
        text=True,
        capture_output=True,
        check=False,
        env={**os.environ, "PATH": path_env},
    )


class PackageContractTests(unittest.TestCase):
    def test_package_shape_and_representations(self) -> None:
        missing = [relative for relative in REQUIRED if not (PLUGIN / relative).is_file()]
        self.assertEqual(missing, [], f"missing package files: {missing}")
        manifest = json.loads((PLUGIN / "plugin.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["name"], "shellcheck-after-edit")
        self.assertNotIn("hooks", manifest)
        self.assertNotIn("hooks", manifest["extensions"]["com.openai"])
        self.assertFalse((PLUGIN / "hooks").exists())

        for filename in ("project-hooks.json", "user-hooks.json"):
            wiring = json.loads((TEMPLATES / filename).read_text(encoding="utf-8"))
            groups = wiring["hooks"]["PostToolUse"]
            self.assertEqual(len(groups), 1)
            self.assertEqual(len(groups[0]["hooks"]), 1)
            handler = groups[0]["hooks"][0]
            self.assertEqual(handler["type"], "command")
            self.assertIn("statusMessage", handler)
            self.assertRegex(handler["command"], r"shellcheck-after-edit\.sh")

        for filename in ("project-config.toml.fragment", "user-config.toml.fragment"):
            fragment = (TEMPLATES / filename).read_text(encoding="utf-8")
            self.assertIn("[[hooks.PostToolUse]]", fragment)
            self.assertIn("[[hooks.PostToolUse.hooks]]", fragment)

    def test_materialized_handler_contract(self) -> None:
        if not (TEMPLATES / "shellcheck-after-edit.sh").is_file():
            self.fail("shellcheck-after-edit.sh is not implemented")
        with tempfile.TemporaryDirectory(prefix="shellcheck-after-edit-") as directory:
            root = Path(directory)
            handler = root / "shellcheck-after-edit.sh"
            shutil.copy2(TEMPLATES / "shellcheck-after-edit.sh", handler)
            fixture_test = root / "test-shellcheck-after-edit.sh"
            shutil.copy2(TEMPLATES / "test-shellcheck-after-edit.sh", fixture_test)
            handler.chmod(handler.stat().st_mode | stat.S_IXUSR)
            fixture_test.chmod(fixture_test.stat().st_mode | stat.S_IXUSR)
            bash_path = shutil.which("bash")
            self.assertIsNotNone(bash_path)
            result = subprocess.run(
                [str(bash_path), str(fixture_test)],
                text=True,
                capture_output=True,
                check=False,
                env={**os.environ, "HOOK": str(handler), "TEST_BIN": str(root / "bin")},
            )
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("PASS", result.stdout)


if __name__ == "__main__":
    unittest.main()
