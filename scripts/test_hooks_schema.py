"""Keep the plugin hook schema aligned with released Codex hook capabilities.

Official source: https://learn.chatgpt.com/docs/hooks (reviewed 2026-09-19).
This is deliberately hermetic: CI validates the reviewed release contract rather
than depending on documentation availability at test time.
"""

# ruff: noqa: D101, D102, PT009

from __future__ import annotations

import json
from pathlib import Path
from typing import cast
import unittest

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = REPOSITORY_ROOT / "schemas" / "hooks.schema.json"

JsonObject = dict[str, object]

CURRENT_EVENTS = frozenset(
    {
        "SessionStart",
        "SessionEnd",
        "SubagentStart",
        "SubagentStop",
        "PreToolUse",
        "PermissionRequest",
        "PostToolUse",
        "PreCompact",
        "PostCompact",
        "UserPromptSubmit",
        "Stop",
        "Interrupt",
    }
)


class HooksSchemaTests(unittest.TestCase):
    def test_accepts_exactly_the_current_released_events(self) -> None:
        hooks = self._object(self._schema()["properties"])
        hooks = self._object(hooks["hooks"])
        property_names = self._object(hooks["propertyNames"])

        self.assertEqual(set(self._strings(property_names["enum"])), CURRENT_EVENTS)

    def test_dispatches_each_handler_to_a_discriminated_hook_definition(self) -> None:
        matcher_group = self._object(self._definitions()["matcherGroup"])
        hooks = self._object(matcher_group["properties"])
        handlers = self._object(hooks["hooks"])
        items = self._object(handlers["items"])

        self.assertEqual(
            items,
            {
                "oneOf": [
                    {"$ref": "#/$defs/commandHook"},
                    {"$ref": "#/$defs/mcpToolHook"},
                ]
            },
        )

    def test_command_handlers_match_the_released_command_contract(self) -> None:
        command_hook = self._object(self._definitions()["commandHook"])

        self.assertEqual(command_hook["required"], ["type", "command"])
        self.assertFalse(command_hook["additionalProperties"])
        properties = self._object(command_hook["properties"])
        self.assertEqual(
            set(properties),
            {
                "type",
                "command",
                "timeout",
                "statusMessage",
                "async",
                "commandWindows",
                "additionalContextLimit",
            },
        )
        self.assertEqual(self._object(properties["type"]), {"const": "command"})
        self.assertEqual(self._object(properties["async"]), {"type": "boolean"})
        self.assertEqual(self._object(properties["commandWindows"])["type"], "string")
        additional_context_limit = self._object(properties["additionalContextLimit"])
        self.assertEqual(additional_context_limit["type"], "integer")
        self.assertEqual(additional_context_limit["minimum"], 0)

    def test_mcp_tool_handlers_match_the_released_mcp_contract(self) -> None:
        mcp_tool_hook = self._object(self._definitions()["mcpToolHook"])

        self.assertEqual(mcp_tool_hook["required"], ["type", "server", "tool"])
        self.assertFalse(mcp_tool_hook["additionalProperties"])
        properties = self._object(mcp_tool_hook["properties"])
        self.assertEqual(
            set(properties),
            {"type", "server", "tool", "input", "timeout", "statusMessage"},
        )
        self.assertEqual(self._object(properties["type"]), {"const": "mcp_tool"})
        self.assertEqual(self._object(properties["server"])["type"], "string")
        self.assertEqual(self._object(properties["tool"])["type"], "string")
        self.assertEqual(self._object(properties["input"])["type"], "object")

    def _object(self, value: object) -> JsonObject:
        self.assertIsInstance(value, dict)
        return cast("JsonObject", value)

    def _schema(self) -> JsonObject:
        raw_schema = cast("object", json.loads(SCHEMA_PATH.read_text(encoding="utf-8")))
        return self._object(raw_schema)

    def _definitions(self) -> JsonObject:
        return self._object(self._schema()["$defs"])

    def _strings(self, value: object) -> list[str]:
        self.assertIsInstance(value, list)
        values = cast("list[object]", value)
        self.assertTrue(all(isinstance(item, str) for item in values))
        return [cast("str", item) for item in values]


if __name__ == "__main__":
    _ = unittest.main()
