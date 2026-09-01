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

files=()
file_count=0

add_file() {
	local candidate="$1"
	local existing
	local index

	[[ -n "${candidate}" ]] || return 0
	for ((index = 0; index < file_count; index += 1)); do
		existing="${files[index]}"
		[[ "${existing}" == "${candidate}" ]] && return 0
	done
	files[file_count]="${candidate}"
	((file_count += 1))
}

direct_file="$(printf '%s' "${parsed_input}" | jq -r '.tool_response.filePath // .tool_input.file_path // .tool_input.path // .tool_input.file // empty' 2>/dev/null || true)"
add_file "${direct_file}"

command_payload="$(printf '%s' "${parsed_input}" | jq -r '
	  if (.tool_input | type) == "string" then
	    .tool_input
	  else
	    .tool_input.command // ""
	  end
	' 2>/dev/null || true)"
while IFS= read -r line; do
	case "${line}" in
	"*** Add File: "*) add_file "${line#*** Add File: }" ;;
	"*** Update File: "*) add_file "${line#*** Update File: }" ;;
	*) : ;;
	esac
done <<<"${command_payload}"

if [[ ${file_count} -eq 0 ]]; then
	message "skipped; no target file in hook payload."
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

for ((file_index = 0; file_index < file_count; file_index += 1)); do
	file="${files[file_index]}"
	case "${file}" in
	/*) target="${file}" ;;
	*) target="${cwd%/}/${file}" ;;
	esac

	if [[ ! -f "${target}" ]]; then
		message "skipped; target file not found: ${file}."
		continue
	fi

	set +e
	prettier="$(find_local_prettier "${target%/*}")"
	set -e
	if [[ -z "${prettier}" ]]; then
		prettier="$(command -v prettier 2>/dev/null || true)"
	fi

	if [[ -z "${prettier}" ]]; then
		message "skipped; prettier not found for ${file}."
		continue
	fi

	case "${target}" in
	"${cwd%/}/"*) format_target="${target#"${cwd%/}/"}" ;;
	*) format_target="${target}" ;;
	esac

	if (cd "${cwd}" && "${prettier}" --write --ignore-unknown -- "${format_target}" >/dev/null 2>&1); then
		message "formatted ${file}."
	else
		message "failed to format ${file}."
	fi
done

exit 0
