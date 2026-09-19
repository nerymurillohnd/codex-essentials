#!/usr/bin/env python3
"""Generate the Codex Essentials marketplace catalog from plugin manifests."""

# ruff: noqa: C901, D103, PLR2004, TRY003, TRY004
from __future__ import annotations

import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from typing import TypedDict, cast

JsonObject = dict[str, object]


class PluginData(TypedDict):
    """Loaded plugin manifest and repository location."""

    name: str
    pluginRoot: str
    manifest: JsonObject


class SchemaTarget(TypedDict, total=False):
    """A JSON Schema validation request sent to the Node validator."""

    schema: str
    label: str
    path: str
    format: str
    data: object


MARKETPLACE = {
    "name": "codex-essentials",
    "displayName": "Codex Essentials",
    "installation": "AVAILABLE",
    "authentication": "ON_INSTALL",
}
PLUGINS_DIRECTORY = "plugins"
PLUGIN_MANIFEST = Path("plugin.json")
MARKETPLACE_OUTPUT = Path(".agents") / "plugins" / "marketplace.json"
MARKETPLACE_SCHEMA = Path("schemas") / "marketplace.schema.json"
PLUGIN_SCHEMA = Path("schemas") / "plugin.schema.json"
AGENT_SCHEMA = Path("schemas") / "agent.schema.json"
HOOKS_SCHEMA = Path("schemas") / "hooks.schema.json"
MCP_SCHEMA = Path("schemas") / "mcp.schema.json"
CONTRACT_VALIDATOR = Path(__file__).resolve().with_name("validate_plugin_contracts.mjs")
ALLOWED_PLUGIN_DIRECTORY_FILES = {"AGENTS.md"}
REQUIRED_PLUGIN_DOCUMENTS = ("README.md", "CHANGELOG.md", "LICENSE.md")
IDENTIFIER_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SEMVER_PATTERN_PARTS = (
    r"^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)",
    r"(?:-(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)",
    r"(?:\.(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*)?",
    r"(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$",
)
SEMVER_PATTERN = re.compile("".join(SEMVER_PATTERN_PARTS))


def main(args: list[str] | None = None) -> None:
    raw_args = sys.argv[1:] if args is None else args
    check_only = "--check" in raw_args
    root = resolve_root_from_args(
        [argument for argument in raw_args if argument != "--check"],
        Path(__file__).resolve().parents[1],
    )
    plugins = load_plugin_manifests(root)
    marketplace = build_marketplace(root, plugins)
    validate_marketplace(root, marketplace)
    if check_only:
        expected = json.dumps(marketplace, indent=2) + "\n"
        output = root / MARKETPLACE_OUTPUT
        assert_regular_file(output, str(MARKETPLACE_OUTPUT))
        if output.read_text(encoding="utf-8") != expected:
            raise ValueError(f"{MARKETPLACE_OUTPUT} is stale; run npm run marketplace:build")
        print(
            f"Validated .agents/plugins/marketplace.json against {len(plugins)} plugin manifests."
        )
    else:
        write_marketplace(root, marketplace)
        print(f"Generated .agents/plugins/marketplace.json from {len(plugins)} plugin manifests.")


def run(args: list[str] | None = None) -> int:
    try:
        main(sys.argv[1:] if args is None else args)
    except Exception as error:  # noqa: BLE001 - command-line tool must print any validation failure.
        print(format_error(error), file=sys.stderr)
        return 1
    return 0


def resolve_root_from_args(args: list[str], default_root: Path) -> Path:
    if not args:
        return default_root.resolve()
    if len(args) != 2 or args[0] != "--root" or not args[1]:
        raise ValueError("usage: --root <repository-root>")
    return Path(args[1]).resolve()


