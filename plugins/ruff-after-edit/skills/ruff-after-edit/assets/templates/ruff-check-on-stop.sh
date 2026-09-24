#!/usr/bin/env bash
set -u -o pipefail

scope=
config=
ruff_command=

fail() {
  printf 'ruff-check-on-stop: %s\n' "$1" >&2
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

if run_ruff check "${config_args[@]}" --force-exclude -- "${scope_path}" >&2; then
  printf '{}\n'
  exit 0
fi

exit 2
