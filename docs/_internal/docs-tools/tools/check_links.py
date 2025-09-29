#!/usr/bin/env python3
"""
Lightweight Markdown link checker (local links only).

Checks that relative links and images in Markdown files point to existing
files in the repository. External links (http/https/mailto/tel/data/js) and
pure anchors (#...) are ignored. Anchors within files are not validated.

Usage:
  python tools/check_links.py \
    --base /path/to/repo \
    --globs "../**/*.md" "../../../**/docs/**/*.md"

Exit codes:
  0 - no issues
  1 - missing targets found
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Iterable, List, Tuple


LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
IMG_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")

SCHEMES = ("http://", "https://", "mailto:", "tel:", "data:", "javascript:")


def iter_markdown_files(base: Path, globs: Iterable[str]) -> Iterable[Path]:
    for g in globs:
        for p in base.glob(g):
            if p.is_file() and p.suffix.lower() == ".md":
                yield p


def normalize_target(raw: str) -> str:
    s = raw.strip().strip('"').strip("'")
    # If title present after space (e.g., path "title"), keep path only
    if " " in s and not s.startswith("http") and not s.startswith("/"):
        # naive split; sufficient for common cases
        s = s.split(" ", 1)[0]
    return s


def extract_targets(md_text: str) -> List[str]:
    targets: List[str] = []
    for rx in (LINK_RE, IMG_RE):
        for m in rx.finditer(md_text):
            target = normalize_target(m.group(1))
            if not target:
                continue
            targets.append(target)
    return targets


def is_external(target: str) -> bool:
    if target.startswith(SCHEMES):
        return True
    return False


def is_pure_anchor(target: str) -> bool:
    return target.startswith('#')


def resolve_path(md_file: Path, target: str, base: Path) -> Path:
    # Strip anchor if present
    path_part = target.split('#', 1)[0]
    if not path_part:
        # anchor only
        return md_file
    p = Path(path_part)
    if p.is_absolute():
        # treat as repo-root relative (strip leading slash)
        p = Path(str(p)[1:])
        return base / p
    # relative to md file dir
    return (md_file.parent / p).resolve()


def check_file(md_file: Path, base: Path) -> List[Tuple[int, str, str]]:
    issues: List[Tuple[int, str, str]] = []
    try:
        text = md_file.read_text(encoding='utf-8')
    except Exception as e:
        issues.append((0, md_file.as_posix(), f"cannot read file: {e}"))
        return issues
    targets = extract_targets(text)
    # Build line index for error reporting
    lines = text.splitlines()
    for i, line in enumerate(lines, 1):
        for rx in (LINK_RE, IMG_RE):
            for m in rx.finditer(line):
                raw = m.group(1)
                target = normalize_target(raw)
                if not target or is_external(target) or is_pure_anchor(target):
                    continue
                resolved = resolve_path(md_file, target, base)
                if not resolved.exists():
                    issues.append((i, md_file.as_posix(), target))
    return issues


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', type=str, default=None,
                        help='Repo root (defaults to three levels up from this script)')
    parser.add_argument('--globs', nargs='*', default=("../**/*.md",),
                        help='Glob(s) relative to docs/docs-tools directory')
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    default_base = script_dir.parents[2]
    base = Path(args.base).resolve() if args.base else default_base

    md_files = sorted(set(iter_markdown_files(script_dir, args.globs)))
    all_issues: List[Tuple[int, str, str]] = []
    for md in md_files:
        all_issues.extend(check_file(md, base))

    if all_issues:
        print("[docs][links] Broken local links found:")
        for line_no, md_path, target in all_issues:
            loc = f"{md_path}:{line_no}" if line_no else md_path
            print(f"  - {loc} → '{target}' not found")
        print(f"Total broken: {len(all_issues)}")
        return 1
    else:
        print("[docs][links] OK — no missing local links")
        return 0


if __name__ == '__main__':
    sys.exit(main())

