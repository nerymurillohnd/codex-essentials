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
        skill_text = SKILL.read_text(encoding="utf-8").replace("\r\n", "\n")
        skill_size = len(skill_text.encode("utf-8"))

        self.assertLessEqual(skill_size, 4500)

    def test_skill_entrypoint_routes_modes_to_explicit_references(self) -> None:
        skill = SKILL.read_text(encoding="utf-8")

        section_match = re.search(
            r"^## Reference Loading\n(?P<section>.*?)(?=^## )",
            skill,
            flags=re.DOTALL | re.MULTILINE,
        )
        assert section_match is not None
        reference_loading = section_match.group("section")

        expected_routes = {
            "create": "references/architecture-and-placement.md",
            "topology": "references/architecture-and-placement.md",
            "audit": "references/audit-and-maintenance.md",
            "refactor": "references/audit-and-maintenance.md",
            "maintain": "references/audit-and-maintenance.md",
            "semantic-governance": "references/semantic-governance.md",
            "evaluate": "references/evaluation-protocol.md",
        }
        route_bullets = [
            " ".join(match.group(0).split())
            for match in re.finditer(r"^- .*(?:\n  .*)*", reference_loading, flags=re.MULTILINE)
            if " -> " in match.group(0)
        ]
        actual_routes: dict[str, str] = {}
        for bullet in route_bullets:
            modes_text, route_text = bullet.removeprefix("- ").split(" -> ", 1)
            modes_text = modes_text.replace(", or ", ", ").replace(" or ", ", ")
            route_match = re.search(r"`([^`]+)`", route_text)

            assert route_match is not None
            reference = route_match.group(1)
            for mode in [mode.strip() for mode in modes_text.split(",") if mode.strip()]:
                self.assertNotIn(mode, actual_routes)
                actual_routes[mode] = reference

        self.assertEqual(expected_routes, actual_routes)
        for reference in expected_routes.values():
            self.assertTrue((SKILL_ROOT / reference).is_file())

    def test_default_prompt_frames_audit_without_workflow_duplication(self) -> None:
        agent_manifest = OPENAI_AGENT.read_text(encoding="utf-8")
        match = re.search(r'default_prompt:\s*"([^"]+)"', agent_manifest)

        assert match is not None
        default_prompt = match.group(1)
        self.assertLessEqual(len(default_prompt), 120)
        self.assertIn("audit mode", default_prompt)
        self.assertIn("do not edit", default_prompt)
        self.assertNotIn("load only", default_prompt)


if __name__ == "__main__":
    _ = unittest.main()