def load_plugin_manifests(root: Path) -> list[PluginData]:
    plugins_root = root / PLUGINS_DIRECTORY
    assert_directory(plugins_root, "plugins directory")
    entries = sorted(os.scandir(plugins_root), key=lambda entry: entry.name)
    plugins: list[PluginData] = []
    manifest_targets: list[SchemaTarget] = []
    for entry in entries:
        if entry.name.startswith("."):
            continue
        if entry.is_file(follow_symlinks=False) and entry.name in ALLOWED_PLUGIN_DIRECTORY_FILES:
            continue
        if not entry.is_dir(follow_symlinks=False):
            raise ValueError(f"plugins/{entry.name} must be a real plugin directory")
        plugin_root = plugins_root / entry.name
        assert_contained(plugins_root, plugin_root, f"plugins/{entry.name}")
        assert_no_symlinks(plugin_root)
        validate_plugin_documentation(plugin_root, f"plugins/{entry.name}")
        manifest_path = plugin_root / PLUGIN_MANIFEST
        assert_regular_file(manifest_path, f"plugins/{entry.name}/{PLUGIN_MANIFEST}")
        assert_contained(plugin_root, manifest_path, str(manifest_path))
        manifest = as_record(load_json(manifest_path, "plugin manifest"), str(manifest_path))
        plugins.append({"name": entry.name, "pluginRoot": str(plugin_root), "manifest": manifest})
        manifest_targets.append(
            {
                "schema": str(PLUGIN_SCHEMA),
                "label": "plugin manifest",
                "path": str(manifest_path.relative_to(root)),
                "format": "json",
            }
        )
    if not plugins:
        raise ValueError("plugins directory must contain at least one plugin")
    validate_schema_targets(root, manifest_targets)
    resource_targets: list[SchemaTarget] = []
    for plugin in plugins:
        plugin_root = Path(plugin["pluginRoot"])
        manifest_path = plugin_root / PLUGIN_MANIFEST
        validate_plugin_manifest(plugin["name"], plugin["manifest"], manifest_path)
        resource_targets.extend(validate_plugin_resources(root, plugin_root, plugin["manifest"]))
    validate_schema_targets(root, resource_targets)
    return plugins


def build_marketplace(root: Path, plugins: list[PluginData]) -> JsonObject:
    if root.resolve() != Path(os.path.realpath(root)):
        raise ValueError("repository root must not be a symbolic link")
    return {
        "name": MARKETPLACE["name"],
        "interface": {"displayName": MARKETPLACE["displayName"]},
        "plugins": [
            {
                "name": plugin["name"],
                "source": {"source": "local", "path": f"./plugins/{plugin['name']}"},
                "policy": {
                    "installation": MARKETPLACE["installation"],
                    "authentication": MARKETPLACE["authentication"],
                },
                "category": openai_interface(plugin["manifest"], "plugin manifest")["category"],
            }
            for plugin in plugins
        ],
    }


def write_marketplace(root: Path, marketplace: JsonObject) -> None:
    validate_marketplace(root, marketplace)
    output_directory = root / MARKETPLACE_OUTPUT.parent
    output_directory.mkdir(parents=True, exist_ok=True)
    assert_directory(root / ".agents", ".agents")
    assert_directory(output_directory, ".agents/plugins")
    assert_contained(root, output_directory, ".agents/plugins")
    output_path = root / MARKETPLACE_OUTPUT
    if output_path.exists() and output_path.is_symlink():
        raise ValueError(f"{MARKETPLACE_OUTPUT} must not be a symbolic link")
    temporary_path = output_path.with_name(f"{output_path.name}.tmp")
    if temporary_path.exists():
        raise ValueError(f"{MARKETPLACE_OUTPUT}.tmp already exists")
    _ = temporary_path.write_text(json.dumps(marketplace, indent=2) + "\n", encoding="utf-8")
    _ = temporary_path.replace(output_path)
    assert_regular_file(output_path, str(MARKETPLACE_OUTPUT))
    assert_contained(root, output_path, str(MARKETPLACE_OUTPUT))


