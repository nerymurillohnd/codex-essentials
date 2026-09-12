#!/usr/bin/env python3
"""Generate the Codex Essentials marketplace catalog from plugin manifests."""

# ruff: noqa: ANN401, C901, D103, PLR2004, TRY003, TRY004
# pyright: reportAny=false, reportExplicitAny=false, reportImplicitStringConcatenation=false
# pyright: reportUnknownVariableType=false, reportUnusedCallResult=false

from __future__ import annotations

import json
import os
from pathlib import Path
import re
import sys
from typing import Any

MARKETPLACE = {
    "name": "codex-essentials",
    "displayName": "Codex Essentials",
    "installation": "AVAILABLE",
    "authentication": "ON_INSTALL",
}
PLUGINS_DIRECTORY = "plugins"
PLUGIN_MANIFEST = Path(".codex-plugin") / "plugin.json"
MARKETPLACE_OUTPUT = Path(".agents") / "plugins" / "marketplace.json"
MARKETPLACE_SCHEMA = Path("schemas") / "marketplace.schema.json"
ALLOWED_PLUGIN_DIRECTORY_FILES = {"AGENTS.md"}
FUNCTIONAL_COMPONENT_FIELDS = ("skills", "hooks", "mcpServers", "apps")
REQUIRED_PLUGIN_DOCUMENTS = ("README.md", "CHANGELOG.md")
IDENTIFIER_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SEMVER_PATTERN = re.compile(
    r"^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)"
    r"(?:-(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)"
    r"(?:\.(?:0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*)?"
    r"(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$"
)


def main(args: list[str] | None = None) -> None:
    root = resolve_root_from_args(
        sys.argv[1:] if args is None else args, Path(__file__).resolve().parents[1]
    )
    plugins = load_plugin_manifests(root)
    marketplace = build_marketplace(root, plugins)
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


def load_plugin_manifests(root: Path) -> list[dict[str, Any]]:
    plugins_root = root / PLUGINS_DIRECTORY
    assert_directory(plugins_root, "plugins directory")
    entries = sorted(os.scandir(plugins_root), key=lambda entry: entry.name)
    plugins: list[dict[str, Any]] = []
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
        validate_plugin_manifest(entry.name, manifest, manifest_path)
        validate_plugin_resources(plugin_root, manifest)
        plugins.append({"name": entry.name, "pluginRoot": str(plugin_root), "manifest": manifest})
    if not plugins:
        raise ValueError("plugins directory must contain at least one plugin")
    return plugins


def build_marketplace(root: Path, plugins: list[dict[str, Any]]) -> dict[str, Any]:
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
                "category": as_record(plugin["manifest"]["interface"], "plugin interface")[
                    "category"
                ],
            }
            for plugin in plugins
        ],
    }


def write_marketplace(root: Path, marketplace: dict[str, Any]) -> None:
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
    temporary_path.write_text(json.dumps(marketplace, indent=2) + "\n", encoding="utf-8")
    temporary_path.replace(output_path)
    assert_regular_file(output_path, str(MARKETPLACE_OUTPUT))
    assert_contained(root, output_path, str(MARKETPLACE_OUTPUT))


def validate_marketplace(root: Path, marketplace: dict[str, Any]) -> None:
    schema = as_record(
        load_json(root / MARKETPLACE_SCHEMA, "marketplace schema"), str(MARKETPLACE_SCHEMA)
    )
    categories = set(
        as_record(as_record(schema["$defs"], "schema $defs")["category"], "schema category")["enum"]
    )
    validate_exact_keys(marketplace, {"name", "interface", "plugins"}, str(MARKETPLACE_OUTPUT))
    require_identifier(marketplace["name"], "marketplace.name")
    interface = as_record(marketplace["interface"], "marketplace.interface")
    validate_exact_keys(interface, {"displayName"}, "marketplace.interface")
    require_non_empty_string(interface["displayName"], "marketplace.interface.displayName")
    plugins = marketplace["plugins"]
    if not isinstance(plugins, list) or not plugins:
        raise ValueError("marketplace.plugins must be a non-empty array")
    seen_names: set[str] = set()
    seen_entries: set[str] = set()
    for entry in plugins:
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


