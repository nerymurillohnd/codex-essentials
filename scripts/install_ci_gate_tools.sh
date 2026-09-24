#!/usr/bin/env bash
set -euo pipefail

# CI-only: install verified upstream binaries without changing a developer's tools.
[[ -n ${RUNNER_TEMP:-} ]] || {
  printf 'RUNNER_TEMP is required\n' >&2
  exit 2
}
[[ -n ${GITHUB_PATH:-} ]] || {
  printf 'GITHUB_PATH is required\n' >&2
  exit 2
}
os_name=$(uname -s)
arch_name=$(uname -m)
[[ ${os_name} == Linux && ${arch_name} == x86_64 ]] || {
  printf 'This installer supports only the ubuntu-24.04 x86_64 CI runner\n' >&2
  exit 2
}

gate_bin="${RUNNER_TEMP}/codex-essentials-gate-tools"
mkdir -p "${gate_bin}"

shellcheck_archive="${gate_bin}/shellcheck-v0.11.0.linux.x86_64.tar.xz"
curl --fail --location --silent --show-error --retry 3 \
  'https://github.com/koalaman/shellcheck/releases/download/v0.11.0/shellcheck-v0.11.0.linux.x86_64.tar.xz' \
  --output "${shellcheck_archive}"
printf '%s  %s\n' \
  '8c3be12b05d5c177a04c29e3c78ce89ac86f1595681cab149b65b97c4e227198' \
  "${shellcheck_archive}" | sha256sum --check --status
tar -xJf "${shellcheck_archive}" -C "${gate_bin}"
install -m 0755 "${gate_bin}/shellcheck-v0.11.0/shellcheck" "${gate_bin}/shellcheck"

curl --fail --location --silent --show-error --retry 3 \
  'https://github.com/mvdan/sh/releases/download/v3.14.1/shfmt_v3.14.1_linux_amd64' \
  --output "${gate_bin}/shfmt"
printf '%s  %s\n' \
  '76e77641faa025814b77f153b29796b8e6fa2fca03e0c76a691608b86c7ea7bf' \
  "${gate_bin}/shfmt" | sha256sum --check --status
chmod 0755 "${gate_bin}/shfmt"

"${gate_bin}/shellcheck" --version
"${gate_bin}/shfmt" --version
printf '%s\n' "${gate_bin}" >>"${GITHUB_PATH}"