def validate_marketplace(root: Path, marketplace: JsonObject) -> None:
    validate_schema_targets(
        root,
        [
            {
                "schema": str(MARKETPLACE_SCHEMA),
                "label": "marketplace catalog",
                "data": marketplace,
            }
        ],
    )
    schema = as_record(
        load_json(root / MARKETPLACE_SCHEMA, "marketplace schema"), str(MARKETPLACE_SCHEMA)
    )
    schema_defs = as_record(schema["$defs"], "schema $defs")
    category_schema = as_record(schema_defs["category"], "schema category")
    category_enum = category_schema["enum"]
    if not isinstance(category_enum, list):
        raise ValueError("schema category enum must be an array of strings")
    category_entries = cast("list[object]", category_enum)
    if not all(isinstance(entry, str) for entry in category_entries):
        raise ValueError("schema category enum must be an array of strings")
    categories = {cast("str", entry) for entry in category_entries}
    validate_exact_keys(marketplace, {"name", "interface", "plugins"}, str(MARKETPLACE_OUTPUT))
    _ = require_identifier(marketplace["name"], "marketplace.name")
    interface = as_record(marketplace["interface"], "marketplace.interface")
    validate_exact_keys(interface, {"displayName"}, "marketplace.interface")
    _ = require_non_empty_string(interface["displayName"], "marketplace.interface.displayName")
    plugins = marketplace["plugins"]
    if not isinstance(plugins, list) or not plugins:
        raise ValueError("marketplace.plugins must be a non-empty array")
    plugin_entries = cast("list[object]", plugins)
    seen_names: set[str] = set()
    seen_entries: set[str] = set()
    for entry in plugin_entries:
        plugin = as_record(entry, "marketplace plugin entry")
        validate_exact_keys(
            plugin, {"name", "source", "policy", "category"}, "marketplace plugin entry"
        )
        name = require_identifier(plugin["name"], "marketplace plugin entry name")
        if name in seen_names:
            raise ValueError(f"marketplace plugin name must be unique: {name}")
        seen_names.add(name)
        entry_key = json.dumps(plugin, sort_keys=True)
        if entry_key in seen_entries:
            raise ValueError(f"marketplace plugin entry must be unique: {name}")
        seen_entries.add(entry_key)
        source = as_record(plugin["source"], f"marketplace plugin {name} source")
        validate_exact_keys(source, {"source", "path"}, f"marketplace plugin {name} source")
        if source["source"] != "local":
            raise ValueError(f"marketplace plugin {name} source.source must be local")
        if source["path"] != f"./plugins/{name}":
            raise ValueError(f"marketplace plugin {name} source.path must be ./plugins/{name}")
        policy = as_record(plugin["policy"], f"marketplace plugin {name} policy")
        validate_exact_keys(
            policy, {"installation", "authentication"}, f"marketplace plugin {name} policy"
        )
        if policy["installation"] != MARKETPLACE["installation"]:
            raise ValueError(f"marketplace plugin {name} policy.installation must be AVAILABLE")
        if policy["authentication"] != MARKETPLACE["authentication"]:
            raise ValueError(f"marketplace plugin {name} policy.authentication must be ON_INSTALL")
        if plugin["category"] not in categories:
            raise ValueError(f"marketplace plugin {name} category is invalid: {plugin['category']}")


def validate_plugin_manifest(plugin_id: str, manifest: JsonObject, manifest_path: Path) -> None:
    for field in (
        "name",
        "version",
        "description",
        "author",
        "homepage",
        "repository",
        "license",
        "keywords",
        "extensions",
    ):
        if field not in manifest:
            raise ValueError(f"{manifest_path} is missing required field: {field}")
    name = require_identifier(manifest["name"], f"{manifest_path} name")
    if name != plugin_id:
        raise ValueError(f"{manifest_path} name must match plugins/{plugin_id}")
    _ = require_semver(manifest["version"], f"{manifest_path} version")
    _ = require_non_empty_string(manifest["description"], f"{manifest_path} description")
    interface = openai_interface(manifest, str(manifest_path))
    for field in (
        "displayName",
        "shortDescription",
        "longDescription",
        "developerName",
        "category",
        "capabilities",
        "websiteURL",
        "privacyPolicyURL",
        "termsOfServiceURL",
        "defaultPrompt",
    ):
        if field not in interface:
            raise ValueError(f"{manifest_path} interface is missing required field: {field}")