def validate_plugin_manifest(plugin_id: str, manifest: dict[str, Any], manifest_path: Path) -> None:
    for field in (
        "name",
        "version",
        "description",
        "author",
        "homepage",
        "repository",
        "license",
        "keywords",
        "interface",
    ):
        if field not in manifest:
            raise ValueError(f"{manifest_path} is missing required field: {field}")
    name = require_identifier(manifest["name"], f"{manifest_path} name")
    if name != plugin_id:
        raise ValueError(f"{manifest_path} name must match plugins/{plugin_id}")
    require_semver(manifest["version"], f"{manifest_path} version")
    require_non_empty_string(manifest["description"], f"{manifest_path} description")
    if not any(field in manifest for field in FUNCTIONAL_COMPONENT_FIELDS):
        components = ", ".join(FUNCTIONAL_COMPONENT_FIELDS)
        raise ValueError(
            f"{manifest_path} must declare at least one functional component: {components}"
        )
    interface = as_record(manifest["interface"], f"{manifest_path} interface")
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


def validate_plugin_resources(plugin_root: Path, manifest: dict[str, Any]) -> None:
    validate_declared_components(plugin_root, manifest)
    if isinstance(manifest.get("skills"), str):
        skills_root = resolve_plugin_path(plugin_root, manifest["skills"], "skills")
        assert_directory(skills_root, manifest["skills"])
        assert_skill_directory(skills_root, manifest["skills"])
    if isinstance(manifest.get("mcpServers"), str):
        target = resolve_plugin_path(plugin_root, manifest["mcpServers"], "mcpServers")
        assert_regular_file(target, manifest["mcpServers"])
        validate_referenced_mcp_configuration(
            load_json(target, "plugin MCP configuration"), str(target)
        )
    if isinstance(manifest.get("apps"), str):
        assert_regular_file(
            resolve_plugin_path(plugin_root, manifest["apps"], "apps"), manifest["apps"]
        )
    for hook_path in hook_paths(manifest.get("hooks")):
        target = resolve_plugin_path(plugin_root, hook_path, "hooks")
        assert_regular_file(target, hook_path)
        load_json(target, "plugin hooks configuration")
    interface = as_record(manifest["interface"], "plugin interface")
    for field in ("composerIcon", "logo"):
        if isinstance(interface.get(field), str):
            assert_regular_file(
                resolve_plugin_path(plugin_root, interface[field], field), interface[field]
            )
    screenshots = interface.get("screenshots")
    if isinstance(screenshots, list):
        for screenshot in screenshots:
            if not isinstance(screenshot, str):
                raise ValueError("interface.screenshots must contain only paths")
            assert_regular_file(
                resolve_plugin_path(plugin_root, screenshot, "screenshots"), screenshot
            )


def validate_declared_components(plugin_root: Path, manifest: dict[str, Any]) -> None:
    conventional_components = (
        ("skills", "skills"),
        ("mcpServers", ".mcp.json"),
        ("apps", ".app.json"),
        ("hooks", "hooks"),
    )
    for field, relative_path in conventional_components:
        component_path = plugin_root / relative_path
        if component_path.exists() and field not in manifest:
            raise ValueError(f"{field} must declare the existing ./{relative_path} component")
        if field == "skills" and field in manifest and not component_path.exists():
            raise ValueError(f"{manifest[field]} is missing")


def validate_plugin_documentation(plugin_root: Path, label: str) -> None:
    for document in REQUIRED_PLUGIN_DOCUMENTS:
        document_path = plugin_root / document
        assert_regular_file(document_path, f"{label}/{document}")
        if not document_path.read_text(encoding="utf-8").strip():
            raise ValueError(f"{label}/{document} must not be empty")
    changelog = (plugin_root / "CHANGELOG.md").read_text(encoding="utf-8")
    if not re.search(r"^## \[Unreleased\]\s*$", changelog, flags=re.MULTILINE):
        raise ValueError(f"{label}/CHANGELOG.md must contain an Unreleased section")


