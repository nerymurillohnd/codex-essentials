"""Exercise the local tag gate in an isolated Git repository."""

from __future__ import annotations

import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

SOURCE = Path(__file__).resolve().parents[1]


class ReleaseTagTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "scripts").mkdir()
        shutil.copy(SOURCE / "scripts" / "check_release_tag.py", self.root / "scripts")
        plugin = self.root / "plugins" / "sample"
        plugin.mkdir(parents=True)
        (plugin / "plugin.json").write_text(
            json.dumps({"name": "sample", "version": "0.1.0"}) + "\n"
        )
        self.git("init", "-b", "main")
        self.git("config", "user.name", "Test Maintainer")
        self.git("config", "user.email", "maintainer@example.invalid")
        self.git("add", ".")
        self.git("commit", "-m", "feat: add sample plugin")
        self.git("update-ref", "refs/remotes/origin/main", "HEAD")

    def git(self, *args: str) -> None:
        subprocess.run(["git", *args], cwd=self.root, check=True, capture_output=True)

    def check_tag(self, tag: str, succeeds: bool = True) -> subprocess.CompletedProcess[str]:
        result = subprocess.run(
            [sys.executable, "scripts/check_release_tag.py", tag],
            cwd=self.root,
            text=True,
            capture_output=True,
        )
        self.assertEqual(result.returncode == 0, succeeds, result.stdout + result.stderr)
        return result

    def test_annotated_main_tag_passes_and_unreviewed_tag_fails(self) -> None:
        self.git("tag", "-a", "plugin/sample/v0.1.0", "-m", "Release sample v0.1.0")
        self.assertEqual(self.check_tag("plugin/sample/v0.1.0").stdout.strip(), "sample 0.1.0")
        self.git("checkout", "-b", "unreviewed")
        (self.root / "unreviewed.txt").write_text("unreviewed\n")
        self.git("add", ".")
        self.git("commit", "-m", "chore: unreviewed change")
        self.git("tag", "-a", "plugin/sample/v0.1.1", "-m", "Release sample v0.1.1")
        self.assertIn("origin/main", self.check_tag("plugin/sample/v0.1.1", False).stderr)

    def test_lightweight_tag_is_rejected(self) -> None:
        self.git("-c", "tag.gpgSign=false", "tag", "plugin/sample/v0.1.0")
        self.assertIn("annotated", self.check_tag("plugin/sample/v0.1.0", False).stderr)

    def test_tag_version_and_clean_checkout_are_required(self) -> None:
        self.git("tag", "-a", "plugin/sample/v0.1.1", "-m", "Release sample v0.1.1")
        self.assertIn("manifest", self.check_tag("plugin/sample/v0.1.1", False).stderr)
        self.git("tag", "-a", "plugin/sample/v0.1.0", "-m", "Release sample v0.1.0")
        (self.root / "local-notes.txt").write_text("not committed\n")
        self.assertIn("clean", self.check_tag("plugin/sample/v0.1.0", False).stderr)

    def test_git_status_error_does_not_count_as_clean(self) -> None:
        self.git("tag", "-a", "plugin/sample/v0.1.0", "-m", "Release sample v0.1.0")
        (self.root / ".git" / "index").write_bytes(b"invalid index\n")
        self.assertIn(
            "cannot inspect working tree", self.check_tag("plugin/sample/v0.1.0", False).stderr
        )


if __name__ == "__main__":
    unittest.main()