def validate_plugin_resources(
    root: Path, plugin_root: Path, manifest: JsonObject
) -> list[SchemaTarget]:
    targets: list[SchemaTarget] = []
    skills_root = plugin_root / "skills"
    components = [
        path
        for path in (
            skills_root,
            plugin_root / "mcp.json",
            plugin_root / "hooks",
            plugin_root / ".app.json",
        )
        if path.exists()
    ]
    if not components:
        raise ValueError("plugin must contain at least one supported component")
    if skills_root.exists():
        assert_directory(skills_root, "skills")
        targets.extend(assert_skill_directory(root, skills_root, "skills"))
    mcp_path = plugin_root / "mcp.json"
    if mcp_path.exists():
        assert_regular_file(mcp_path, str(mcp_path))
        targets.append(
            {
                "schema": str(MCP_SCHEMA),
                "label": "mcp.json",
                "path": str(mcp_path.relative_to(root)),
                "format": "json",
            }
        )
    interface = openai_interface(manifest, "plugin manifest")
    extensions = as_record(manifest["extensions"], "plugin extensions")
    openai = as_record(extensions["com.openai"], "plugin OpenAI extension")
    targets.extend(hook_schema_targets(root, plugin_root, manifest.get("hooks"), "plugin hooks"))
    targets.extend(hook_schema_targets(root, plugin_root, openai.get("hooks"), "plugin hooks"))
    for field in ("composerIcon", "logo"):
        if isinstance(interface.get(field), str):
            interface_path = cast("str", interface[field])
            assert_regular_file(
                resolve_plugin_path(plugin_root, interface_path, field), interface_path
            )
    screenshots = interface.get("screenshots")
    if isinstance(screenshots, list):
        screenshot_entries = cast("list[object]", screenshots)
        for screenshot in screenshot_entries:
            if not isinstance(screenshot, str):
                raise ValueError("interface.screenshots must contain only paths")
            assert_regular_file(
                resolve_plugin_path(plugin_root, screenshot, "screenshots"), screenshot
            )
    return targets


def openai_interface(manifest: JsonObject, label: str) -> JsonObject:
    extensions = as_record(manifest["extensions"], f"{label} extensions")
    openai = as_record(extensions.get("com.openai"), f"{label} extensions.com.openai")
    return as_record(openai.get("interface"), f"{label} extensions.com.openai.interface")


def validate_plugin_documentation(plugin_root: Path, label: str) -> None:
    for document in REQUIRED_PLUGIN_DOCUMENTS:
        document_path = plugin_root / document
        assert_regular_file(document_path, f"{label}/{document}")
        if not document_path.read_text(encoding="utf-8").strip():
            raise ValueError(f"{label}/{document} must not be empty")
    changelog = (plugin_root / "CHANGELOG.md").read_text(encoding="utf-8")
    if not re.search(r"^## \[Unreleased\]\s*$", changelog, flags=re.MULTILINE):
        raise ValueError(f"{label}/CHANGELOG.md must contain an Unreleased section")


def assert_skill_directory(root: Path, skills_root: Path, label: str) -> list[SchemaTarget]:
    entries = sorted(
        (entry for entry in os.scandir(skills_root) if not entry.name.startswith(".")),
        key=lambda entry: entry.name,
    )
    if not entries:
        raise ValueError(f"{label} must contain at least one skill directory")
    targets: list[SchemaTarget] = []
    for entry in entries:
        if not entry.is_dir(follow_symlinks=False):
            raise ValueError(f"{label}/{entry.name} must be a real directory")
        skill_root = skills_root / entry.name
        assert_regular_file(skill_root / "SKILL.md", f"{label}/{entry.name}/SKILL.md")
        agent_path = skill_root / "agents" / "openai.yaml"
        assert_regular_file(agent_path, f"{label}/{entry.name}/agents/openai.yaml")
        targets.append(
            {
                "schema": str(AGENT_SCHEMA),
                "label": "openai.yaml",
                "path": str(agent_path.relative_to(root)),
                "format": "yaml",
            }
        )
    return targets


def resolve_plugin_path(plugin_root: Path, relative_path: str, field: str) -> Path:
    if not relative_path.startswith("./") or ".." in Path(relative_path).parts:
        raise ValueError(f"{field} path must start with ./ and remain inside the plugin root")
    target = (plugin_root / relative_path).resolve()
    relative_target = os.path.relpath(target, plugin_root.resolve())
    if (
        relative_target == "."
        or relative_target.startswith(f"..{os.sep}")
        or Path(relative_target).is_absolute()
    ):
        raise ValueError(f"{field} path resolves outside the plugin root")
    return target


