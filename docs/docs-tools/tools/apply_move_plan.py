#!/usr/bin/env python3
import csv
import hashlib
import os
from pathlib import Path
from typing import Tuple

REPO = Path(__file__).resolve().parents[3]
PLAN = REPO / 'docs' / '_inventory' / 'move_plan.csv'

SAFE_PREFIXES = (
    'backend-common/README.md',
    'backend-crew/README.md',
    'backend-event/README.md',
    'backend-gateway/README.md',
    'backend-media/README.md',
    'backend-notification/README.md',
    'backend-payment/README.md',
    'backend-user/README.md',
    'frontend/README.md',
    'docs/modules/backend-infra/',
)


def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    if not PLAN.exists():
        print('[apply-map] move_plan.csv not found')
        return 1
    with PLAN.open('r', encoding='utf-8') as f:
        rdr = csv.DictReader(f)
        for row in rdr:
            src = row['from']
            dst = row['to']
            reason = row.get('reason', '')
            if reason == 'identity':
                continue
            if not any(src.startswith(pref) for pref in SAFE_PREFIXES):
                continue
            src_p = REPO / src
            dst_p = REPO / dst
            if not src_p.exists():
                continue
            dst_p.parent.mkdir(parents=True, exist_ok=True)
            if dst_p.exists():
                try:
                    if sha256(src_p) == sha256(dst_p):
                        src_p.unlink()
                        print(f"[apply-map] removed duplicate {src} (kept {dst})")
                    else:
                        print(f"[apply-map] skip move {src} → {dst} (target exists, content differs)")
                except Exception as e:
                    print(f"[apply-map] error comparing {src} and {dst}: {e}")
                continue
            dst_p.write_bytes(src_p.read_bytes())
            src_p.unlink()
            print(f"[apply-map] moved {src} → {dst}")
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
