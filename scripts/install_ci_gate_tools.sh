#!/usr/bin/env bash
set -euo pipefail

uv tool install basedpyright==1.40.1
uv tool install ruff==0.16.7
if [[ -n "${GITHUB_PATH:-}" ]]; then
	uv tool dir --bin >>"${GITHUB_PATH}"
fi

sudo apt-get update
sudo apt-get install -y shellcheck

go install mvdan.cc/sh/v3/cmd/shfmt@v3.14.1
go install github.com/rhysd/actionlint/cmd/actionlint@v1.7.12
if [[ -n "${GITHUB_PATH:-}" ]]; then
	go_path="$(go env GOPATH)"
	echo "${go_path}/bin" >>"${GITHUB_PATH}"
fi