def hook_schema_targets(
    root: Path, plugin_root: Path, hooks: object, field: str
) -> list[SchemaTarget]:
    if hooks is None:
        return []
    if isinstance(hooks, str):
        hook_paths = [hooks]
    elif isinstance(hooks, dict):
        return [{"schema": str(HOOKS_SCHEMA), "label": field, "data": hooks}]
    elif isinstance(hooks, list):
        entries = cast("list[object]", hooks)
        if all(isinstance(entry, str) for entry in entries):
            hook_paths = [cast("str", entry) for entry in entries]
        elif all(isinstance(entry, dict) for entry in entries):
            return [
                {"schema": str(HOOKS_SCHEMA), "label": field, "data": entry} for entry in entries
            ]
        else:
            raise ValueError("hooks path array must contain only paths or configurations")
    else:
        raise ValueError("hooks must be a path, configuration, or array of one kind")
    targets: list[SchemaTarget] = []
    for hook_path in hook_paths:
        target = resolve_plugin_path(plugin_root, hook_path, field)
        assert_regular_file(target, hook_path)
        targets.append(
            {
                "schema": str(HOOKS_SCHEMA),
                "label": target.name,
                "path": str(target.relative_to(root)),
                "format": "json",
            }
        )
    return targets


def validate_schema_targets(root: Path, targets: list[SchemaTarget]) -> None:
    if not targets:
        return
    request = json.dumps({"root": str(root), "targets": targets})
    node = shutil.which("node")
    if node is None:
        raise ValueError("node is required to execute JSON Schema validation")
    try:
        result = subprocess.run(  # noqa: S603 - executes the repository-owned validator only.
            [node, str(CONTRACT_VALIDATOR)],
            check=False,
            capture_output=True,
            input=request,
            text=True,
        )
    except OSError as error:
        raise ValueError(f"unable to run schema validator: {format_error(error)}") from error
    if result.returncode != 0:
        raise ValueError(result.stderr.strip() or "schema validation failed")


def assert_no_symlinks(root: Path) -> None:
    for path in root.rglob("*"):
        if path.is_symlink():
            raise ValueError(f"{path} must not be a symbolic link")


def assert_contained(root: Path, target: Path, label: str) -> None:
    resolved_root = Path(os.path.realpath(root))
    resolved_target = Path(os.path.realpath(target))
    if resolved_target != resolved_root and resolved_root not in resolved_target.parents:
        raise ValueError(f"{label} resolves outside its allowed root")


def assert_regular_file(target: Path, label: str) -> None:
    if not target.exists():
        raise ValueError(f"{label} is missing")
    if not target.is_file() or target.is_symlink():
        raise ValueError(f"{label} must be a regular file")


def assert_directory(target: Path, label: str) -> None:
    if not target.exists():
        raise ValueError(f"{label} is missing")
    if not target.is_dir() or target.is_symlink():
        raise ValueError(f"{label} must be a real directory")


def load_json(target: Path, label: str) -> object:
    try:
        return cast("object", json.loads(target.read_text(encoding="utf-8")))
    except Exception as error:
        raise ValueError(f"unable to load {label} at {target}: {format_error(error)}") from error


def as_record(value: object, label: str) -> JsonObject:
    if not isinstance(value, dict):
        raise ValueError(f"{label} must be an object")
    return cast("JsonObject", value)


def validate_exact_keys(value: JsonObject, expected: set[str], label: str) -> None:
    actual = set(value)
    missing = expected - actual
    extra = actual - expected
    if missing:
        raise ValueError(f"{label} is missing required field(s): {', '.join(sorted(missing))}")
    if extra:
        raise ValueError(f"{label} has unsupported field(s): {', '.join(sorted(extra))}")


def require_identifier(value: object, label: str) -> str:
    if not isinstance(value, str) or not IDENTIFIER_PATTERN.fullmatch(value):
        raise ValueError(f"{label} must be a lowercase hyphenated identifier")
    return value


def require_semver(value: object, label: str) -> str:
    if not isinstance(value, str) or not SEMVER_PATTERN.fullmatch(value):
        raise ValueError(f"{label} must be SemVer")
    return value


def require_non_empty_string(value: object, label: str) -> str:
    if not isinstance(value, str) or not value:
        raise ValueError(f"{label} must be a non-empty string")
    return value


def format_error(error: BaseException) -> str:
    return str(error) or error.__class__.__name__


if __name__ == "__main__":
    sys.exit(run())
