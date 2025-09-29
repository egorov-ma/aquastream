#!/usr/bin/env python3
import filecmp
import os
import shutil
from pathlib import Path


EXCLUDE_DIRS = {
    '.git', 'node_modules', 'build', 'bin', '.next', '.cache', '.venv-docs', 'site', '.gradle'
}


def is_excluded(path: Path) -> bool:
    parts = set(path.parts)
    return bool(parts & EXCLUDE_DIRS)


def compute_target(repo_root: Path, src_md: Path) -> Path:
    # Find nearest parent named "docs" and build target under docs/modules/<parent-before-docs>/<subpath>
    parts = src_md.parts
    # locate index of 'docs'
    try:
        docs_idx = parts.index('docs')
    except ValueError:
        raise RuntimeError(f"No 'docs' segment in path: {src_md}")
    before = Path(*parts[:docs_idx])  # module path before 'docs'
    subpath = Path(*parts[docs_idx + 1:])
    target = repo_root / 'docs' / 'modules' / before / subpath
    return target


def main() -> None:
    repo_root = Path(__file__).resolve().parents[3]

    # Collect all Markdown files under any 'docs' dir outside top-level docs/
    candidates: list[Path] = []
    for p in repo_root.rglob('*.md'):
        if 'docs' not in p.parts:
            continue
        if p.is_relative_to(repo_root / 'docs'):
            continue  # already centralized
        if is_excluded(p):
            continue
        # skip node_modules etc via is_excluded above
        candidates.append(p)

    moved, removed, skipped = 0, 0, 0
    for src in sorted(candidates):
        try:
            target = compute_target(repo_root, src)
        except Exception:
            skipped += 1
            continue

        target.parent.mkdir(parents=True, exist_ok=True)

        if target.exists():
            try:
                # If identical, remove source; else prefer target as canonical and remove source to avoid duplication
                if filecmp.cmp(src, target, shallow=False):
                    src.unlink()
                    removed += 1
                    print(f"[dedup] identical → removed source {src}")
                else:
                    src.unlink()
                    removed += 1
                    print(f"[dedup] differ → kept target, removed source {src}")
            except Exception as e:
                print(f"[warn] could not dedup {src}: {e}")
            continue

        # Move into centralized location
        try:
            shutil.move(str(src), str(target))
            moved += 1
            print(f"[move] {src} → {target}")
        except Exception as e:
            print(f"[warn] move failed {src} → {target}: {e}")
            skipped += 1

    print(f"Done. moved={moved}, removed={removed}, skipped={skipped}")


if __name__ == '__main__':
    main()


