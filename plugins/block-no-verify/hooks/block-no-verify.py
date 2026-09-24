"""Codex PreToolUse hook that blocks Git verification bypass flags."""

from __future__ import annotations

import json
import shlex
import sys
from typing import cast

FALSY_GPGSIGN_VALUES = {"false", "0", "no", "off"}
COMMAND_SEPARATORS = {";", "&&", "||", "|", "&", "(", ")", "\n"}
COMMAND_PREFIXES = {"command", "env", "sudo"}


def _deny(reason: str) -> None:
    payload = {
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }
    print(json.dumps(payload, separators=(",", ":")))


def _fail_closed(reason: str) -> int:
    _deny(f"Git verification policy could not inspect this command safely: {reason}")
    return 0


def _normalize_config_value(value: str) -> tuple[str, str] | None:
    if "=" in value:
        key, raw = value.split("=", 1)
        return key.strip().lower(), raw.strip().lower()
    return None


def _shell_commands(parts: list[str]) -> list[list[str]]:
    commands: list[list[str]] = []
    current: list[str] = []
    for part in parts:
        if part in COMMAND_SEPARATORS:
            if current:
                commands.append(current)
                current = []
        else:
            current.append(part)
    if current:
        commands.append(current)
    return commands


def _git_arguments(command: list[str]) -> list[str]:
    index = 0
    while index < len(command) and (
        command[index] in COMMAND_PREFIXES
        or ("=" in command[index] and command[index].split("=", 1)[0].isidentifier())
    ):
        index += 1
    if index == len(command) or command[index].rsplit("/", 1)[-1] != "git":
        return []
    return command[index + 1 :]


def _git_option_violation(arguments: list[str]) -> str | None:
    for index, part in enumerate(arguments):
        if part == "--":
            break
        if part in {"--no-verify", "--no-gpg-sign"}:
            return part
        value = None
        if part == "-c" and index + 1 < len(arguments):
            value = arguments[index + 1]
        elif part.startswith("-c"):
            value = part[2:]
        if value is None:
            continue
        setting = _normalize_config_value(value)
        if setting and setting[0] == "commit.gpgsign" and setting[1] in FALSY_GPGSIGN_VALUES:
            return f"commit.gpgsign={setting[1]}"
    return None


def _find_git_policy_violation(parts: list[str]) -> str | None:
    for command in _shell_commands(parts):
        violation = _git_option_violation(_git_arguments(command))
        if violation is not None:
            return violation
    return None


def _load_payload() -> tuple[dict[str, object] | None, str | None]:
    try:
        payload = cast("object", json.load(sys.stdin))
    except json.JSONDecodeError as error:
        return None, f"invalid JSON payload: {error.msg}"
    if not isinstance(payload, dict):
        return None, "payload must be a JSON object"
    return cast("dict[str, object]", payload), None


def _main() -> int:
    payload, error = _load_payload()
    if error is not None or payload is None:
        return _fail_closed(error or "unknown payload error")

    tool_input = payload.get("tool_input")
    if not isinstance(tool_input, dict):
        return 0

    command = cast("dict[str, object]", tool_input).get("command")
    if command is None:
        return 0
    if not isinstance(command, str):
        return _fail_closed("tool_input.command must be a string")

    try:
        lexer = shlex.shlex(command, posix=True, punctuation_chars=";&|()\n")
        lexer.whitespace = " \t\r"
        lexer.whitespace_split = True
        parts = list(lexer)
    except ValueError as error:
        return _fail_closed(f"shell parse failed: {error}")

    violation = _find_git_policy_violation(parts)
    if violation is not None:
        reason = f"Blocked Git verification bypass flag `{violation}`."
        _deny(f"{reason} Run the Git operation with hooks and signing intact.")
    return 0


if __name__ == "__main__":
    raise SystemExit(_main())
