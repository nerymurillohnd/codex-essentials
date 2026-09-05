#!/usr/bin/env python3
from pathlib import Path
import re
import sys
from typing import Final, cast

ROOT: Final = Path(__file__).resolve().parents[1]
FRONTMATTER_MAX_CHARS: Final = 1024
SKILL_MAX_WORDS: Final = 700
REQUIRED_FILES: Final = (
    "SKILL.md",
    "README.md",
    "source/prompt-editor.md",
    "references/00-prompt-engineering-canon.md",
    "references/10-intake-readiness.md",
    "references/20-density.md",
    "references/30-output-contracts.md",
    "references/40-completion-verification.md",
    "references/50-authority-risk.md",
    "references/60-current-guidance-validation.md",
    "references/70-delegation-parallelism.md",
    "references/80-instruction-placement.md",
    "references/90-execution-recommendation.md",
    "references/100-goal-tracking.md",
    "references/domains/coding.md",
    "references/domains/compliance.md",
    "references/domains/git.md",
    "references/domains/infrastructure.md",
    "references/domains/research.md",
    "references/domains/strategy.md",
    "references/domains/writing.md",
    "templates/compact.md",
    "templates/structured.md",
    "templates/operational.md",
    "templates/critical.md",
    "examples/prompt-audit.md",
    "tests/pressure-scenarios.md",
)
VOLATILE_MODELS: Final = (
    "gpt-6-astra",
    "gpt-5.6-sol",
    "gpt-5.6-terra",
    "gpt-5.6-luna",
)

errors: list[str] = [
    f"missing: {relative_path}"
    for relative_path in REQUIRED_FILES
    if not (ROOT / relative_path).is_file()
]

skill_path = ROOT / "SKILL.md"
skill = skill_path.read_text(encoding="utf-8") if skill_path.exists() else ""
frontmatter_match = re.match(r"^---\n(.*?)\n---\n", skill, re.DOTALL)
if frontmatter_match is None:
    errors.append("SKILL.md missing YAML frontmatter")
else:
    frontmatter = frontmatter_match.group(1)
    name_match = re.search(r"^name:\s*(.+)$", frontmatter, re.MULTILINE)
    description_match = re.search(
        r"^description:\s*(.+)$",
        frontmatter,
        re.MULTILINE,
    )
    if (
        name_match is None
        or re.fullmatch(
            r"[A-Za-z0-9-]+",
            name_match.group(1).strip(),
        )
        is None
    ):
        errors.append("invalid skill name")
    if description_match is None or not description_match.group(1).strip().startswith("Use when"):
        errors.append("description must start with Use when")
    if len(frontmatter) > FRONTMATTER_MAX_CHARS:
        errors.append("frontmatter exceeds 1024 chars")

word_count = len(re.findall(r"\b\w+[\w'-]*\b", skill))
if word_count > SKILL_MAX_WORDS:
    errors.append(f"SKILL.md too verbose: {word_count} words")

referenced_paths = cast(
    "list[str]",
    re.findall(
        r"\x60((?:references|templates|examples|source)/[^\x60]+\.md)\x60",
        skill,
    ),
)
errors.extend(
    f"broken SKILL reference: {relative_path}"
    for relative_path in referenced_paths
    if not (ROOT / relative_path).exists()
)

normalized_skill = skill.lower()
errors.extend(
    f"volatile model hard-coded in SKILL.md: {model}"
    for model in VOLATILE_MODELS
    if model in normalized_skill
)

if errors:
    print("FAIL")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("PASS")
print(f"SKILL.md words: {word_count}")
print(f"Files: {sum(1 for path in ROOT.rglob('*') if path.is_file())}")
