#!/usr/bin/env python3
import os
import shutil
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SRC_DIRS = [
    REPO / 'backend-user' / 'backend-user-service' / 'docs',
    REPO / 'backend-event' / 'backend-event-service' / 'docs',
    REPO / 'backend-crew' / 'backend-crew-service' / 'docs',
    REPO / 'backend-media' / 'backend-media-service' / 'docs',
    REPO / 'backend-notification' / 'backend-notification-service' / 'docs',
    REPO / 'backend-payment' / 'backend-payment-service' / 'docs',
    REPO / 'backend-gateway' / 'docs',
    REPO / 'backend-common' / 'docs',
    REPO / 'frontend' / 'docs',
    REPO / 'infra' / 'docs',
]
DEST_ROOT = REPO / 'docs' / 'modules'

IGNORE_NAMES = {'.git', '_inventory'}


def copy_tree(src: Path, dest: Path) -> None:
    if not src.exists():
        return
    if dest.exists():
        shutil.rmtree(dest)
    for root, dirs, files in os.walk(src):
        rel = Path(root).relative_to(src)
        # filter ignored dirs
        dirs[:] = [d for d in dirs if d not in IGNORE_NAMES]
        out_dir = dest / rel
        out_dir.mkdir(parents=True, exist_ok=True)
        for f in files:
            if f.startswith('.'):
                continue
            shutil.copy2(Path(root) / f, out_dir / f)


def main() -> int:
    DEST_ROOT.mkdir(parents=True, exist_ok=True)
    for src in SRC_DIRS:
        rel_mod = src.parent.relative_to(REPO)
        dest = DEST_ROOT / rel_mod
        copy_tree(src, dest)
        print(f"[sync] {src} -> {dest}")
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
