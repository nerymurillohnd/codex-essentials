#!/usr/bin/env bash
set -u -o pipefail

: "${HOOK:?set HOOK to the handler under test}"
: "${TEST_BIN:?set TEST_BIN to a shim directory}"
BASH_BIN=$(command -v bash) || {
	printf 'bash is required\n' >&2
	exit 1
}
JQ_BIN=$(command -v jq) || {
	printf 'jq is required\n' >&2
	exit 1
}
ROOT=$(mktemp -d "${TMPDIR:-/tmp}/shellcheck-after-edit-test.XXXXXX")
LOG="${ROOT}/hook.log"
export ROOT
trap 'rm -rf "${ROOT}"' EXIT
mkdir -p "${TEST_BIN}"
PATH_BASE="${JQ_BIN%/*}:/usr/bin:/bin"
PASS=0
FAIL=0

write_shim() {
	local path=$1 content=$2
	printf '%s\n' "${content}" >"${path}"
	chmod +x "${path}"
}

# shellcheck disable=SC2016 # Shim body intentionally contains runtime variables.
write_shim "${TEST_BIN}/shfmt" '#!/usr/bin/env bash
printf "shfmt:%s\n" "$*" >>"${HOOK_LOG}"
target=
for arg in "$@"; do target="$arg"; done
if [[ "${SC_MODE:-}" == format && "${target}" != "${ROOT}/ignored.sh" ]]; then
	printf "# formatted\n" >"${target}"
fi'
# shellcheck disable=SC2016 # Shim body intentionally contains runtime variables.
write_shim "${TEST_BIN}/shellcheck" '#!/usr/bin/env bash
printf "shellcheck:%s\n" "$*" >>"${HOOK_LOG}"
if [[ "${SC_MODE:-}" == finding ]]; then
	printf "%s:1:1: warning: unquoted variable [SC2086]\n" "$1" >&2
	exit 1
fi'

# shellcheck disable=SC2016 # jq expression intentionally uses jq variables.
payload() {
	"${JQ_BIN}" -n --arg cwd "${ROOT}" --arg file "$1" \
		'{cwd: $cwd, tool_input: {file_path: $file}}'
}

invoke() {
	local file=$1 mode=$2 path_value=$3 output status
	payload "${file}" >"${ROOT}/payload"
	if output=$(env PATH="${path_value}" SC_MODE="${mode}" HOOK_LOG="${LOG}" \
		"${BASH_BIN}" "${HOOK}" --scope "${ROOT}" <"${ROOT}/payload" 2>&1 >/dev/null); then
		status=0
	else
		status=$?
	fi
	printf '%s\n' "${output}" >"${ROOT}/last-output"
	return "${status}"
}

expect() {
	local expected=$1 description=$2 file=$3 mode=$4 path_value=$5 status
	if invoke "${file}" "${mode}" "${path_value}"; then status=0; else status=$?; fi
	if [[ "${status}" -eq "${expected}" ]]; then
		PASS=$((PASS + 1))
		printf '  ok   %s\n' "${description}"
	else
		FAIL=$((FAIL + 1))
		printf '  FAIL %s (expected %s, got %s)\n' "${description}" "${expected}" "${status}"
		sed -n '1,5p' "${ROOT}/last-output" 2>/dev/null || true
	fi
}

clean="${ROOT}/clean.sh"
printf '%s\n' '#!/usr/bin/env bash' 'printf "%s\n" clean' >"${clean}"
: >"${LOG}"
expect 0 "clean .sh runs both tools" "${clean}" clean "${TEST_BIN}:${PATH_BASE}"
first=$(sed -n '1p' "${LOG}")
second=$(sed -n '2p' "${LOG}")
if [[ "${first}" == shfmt:* && "${second}" == shellcheck:* ]]; then
	PASS=$((PASS + 1))
	printf '  ok   shfmt runs before shellcheck\n'
else
	FAIL=$((FAIL + 1))
	printf '  FAIL shfmt order\n'
fi

formatted="${ROOT}/formatted.sh"
printf '%s\n' '#!/usr/bin/env bash' 'echo    ugly' >"${formatted}"
: >"${LOG}"
expect 0 "unformatted .sh is rewritten" "${formatted}" format "${TEST_BIN}:${PATH_BASE}"
if grep -q '^# formatted$' "${formatted}" && grep -q -- '--apply-ignore -w --' "${LOG}"; then
	PASS=$((PASS + 1))
	printf '  ok   formatting write and flags\n'
else
	FAIL=$((FAIL + 1))
	printf '  FAIL formatting write or flags\n'
fi

finding="${ROOT}/finding.sh"
# shellcheck disable=SC2016 # Fixture intentionally contains an unquoted variable.
printf '%s\n' '#!/usr/bin/env bash' 'echo $UNQUOTED' >"${finding}"
: >"${LOG}"
expect 1 "ShellCheck finding is non-zero" "${finding}" finding "${TEST_BIN}:${PATH_BASE}"
if grep -q SC2086 "${ROOT}/last-output"; then
	PASS=$((PASS + 1))
	printf '  ok   diagnostic visible\n'
else
	FAIL=$((FAIL + 1))
	printf '  FAIL diagnostic missing\n'
fi

missing="${ROOT}/missing-bin"
mkdir -p "${missing}"
cp "${JQ_BIN}" "${missing}/jq"
cp "${TEST_BIN}/shellcheck" "${missing}/shellcheck"
expect 1 "missing shfmt is non-zero" "${clean}" clean "${missing}:/usr/bin:/bin"

non_shell="${ROOT}/file.js"
printf 'const  value = 1;\n' >"${non_shell}"
expect 0 "non-shell file is skipped" "${non_shell}" clean "${TEST_BIN}:${PATH_BASE}"
mkdir -p "${ROOT}/scripts"
expect 0 "directory is skipped" "${ROOT}/scripts" clean "${TEST_BIN}:${PATH_BASE}"

if printf '%s' 'not json' | env PATH="${TEST_BIN}:${PATH_BASE}" HOOK_LOG="${LOG}" \
	"${BASH_BIN}" "${HOOK}" --scope "${ROOT}" >/dev/null 2>"${ROOT}/last-output"; then
	status=0
else
	status=$?
fi
if [[ "${status}" -ne 0 ]]; then
	PASS=$((PASS + 1))
	printf '  ok   invalid JSON is non-zero\n'
else
	FAIL=$((FAIL + 1))
	printf '  FAIL invalid JSON passed\n'
fi

outside=$(mktemp "${TMPDIR:-/tmp}/shellcheck-after-edit-outside.XXXXXX")
printf '%s\n' '#!/usr/bin/env bash' 'echo outside' >"${outside}"
ln -s "${outside}" "${ROOT}/escape.sh"
expect 1 "outside symlink is non-zero" "${ROOT}/escape.sh" clean "${TEST_BIN}:${PATH_BASE}"

printf '\n'
if [[ "${FAIL}" -eq 0 ]]; then
	printf 'PASS %s/%s\n' "${PASS}" "$((PASS + FAIL))"
	exit 0
fi
printf 'FAIL %s/%s failed, %s passed\n' "${FAIL}" "$((PASS + FAIL))" "${PASS}"
exit 1
