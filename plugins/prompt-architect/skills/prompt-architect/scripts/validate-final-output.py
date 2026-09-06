#!/usr/bin/env python3
"""Validate Prompt Architect final-output structure from a Codex hook payload."""

from __future__ import annotations

import json
import re
import sys

SECTION_PATTERN = re.compile(
    r"\*\*("
    r"Result|Assumptions|Clarification Questions|Final Prompt|"
    r"Execution Recommendation|Current Guidance Notes|Optional Improvements"
    r")\*\*",
    re.IGNORECASE,
)
RESULT_PATTERN = re.compile(
    r"\*\*Result\*\*\s*(?:-|\u2014|:)?\s*(Ready|Needs Clarification)\b",
    re.IGNORECASE,
)
GATE_EVIDENCE_PATTERN = re.compile(
    r"Gate Evidence:\s*intake=pass;\s*"
    r"classification=R[0-3]/D[0-5]/P[0-3];\s*"
    r"references=pass;\s*placement=pass;\s*template=pass;\s*"
    r"output=pass;\s*self-audit=pass",
    re.IGNORECASE,
)


def _emit(system_message: str) -> None:
    print(json.dumps({"systemMessage": system_message}))


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
    return bool(
        (RESULT_PATTERN.search(text) and re.search(r"\*\*Assumptions\*\*", text, re.IGNORECASE))
        or (
            re.search(r"\*\*Result\*\*", text, re.IGNORECASE)
            and (
                re.search(r"\*\*Final Prompt\*\*", text, re.IGNORECASE)
                or re.search(r"\*\*Clarification Questions\*\*", text, re.IGNORECASE)
                or re.search(r"Gate Evidence:", text, re.IGNORECASE)
            )
        )
    )


def _missing_sections(text: str, required: list[str]) -> list[str]:
    return [
        section
        for section in required
        if not re.search(rf"\*\*{re.escape(section)}\*\*", text, re.IGNORECASE)
    ]


def _has_ordered_sections(text: str, names: list[str]) -> bool:
    cursor = -1
    for name in names:
        match = re.search(rf"\*\*{re.escape(name)}\*\*", text, re.IGNORECASE)
        if match is None or match.start() <= cursor:
            return False
        cursor = match.start()
    return True


def _section_body(text: str, name: str) -> str:
    match = re.search(rf"\*\*{re.escape(name)}\*\*", text, re.IGNORECASE)
    if match is None:
        return ""
    next_match = SECTION_PATTERN.search(text, match.end())
    end = next_match.start() if next_match else len(text)
    return text[match.end() : end]


def _validate_ready(text: str) -> list[str]:
    errors: list[str] = []
    required = [
        "Result",
        "Assumptions",
        "Final Prompt",
        "Execution Recommendation",
    ]
    errors.extend(f"missing {section}" for section in _missing_sections(text, required))
    if not _has_ordered_sections(text, required):
        errors.append("required Ready sections are out of order")
    if re.search(r"\*\*Clarification Questions\*\*", text, re.IGNORECASE):
        errors.append("Ready output must omit Clarification Questions")
    recommendation = _section_body(text, "Execution Recommendation")
    errors.extend(
        f"Execution Recommendation missing {token}"
        for token in ["model", "reasoning", "P-level", "D-level", "R-level"]
        if not re.search(re.escape(token), recommendation, re.IGNORECASE)
    )
    if not GATE_EVIDENCE_PATTERN.search(text):
        errors.append("missing compact Gate Evidence pass line")
    return errors


def _validate_needs_clarification(text: str) -> list[str]:
    errors: list[str] = []
    required = ["Result", "Assumptions", "Clarification Questions"]
    errors.extend(f"missing {section}" for section in _missing_sections(text, required))
    if not _has_ordered_sections(text, required):
        errors.append("Needs Clarification sections are out of order")
    if re.search(r"\*\*Final Prompt\*\*", text, re.IGNORECASE):
        errors.append("Needs Clarification output must omit Final Prompt")
    if re.search(r"\*\*Execution Recommendation\*\*", text, re.IGNORECASE):
        errors.append("Needs Clarification output must omit Execution Recommendation")
    return errors


def _validate_prompt_architect_output(text: str) -> list[str]:
    if not SECTION_PATTERN.search(text) or not _is_prompt_architect_output(text):
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
