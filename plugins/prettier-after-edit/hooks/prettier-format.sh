#!/usr/bin/env bash
set -euo pipefail

message() {
	jq -nc --arg message "prettier-after-edit: $1" '{"systemMessage":$message}'
}

input="$(cat 2>/dev/null || true)"
[[ -n "${input}" ]] || exit 0

if ! command -v jq >/dev/null 2>&1; then
	printf '%s\n' '{"systemMessage":"prettier-after-edit: skipped; jq not found."}'
	exit 0
fi

if ! parsed_input="$(printf '%s' "${input}" | jq -c . 2>/dev/null)"; then
	message "skipped; unable to parse hook payload."
	exit 0
fi

cwd="$(printf '%s' "${parsed_input}" | jq -r '.cwd // empty' 2>/dev/null || true)"
[[ -n "${cwd}" ]] || cwd="${PWD}"

file="$(printf '%s' "${parsed_input}" | jq -r '.tool_input.file_path // .tool_input.path // .tool_input.file // empty' 2>/dev/null || true)"
if [[ -z "${file}" ]]; then
	command_payload="$(printf '%s' "${parsed_input}" | jq -r '
	  if (.tool_input | type) == "string" then
	    .tool_input
	  else
	    .tool_input.command // ""
	  end
	' 2>/dev/null || true)"
	while IFS= read -r line; do
		case "${line}" in
		"*** Add File: "*)
			file="${line#*** Add File: }"
			break
			;;
		"*** Update File: "*)
			file="${line#*** Update File: }"
			break
			;;
		*)
			:
			;;
		esac
	done <<<"${command_payload}"
fi

if [[ -z "${file}" ]]; then
	message "skipped; no target file in hook payload."
	exit 0
fi

case "${file}" in
/*) target="${file}" ;;
*) target="${cwd%/}/${file}" ;;
esac

if [[ ! -f "${target}" ]]; then
	message "skipped; target file not found: ${file}."
	exit 0
fi

find_local_prettier() {
	local search_dir
	local candidate
	local parent
	search_dir="$1"

	while :; do
		candidate="${search_dir}/node_modules/.bin/prettier"
		if [[ -x "${candidate}" && ! -d "${candidate}" ]]; then
			printf '%s\n' "${candidate}"
			return 0
		fi

		parent="${search_dir%/*}"
		if [[ "${parent}" == "${search_dir}" || -z "${parent}" ]]; then
			break
		fi
		search_dir="${parent}"
	done

	return 1
}

prettier=""
set +e
prettier_from_local="$(find_local_prettier "${target%/*}")"
set -e
if [[ -n "${prettier_from_local}" ]]; then
	prettier="${prettier_from_local}"
fi

if [[ -z "${prettier}" ]]; then
	set +e
	prettier="$(command -v prettier)"
	set -e
fi

if [[ -z "${prettier}" ]]; then
	message "skipped; prettier not found."
	exit 0
fi

if "${prettier}" --write --ignore-unknown -- "${target}" >/dev/null 2>&1; then
	message "formatted ${file}."
else
	message "failed to format ${file}."
fi
