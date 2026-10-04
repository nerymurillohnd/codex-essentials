#!/usr/bin/env python3
"""Check an annotated plugin tag before pushing or publishing it."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
TAG = re.compile(r"plugin/([a-z0-9]+(?:-[a-z0-9]+)*)/v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)\Z")
GIT = shutil.which("git") or "git"


def git(*args: str) -> subprocess.CompletedProcess[str]:
    """Run a read-only Git command in the repository."""
    return subprocess.run([GIT, *args], cwd=ROOT, text=True, capture_output=True, check=False)


def check_commit(tag_ref: str, base_ref: str, parser: argparse.ArgumentParser) -> None:
    """Require the tagged commit to match HEAD and belong to the reviewed base."""
    target = git("rev-parse", "--verify", f"{tag_ref}^{{commit}}")
    head = git("rev-parse", "--verify", "HEAD")
    base = git("rev-parse", "--verify", f"{base_ref}^{{commit}}")
    if target.returncode != 0 or head.returncode != 0:
        parser.error("cannot resolve the tag target or HEAD")
    if base.returncode != 0:
        parser.error(f"cannot resolve {base_ref}; fetch the reviewed branch first")
    if target.stdout.strip() != head.stdout.strip():
        parser.error("the tag must point at the checked-out HEAD commit")
    if git("merge-base", "--is-ancestor", target.stdout.strip(), base.stdout.strip()).returncode:
        parser.error(f"tag commit is not contained in {base_ref}")


def main() -> int:
    """Verify tag identity, source commit, main ancestry, and manifest version."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("tag", help="plugin/<name>/v<version>")
    parser.add_argument("--base", default="origin/main", help="Reviewed base ref")
    args = parser.parse_args()
    match = TAG.fullmatch(args.tag)
    if match is None:
        parser.error("tag must be plugin/<name>/v<stable-semver>")
    plugin = match.group(1)
    version = ".".join(match.group(i) for i in (2, 3, 4))
    tag_ref = f"refs/tags/{args.tag}"
    kind = git("cat-file", "-t", tag_ref)
    if kind.returncode != 0 or kind.stdout.strip() != "tag":
        parser.error("release tag must exist locally and be annotated")
    check_commit(tag_ref, args.base, parser)
    status = git("status", "--porcelain", "--untracked-files=all")
    if status.returncode != 0:
        parser.error("cannot inspect working tree")
    if status.stdout.strip():
        parser.error("working tree must be clean before checking a release tag")
    manifest_path = ROOT / "plugins" / plugin / "plugin.json"
    if not manifest_path.is_file():
        parser.error(f"plugin manifest is missing: {plugin}")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("name") != plugin or manifest.get("version") != version:
        parser.error("tag name or version does not match the plugin manifest")
    sys.stdout.write(f"{plugin} {version}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
