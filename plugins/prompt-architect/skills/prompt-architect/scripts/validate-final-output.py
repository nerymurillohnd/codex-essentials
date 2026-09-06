#!/usr/bin/env python3
"""Validate Prompt Architect final-output structure from a Codex hook payload."""

from __future__ import annotations

from itertools import pairwise
import json
import re
import sys

SECTION_NAMES = (
    "Result",
    "Assumptions",
    "Clarification Questions",
    "Final Prompt",
    "Execution Recommendation",
    "Current Guidance Notes",
    "Optional Improvements",
)
RESULT_PATTERN = re.compile(
    r"(?im)^\s*\*\*Result\*\*\s*(?:-|\u2014|:)?\s*(Ready|Needs Clarification)\b",
)
GATE_EVIDENCE_PATTERN = re.compile(
    r"Gate Evidence:\s*intake=pass;\s*"
    r"classification=R[0-3]/D[0-5]/P[0-3];\s*"
    r"references=pass;\s*placement=pass;\s*template=pass;\s*"
    r"output=pass;\s*self-audit=pass",
    re.IGNORECASE,
)


def _section_matches(text: str, name: str) -> list[re.Match[str]]:
    return list(
        re.finditer(
            rf"(?im)^[ \t]*\*\*{re.escape(name)}\*\*",
            text,
        )
    )


def _first_section(text: str, name: str) -> re.Match[str] | None:
    matches = _section_matches(text, name)
    return matches[0] if matches else None


def _last_section(text: str, name: str) -> re.Match[str] | None:
    matches = _section_matches(text, name)
    return matches[-1] if matches else None


def _emit(system_message: str) -> None:
    print(system_message, file=sys.stderr)


def _collect_strings(value: object) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        output: list[str] = []
        for item in value:
            output.extend(_collect_strings(item))
        return output
    if isinstance(value, dict):
        output = []
        for item in value.values():
            output.extend(_collect_strings(item))
        return output
    return []


def _collect_hook_text(raw_input: str) -> str:
    if not raw_input.strip():
        return ""
    try:
        parsed = json.loads(raw_input)
    except json.JSONDecodeError:
        return raw_input
    return "\n".join(_collect_strings(parsed))


def _is_prompt_architect_output(text: str) -> bool:
    result = _first_section(text, "Result")
    assumptions = _first_section(text, "Assumptions")
    if result is None or assumptions is None:
        return False
    return bool(
        RESULT_PATTERN.search(text)
        or any(_section_matches(text, name) for name in SECTION_NAMES[2:])
    )


def _required_sections(
    text: str,
    names: list[str],
) -> tuple[dict[str, re.Match[str]], list[str]]:
    matches = {name: _first_section(text, name) for name in names}
    errors = [f"missing {name}" for name, match in matches.items() if match is None]
    return {name: match for name, match in matches.items() if match is not None}, errors


def _is_ordered(matches: list[re.Match[str]]) -> bool:
    return all(current.start() < following.start() for current, following in pairwise(matches))


def _validate_ready(text: str) -> list[str]:
    errors: list[str] = []
    required = [
        "Result",
        "Assumptions",
        "Final Prompt",
        "Execution Recommendation",
    ]
    sections, missing_errors = _required_sections(text, required)
    errors.extend(missing_errors)
    if missing_errors:
        return errors

    execution_recommendation = _last_section(text, "Execution Recommendation")
    if execution_recommendation is None:
        return ["missing Execution Recommendation"]
    ordered = [
        sections["Result"],
        sections["Assumptions"],
        sections["Final Prompt"],
        execution_recommendation,
    ]
    if not _is_ordered(ordered):
        errors.append("required Ready sections are out of order")

    final_prompt = sections["Final Prompt"]
    if any(
        sections["Assumptions"].end() <= match.start() < final_prompt.start()
        for match in _section_matches(text, "Clarification Questions")
    ):
        errors.append("Ready output must omit Clarification Questions")
    recommendation = text[execution_recommendation.end() :]
    errors.extend(
        f"Execution Recommendation missing {token}"
        for token in ["model", "reasoning", "P-level", "D-level", "R-level"]
        if not re.search(re.escape(token), recommendation, re.IGNORECASE)
    )
    if not GATE_EVIDENCE_PATTERN.search(recommendation):
        errors.append("missing compact Gate Evidence pass line")
    return errors


def _validate_needs_clarification(text: str) -> list[str]:
    errors: list[str] = []
    required = ["Result", "Assumptions", "Clarification Questions"]
    sections, missing_errors = _required_sections(text, required)
    errors.extend(missing_errors)
    if missing_errors:
        return errors
    ordered = [sections[name] for name in required]
    if not _is_ordered(ordered):
        errors.append("Needs Clarification sections are out of order")
    if _first_section(text, "Final Prompt"):
        errors.append("Needs Clarification output must omit Final Prompt")
    if _first_section(text, "Execution Recommendation"):
        errors.append("Needs Clarification output must omit Execution Recommendation")
    return errors


def _validate_prompt_architect_output(text: str) -> list[str]:
    if not _is_prompt_architect_output(text):
        return []
    result = RESULT_PATTERN.search(text)
    if result and result.group(1).lower() == "ready":
        return _validate_ready(text)
    if result and result.group(1).lower() == "needs clarification":
        return _validate_needs_clarification(text)
    return ["Result must be Ready or Needs Clarification"]


def _main() -> int:
    text = _collect_hook_text(sys.stdin.read())
    errors = _validate_prompt_architect_output(text)
    if not errors:
        return 0
    _emit(
        "prompt-architect-final-check: blocked; revise before delivery: " + "; ".join(errors) + "."
    )
    return 2


if __name__ == "__main__":
    raise SystemExit(_main())
