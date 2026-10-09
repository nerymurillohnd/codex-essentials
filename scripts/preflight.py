#!/usr/bin/env python3
"""Run the repository review gate and prepare a checked plugin release archive."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
NAME = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\Z")
ICON_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".svg"}
MAX_ICON_BYTES = 5 * 1024 * 1024


def run(*args: str) -> None:
    """Run one repository check and preserve its output and failure status."""
    command = [sys.executable, *args]
    sys.stdout.write("+ " + " ".join(command) + "\n")
    sys.stdout.flush()
    subprocess.run(command, cwd=ROOT, check=True)


def check_release_icons(directory: Path, manifest: dict, parser: argparse.ArgumentParser) -> None:
    """Require packaged icons before claiming a local release is prepared."""
    interface = manifest.get("extensions", {}).get("com.openai", {}).get("interface", {})
    for field in ("logo", "composerIcon"):
        value = interface.get(field)
        if not isinstance(value, str) or not value.startswith("./"):
            parser.error(f"release requires an ./-prefixed {field} path")
        icon = (directory / value).resolve()
        if not icon.is_relative_to(directory.resolve()) or not icon.is_file():
            parser.error(f"release {field} must reference a packaged file: {value}")
        if icon.suffix.lower() not in ICON_SUFFIXES or icon.stat().st_size > MAX_ICON_BYTES:
            parser.error(f"release {field} has an unsupported format or exceeds 5 MiB: {value}")


def run_repository_checks() -> None:
    """Run every structural, fixture and language-tooling gate."""
    run("scripts/validate.py")
    run("scripts/validate_adrs.py")
    run("scripts/validate_issues.py")
    run("scripts/sync_catalog.py", "--check")
    run("-m", "compileall", "-q", "scripts")
    if (ROOT / "tests").is_dir():
        run("-m", "unittest", "discover", "-s", "tests", "-v")
    svelte_lsp_tests = ROOT / "tests" / "svelte-development" / "svelte-lsp.test.mjs"
    if svelte_lsp_tests.is_file():
        command = ["node", "--test", str(svelte_lsp_tests.relative_to(ROOT))]
        sys.stdout.write("+ " + " ".join(command) + "\n")
        sys.stdout.flush()
        subprocess.run(command, cwd=ROOT, check=True)
    if (ROOT / "plugins" / "lsp-intelligence" / "plugin.json").is_file():
        for script in ("check:lsp", "test:lsp"):
            command = ["npm", "run", script]
            sys.stdout.write("+ " + " ".join(command) + "\n")
            sys.stdout.flush()
            subprocess.run(command, cwd=ROOT, check=True)


def main() -> int:
    """Execute the selected local gate."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("pr", "release"))
    parser.add_argument("plugin", nargs="?", help="Required only for release mode")
    args = parser.parse_args()
    if (args.mode == "release") != (args.plugin is not None):
        parser.error("release requires a plugin name; pr does not take one")
    if args.plugin is not None and not NAME.fullmatch(args.plugin):
        parser.error("plugin must be a lowercase kebab-case name")

    try:
        run_repository_checks()
        if args.mode == "release":
            directory = ROOT / "plugins" / args.plugin
            manifest_path = directory / "plugin.json"
            if not manifest_path.is_file():
                parser.error(f"plugin does not exist: {args.plugin}")
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            check_release_icons(directory, manifest, parser)
            version = manifest["version"]
            run("scripts/release_notes.py", args.plugin, version)
            run("scripts/package_release.py", args.plugin)
            sys.stdout.write(f"Local release preflight passed: {args.plugin} v{version}\n")
        else:
            sys.stdout.write("PR preflight passed\n")
    except subprocess.CalledProcessError as exc:
        return exc.returncode or 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
