#!/usr/bin/env python3
import filecmp
from pathlib import Path
import shutil


EXCLUDE_TOP = {
    'docs', '.git', '.github', 'node_modules', 'build', 'bin', '.next', '.cache', '.venv-docs', 'site', '.gradle'
}

KEEP_AT_ROOT = {'README.md', 'CONTRIBUTING.md', 'LICENSE'}


def is_excluded(p: Path, repo_root: Path) -> bool:
    parts = p.parts
    return any(part in EXCLUDE_TOP for part in parts)


def target_for(repo_root: Path, src: Path) -> Path:
    rel = src.relative_to(repo_root)
    return repo_root / 'docs' / 'modules' / rel


def main() -> None:
    repo_root = Path(__file__).resolve().parents[3]
    moved = removed = skipped = 0
    for src in repo_root.rglob('*.md'):
        # Skip already centralized
        if src.is_relative_to(repo_root / 'docs'):
            continue
        # Skip non-repo areas
        if is_excluded(src, repo_root):
            continue
        # Keep certain root files
        try:
            if src.parent == repo_root and src.name in KEEP_AT_ROOT:
                continue
        except Exception:
            pass

        dst = target_for(repo_root, src)
        dst.parent.mkdir(parents=True, exist_ok=True)

        if dst.exists():
            try:
                if filecmp.cmp(src, dst, shallow=False):
                    src.unlink()
                    removed += 1
                    print(f"[centralize] identical → removed {src}")
                else:
                    # Prefer central doc; remove source to avoid duplication
                    src.unlink()
                    removed += 1
                    print(f"[centralize] differ → kept {dst.relative_to(repo_root)}, removed {src}")
            except Exception as e:
                print(f"[warn] dedup failed {src}: {e}")
                skipped += 1
            continue

        try:
            shutil.move(str(src), str(dst))
            moved += 1
            print(f"[centralize] {src} → {dst.relative_to(repo_root)}")
        except Exception as e:
            print(f"[warn] move failed {src}: {e}")
            skipped += 1

    print(f"Done. moved={moved}, removed={removed}, skipped={skipped}")


if __name__ == '__main__':
    main()


