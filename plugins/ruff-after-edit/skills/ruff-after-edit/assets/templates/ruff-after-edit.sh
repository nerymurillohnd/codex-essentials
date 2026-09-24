#!/usr/bin/env bash
set -u -o pipefail

scope=
config=
ruff_command=

fail() {
  printf 'ruff-after-edit: %s\n' "$1" >&2
  exit 2
}

while [[ $# -gt 0 ]]; do
  case "$1" in
  --scope)
    [[ $# -ge 2 ]] || fail "--scope requires a directory"
    scope=$2
    shift 2
    ;;
  --config)
    [[ $# -ge 2 ]] || fail "--config requires a file"
    config=$2
    shift 2
    ;;
  --ruff-command)
    [[ $# -ge 2 ]] || fail "--ruff-command requires a command"
    ruff_command=$2
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
[[ -z "${config}" || -f "${config}" ]] ||
  fail "Ruff config is not accessible: ${config}"
[[ -n "${ruff_command}" ]] || fail "--ruff-command is required"
cd "${scope_path}" || fail "could not enter scope: ${scope_path}"

jq_bin=$(command -v jq 2>/dev/null) || fail "jq is required"

run_ruff() {
  case "${ruff_command}" in
  "uv run ruff") uv run ruff "$@" ;;
  "uvx ruff") uvx ruff "$@" ;;
  /*) "${ruff_command}" "$@" ;;
  *) fail "ruff command must be an approved absolute path, 'uv run ruff', or 'uvx ruff'" ;;
  esac
}

config_args=()
[[ -z "${config}" ]] || config_args=(--config "${config}")

payload=$(cat) || fail "could not read hook payload"
[[ -n "${payload}" ]] || exit 0
printf '%s' "${payload}" | "${jq_bin}" -e 'type == "object"' >/dev/null 2>&1 ||
  fail "hook payload must be a JSON object"

# shellcheck disable=SC2016 # jq expressions intentionally use jq variables.
candidates=$(
  printf '%s' "${payload}" | "${jq_bin}" -r '
		. as $root
		| [
			$root.tool_input.file_path?,
			$root.tool_input.filePath?,
			$root.tool_input.path?,
			$root.tool_input.file?,
			$root.tool_response.file_path?,
			$root.tool_response.filePath?
		]
		+ [
			($root.tool_input.command? // ""
				| split("\n")[]
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
  *.py) ;;
  *) continue ;;
  esac
  case "${seen}" in
  *$'\n'"${candidate}"$'\n'*) continue ;;
  *) ;;
  esac
  seen="${seen}${candidate}"$'\n'

  case "${candidate}" in
  /*) unresolved=${candidate} ;;
  *) unresolved=${scope_path}/${candidate} ;;
  esac
  [[ -f "${unresolved}" ]] || fail "Python target is not a regular file: ${candidate}"

  target=$(realpath "${unresolved}" 2>/dev/null) ||
    fail "could not resolve Python target: ${candidate}"
  case "${target}" in
  "${scope_path}"/*) ;;
  *) fail "Python target escapes scope: ${candidate}" ;;
  esac

  relative_path=${target#"${scope_path}/"}
  run_ruff check "${config_args[@]}" --fix --no-unsafe-fixes -- "${relative_path}" ||
    fail "ruff check --fix failed for ${relative_path}"
  run_ruff format "${config_args[@]}" -- "${relative_path}" ||
    fail "ruff format failed for ${relative_path}"
  run_ruff check "${config_args[@]}" -- "${relative_path}" ||
    fail "ruff check failed for ${relative_path}"
done <<<"${candidates}"