def assert_skill_directory(skills_root: Path, label: str) -> None:
    entries = sorted(
        (entry for entry in os.scandir(skills_root) if not entry.name.startswith(".")),
        key=lambda entry: entry.name,
    )
    if not entries:
        raise ValueError(f"{label} must contain at least one skill directory")
    for entry in entries:
        if not entry.is_dir(follow_symlinks=False):
            raise ValueError(f"{label}/{entry.name} must be a real directory")
        skill_root = skills_root / entry.name
        assert_regular_file(skill_root / "SKILL.md", f"{label}/{entry.name}/SKILL.md")
        assert_regular_file(
            skill_root / "agents" / "openai.yaml", f"{label}/{entry.name}/agents/openai.yaml"
        )


def validate_referenced_mcp_configuration(configuration: Any, label: str) -> None:
    record = as_record(configuration, label)
    wrapped_servers = record.get("mcpServers", record.get("mcp_servers"))
    if wrapped_servers is not None:
        if len(record) != 1:
            raise ValueError(
                f"{label} wrapped configuration must contain exactly one top-level key"
            )
        validate_mcp_server_map(wrapped_servers, f"{label} MCP servers")
        return
    validate_mcp_server_map(record, f"{label} MCP server map")


def validate_mcp_server_map(value: Any, label: str) -> None:
    servers = as_record(value, label)
    if not servers:
        raise ValueError(f"{label} must contain at least one server")
    for name, server in servers.items():
        if not re.fullmatch(r"[A-Za-z0-9_-]+", name):
            raise ValueError(f"{label} server name is invalid: {name}")
        validate_mcp_server(server, f"{label}.{name}")


def validate_mcp_server(value: Any, label: str) -> None:
    server = as_record(value, label)
    supported_fields = {"command", "args", "env", "url", "type"}
    for field in server:
        if field not in supported_fields:
            raise ValueError(f"{label}.{field} is not a supported MCP server field")
    has_command = isinstance(server.get("command"), str) and bool(server["command"])
    has_url = isinstance(server.get("url"), str) and bool(server["url"])
    if has_command == has_url:
        raise ValueError(f"{label} must define exactly one of command or url")
    if "type" in server and not (server["type"] == "http" and has_url):
        raise ValueError(f"{label}.type is supported only for http URL servers")
    if "url" in server and not str(server["url"]).startswith("https://"):
        raise ValueError(f"{label}.url must be an https URL")
    if "args" in server and not (
        isinstance(server["args"], list) and all(isinstance(entry, str) for entry in server["args"])
    ):
        raise ValueError(f"{label}.args must be an array of strings")
    if "env" in server:
        env = as_record(server["env"], f"{label}.env")
        if not env or not all(key and isinstance(value, str) for key, value in env.items()):
            raise ValueError(f"{label}.env must map non-empty keys to strings")


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


def hook_paths(hooks: Any) -> list[str]:
    if isinstance(hooks, str):
        return [hooks]
    if hooks is None or isinstance(hooks, dict):
        return []
    if isinstance(hooks, list) and hooks and all(isinstance(entry, str) for entry in hooks):
        return hooks
    if isinstance(hooks, list) and hooks and all(isinstance(entry, dict) for entry in hooks):
        return []
    raise ValueError("hooks path array must contain only paths")


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


def load_json(target: Path, label: str) -> Any:
    try:
        return json.loads(target.read_text(encoding="utf-8"))
    except Exception as error:
        raise ValueError(f"unable to load {label} at {target}: {format_error(error)}") from error


def as_record(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError(f"{label} must be an object")
    return value


def validate_exact_keys(value: dict[str, Any], expected: set[str], label: str) -> None:
    actual = set(value)
    missing = expected - actual
    extra = actual - expected
    if missing:
        raise ValueError(f"{label} is missing required field(s): {', '.join(sorted(missing))}")
    if extra:
        raise ValueError(f"{label} has unsupported field(s): {', '.join(sorted(extra))}")


def require_identifier(value: Any, label: str) -> str:
    if not isinstance(value, str) or not IDENTIFIER_PATTERN.fullmatch(value):
        raise ValueError(f"{label} must be a lowercase hyphenated identifier")
    return value


def require_semver(value: Any, label: str) -> str:
    if not isinstance(value, str) or not SEMVER_PATTERN.fullmatch(value):
        raise ValueError(f"{label} must be SemVer")
    return value


def require_non_empty_string(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value:
        raise ValueError(f"{label} must be a non-empty string")
    return value


def format_error(error: BaseException) -> str:
    return str(error) or error.__class__.__name__


if __name__ == "__main__":
    sys.exit(run())
