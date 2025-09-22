#!/usr/bin/env python3
import os
from pathlib import Path
from typing import Set, List, Union
import yaml
import fnmatch

REPO = Path(__file__).resolve().parents[1]
INV_CSV = REPO / 'docs' / '_inventory' / 'md_inventory.csv'
NAV_SRC = REPO / 'mkdocs.yml'
REPORT = REPO / 'docs' / '_reports' / 'docs-quality-report.md'

EXCLUDE_GLOBS = [
    'docs/_reports/*.md',
    'docs/_diagrams/README.md',
    'docs/adr/adr-*.md',  # доступны из ADR индекса
    'docs/modules/frontend/*/*.md',  # фронтовые заметки вне основного навигатора
]


def read_inventory_paths() -> Set[str]:
    paths: Set[str] = set()
    if not INV_CSV.exists():
        return paths
    with INV_CSV.open('r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            if i == 0:
                continue
            parts = line.rstrip('\n').split(',')
            if not parts:
                continue
            p = parts[0]
            if p:
                paths.add(p)
    return paths


def collect_nav_paths(node: Union[List, dict], out: Set[str]):
    if isinstance(node, list):
        for item in node:
            collect_nav_paths(item, out)
    elif isinstance(node, dict):
        for _, value in node.items():
            if isinstance(value, str):
                path = value.strip()
                if path.endswith('.md'):
                    if path.startswith('docs/'):
                        out.add(path)
                    else:
                        out.add('docs/' + path)
            else:
                collect_nav_paths(value, out)


def read_nav_paths() -> Set[str]:
    paths: Set[str] = set()
    if not NAV_SRC.exists():
        return paths
    data = yaml.safe_load(NAV_SRC.read_text(encoding='utf-8')) or {}
    nav = data.get('nav', [])
    collect_nav_paths(nav, paths)
    return paths


def is_excluded(path: str) -> bool:
    for pat in EXCLUDE_GLOBS:
        if fnmatch.fnmatch(path, pat):
            return True
    return False


def main() -> int:
    inv = read_inventory_paths()
    nav = read_nav_paths()
    missing_in_nav = sorted([
        p for p in inv
        if p.endswith('.md')
        and p.startswith('docs/')
        and not p.startswith('docs/_templates/')
        and not is_excluded(p)
        and p not in nav
    ])

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    with REPORT.open('w', encoding='utf-8') as f:
        f.write('# Docs Quality Report\n\n')
        f.write('## Coverage\n')
        f.write(f'- Inventory total: {len(inv)}\n')
        f.write(f'- Nav entries: {len(nav)}\n')
        f.write(f'- Missing in nav (docs/*, excl. service/ADR/cards): {len(missing_in_nav)}\n')
        if missing_in_nav:
            f.write('\n### Missing in nav\n')
            for p in missing_in_nav:
                f.write(f'- {p}\n')
    print(f"[quality] report: {REPORT}")
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
