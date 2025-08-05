#!/bin/sh
set -e
mkdir -p /github/workspace/.ci-tools
cp /usr/local/bin/yq /github/workspace/.ci-tools/
cp /usr/local/bin/shellcheck /github/workspace/.ci-tools/
cp /usr/local/bin/hadolint /github/workspace/.ci-tools/
chmod +x /github/workspace/.ci-tools/*
echo "/github/workspace/.ci-tools" >> "$GITHUB_PATH"
