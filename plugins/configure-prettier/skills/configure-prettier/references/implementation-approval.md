# Implementation approval

Only implement previously proposed items after clear approval such as “Approve all proposed changes,” “Approve items 1 and 3 only,” or “Proceed with exactly the displayed diff.” Ambiguous messages are not approval.

After approval:

1. Apply only the approved items and exact previously displayed changes.
2. Preserve every unapproved file and recommendation.
3. Use the approved package manager and commands only.
4. Do not run a validation command merely because it appears necessary. It must
   be listed in the approved plan, unless an unexpected validation requirement
   is immaterial, demonstrably non-mutating, and does not expand scope.
   Otherwise, stop and request revised approval.
5. Report changed files, commands, dependency/lockfile changes, validation results, and deviations/failures.

Never run `prettier --write`, package installation, CI/hook/editor/ignore changes, or unrelated reformatting outside the approved scope. If a material new conflict appears, stop and propose a revised diff.
