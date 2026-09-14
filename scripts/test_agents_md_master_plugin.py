#!/usr/bin/env python3
"""Tests for the AGENTS.md Master package contract."""

# ruff: noqa: D101, D102, EXE001, PT009

from __future__ import annotations

from pathlib import Path
import re
import unittest

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
SKILL_ROOT = REPOSITORY_ROOT / "plugins" / "agents-md-master" / "skills" / "agents-md-master"
SKILL = SKILL_ROOT / "SKILL.md"
OPENAI_AGENT = SKILL_ROOT / "agents" / "openai.yaml"


class AgentsMdMasterPluginTests(unittest.TestCase):
    def test_skill_entrypoint_stays_within_context_budget(self) -> None:
        skill_size = len(SKILL.read_bytes())

        self.assertLessEqual(skill_size, 4500)

    def test_skill_entrypoint_routes_modes_to_explicit_references(self) -> None:
        skill = SKILL.read_text(encoding="utf-8")

        self.assertIn("Load at most one primary mode reference by default", skill)
        self.assertIn("Read a second reference only when", skill)

        expected_routes = {
            "create": "references/architecture-and-placement.md",
            "topology": "references/architecture-and-placement.md",
            "audit": "references/audit-and-maintenance.md",
            "refactor": "references/audit-and-maintenance.md",
            "maintain": "references/audit-and-maintenance.md",
            "semantic-governance": "references/semantic-governance.md",
            "evaluate": "references/evaluation-protocol.md",
        }
        for trigger, reference in expected_routes.items():
            with self.subTest(trigger=trigger):
                route_pattern = rf"{re.escape(trigger)}.*{re.escape(reference)}"
                self.assertRegex(skill, route_pattern)
                self.assertTrue((SKILL_ROOT / reference).is_file())

    def test_default_prompt_reinforces_limited_reference_loading(self) -> None:
        agent_manifest = OPENAI_AGENT.read_text(encoding="utf-8")
        match = re.search(r'default_prompt:\s*"([^"]+)"', agent_manifest)

        assert match is not None
        default_prompt = match.group(1)
        self.assertLessEqual(len(default_prompt), 120)
        self.assertIn("load only", default_prompt)


if __name__ == "__main__":
    _ = unittest.main()
