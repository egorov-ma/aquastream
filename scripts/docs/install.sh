#!/usr/bin/env bash
set -euo pipefail

python3 -m venv .venv-docs || true
. .venv-docs/bin/activate
python -m pip install --upgrade pip
pip install -r requirements-docs.txt
