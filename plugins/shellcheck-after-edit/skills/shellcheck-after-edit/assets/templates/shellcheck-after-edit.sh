#!/usr/bin/env bash
# Run shfmt and ShellCheck for reported shell edits in an approved scope.
set -u -o pipefail

scope=
shellcheckrc=

fail() {
	printf 'shellcheck-after-edit: %s\n' "$1" >&2
	exit 1
}

while [[ "$#" -gt 0 ]]; do
	case "$1" in
	--scope)
		[[ "$#" -ge 2 ]] || fail "--scope requires a directory"
		scope=$2
		shift 2
		;;
	--shellcheckrc)
		[[ "$#" -ge 2 ]] || fail "--shellcheckrc requires a file"
		shellcheckrc=$2
		shift 2
		;;
	*)
		fail "unsupported argument: $1"
		;;
	esac
done

[[ -n "${scope}" ]] || fail "--scope is required"
scope_path=$(cd "${scope}" 2>/dev/null && pwd -P) ||
	fail "scope is not accessible: ${scope}"

jq_bin=$(command -v jq 2>/dev/null) || fail "jq is required"
shfmt_bin=$(command -v shfmt 2>/dev/null) || fail "shfmt is required"
shellcheck_bin=$(command -v shellcheck 2>/dev/null) || fail "shellcheck is required"

if [[ -n "${shellcheckrc}" && ! -f "${shellcheckrc}" ]]; then
	fail "ShellCheck profile is missing: ${shellcheckrc}"
fi

payload=$(cat) || fail "could not read hook payload"
[[ -n "${payload}" ]] || exit 0
printf '%s' "${payload}" | "${jq_bin}" -e 'type == "object"' >/dev/null 2>&1 ||
	fail "hook payload must be a JSON object"

# shellcheck disable=SC2016 # jq expressions intentionally use jq variables.
candidates=$(
	printf '%s' "${payload}" | "${jq_bin}" -r '
		. as $root
		| [
			$root.tool_response.filePath?,
			$root.tool_response.file_path?,
			$root.tool_input.file_path?,
			$root.tool_input.filePath?,
			$root.tool_input.path?,
			$root.tool_input.file?
		]
		+ [
			($root
				| if (.tool_input | type) == "string" then .tool_input
				elif (.tool_input | type) == "object" then (.tool_input.command // "")
				else ""
				end
				| split("\n")[]
				| strings
				| try (capture("^\\*\\*\\* (?:Add|Update) File: (?<path>.+)$").path))
		]
		| .[]?
		| select(type == "string" and length > 0)
	' 2>/dev/null
) || fail "could not parse hook payload"

[[ -n "${candidates}" ]] || exit 0
seen=$'\n'
while IFS= read -r candidate; do
	[[ -n "${candidate}" ]] || continue
	case "${candidate}" in
	*.sh | *.bash | *.SH | *.BASH) ;;
	*) continue ;;
	esac
	case "${seen}" in
	*$'\n'"${candidate}"$'\n'*) continue ;;
	*) ;;
	esac
	seen="${seen}${candidate}"$'\n'

	case "${candidate}" in
	/*) unresolved="${candidate}" ;;
	*) unresolved="${scope_path}/${candidate}" ;;
	esac
	[[ -f "${unresolved}" ]] ||
		fail "shell target is not a regular file: ${candidate}"

	target=$(realpath "${unresolved}" 2>/dev/null) ||
		fail "could not resolve shell target: ${candidate}"
	case "${target}" in
	"${scope_path}"/*) ;;
	*) fail "shell target escapes scope: ${candidate}" ;;
	esac

	"${shfmt_bin}" --apply-ignore -w -- "${target}" ||
		fail "shfmt failed for ${target}"

	if [[ -n "${shellcheckrc}" ]]; then
		"${shellcheck_bin}" --rcfile "${shellcheckrc}" -- "${target}"
	else
		"${shellcheck_bin}" -- "${target}"
	fi
	shellcheck_status=$?
	[[ "${shellcheck_status}" -eq 0 ]] ||
		fail "ShellCheck failed for ${target} (exit ${shellcheck_status})"
done <<<"${candidates}"
