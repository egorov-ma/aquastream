#!/usr/bin/env python3
import csv
import os
import re
from typing import Dict, List, Tuple

INVENTORY_CSV = 'docs/_inventory/md_inventory.csv'
TAGS_CSV = 'docs/_inventory/tags.csv'
MOVE_PLAN_CSV = 'docs/_inventory/move_plan.csv'

MODULE_PREFIXES = (
    'backend-',
    'frontend',
    'infra',
    'build-logic',
)

ROOT_SPECIAL_KEEP = {
    'README.md',
    'CONTRIBUTING.md',
    'CODE_OF_CONDUCT.md',
    'SECURITY.md',
    'LICENSE',
}

DOCS_KEEP_DIRS = (
    'docs/',
    'doc-as-code-todos/',
    '.github/',
)

def read_inventory(repo_root: str) -> List[Dict[str, str]]:
    rows: List[Dict[str, str]] = []
    path = os.path.join(repo_root, INVENTORY_CSV)
    with open(path, 'r', encoding='utf-8') as f:
        rdr = csv.DictReader(f)
        for row in rdr:
            rows.append(row)
    return rows


def detect_scope(repo_root: str, path: str) -> Tuple[str, str]:
    if path.startswith('docs/'):
        return 'root', ''
    first = path.split('/', 1)[0]
    if any(first.startswith(p) for p in MODULE_PREFIXES):
        return f'module:{first}', first
    if path.startswith('doc-as-code-todos/') or path.startswith('.github/'):
        return 'root', ''
    return 'root', ''


def detect_topic(path: str, h1: str, h2: str) -> str:
    text = f"{path} {h1} {h2}".lower()
    checks = [
        ('adr', r'(\badr\b|/adr/)'),
        ('api', r'(openapi|swagger|api\b)'),
        ('architecture', r'(architecture|архитектур|design)'),
        ('ops', r'(runbook|ops|operations|эксплуатац)'),
        ('qa', r'(qa|test|тест)'),
        ('style', r'(style|styleguide|contributing|стиль)'),
        ('changelog', r'(changelog|изменени|release\s+notes)'),
        ('faq', r'(faq|вопросы|часто\s+задаваемые)'),
        ('guide', r'(readme|guide|инструкц|руководств)'),
    ]
    for topic, pat in checks:
        if re.search(pat, text):
            return topic
    return 'other'


def target_path(repo_root: str, path: str, scope: str, module_name: str) -> Tuple[str, str]:
    if path.startswith('docs/'):
        return path, 'identity'
    if path.startswith('doc-as-code-todos/') or path.startswith('.github/'):
        return path, 'identity'
    if path in ROOT_SPECIAL_KEEP:
        return path, 'identity'
    if path == 'BUILD.md':
        return 'docs/getting-started/build-guide.md', 'move-build-to-getting-started'
    if scope.startswith('module:'):
        rest = path[len(module_name):].lstrip('/')
        fname = os.path.basename(path)
        if '/' not in rest:
            return f'{module_name}/docs/{fname}', 'module-root-docs'
        if '/docs/' in rest or rest.startswith('docs/'):
            return path, 'identity'
        sub = rest.split('/', 1)[0]
        return f'{module_name}/{sub}/docs/{fname}', 'module-sub-docs'
    return path, 'identity'


def write_csv(rows: List[Dict[str, str]], out_path: str, fieldnames: List[str]) -> None:
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in rows:
            w.writerow(r)


def main() -> int:
    repo_root = os.getcwd()
    inv = read_inventory(repo_root)

    tags_rows: List[Dict[str, str]] = []
    plan_rows: List[Dict[str, str]] = []

    for row in inv:
        path = row['path']
        h1 = row.get('h1', '') or ''
        h2 = row.get('h2_first', '') or ''
        scope, module_name = detect_scope(repo_root, path)
        topic = detect_topic(path, h1, h2)
        tags_rows.append({'path': path, 'scope': scope, 'topic': topic})
        to_path, reason = target_path(repo_root, path, scope, module_name)
        plan_rows.append({'from': path, 'to': to_path, 'reason': reason})

    write_csv(tags_rows, os.path.join(repo_root, TAGS_CSV), ['path', 'scope', 'topic'])
    write_csv(plan_rows, os.path.join(repo_root, MOVE_PLAN_CSV), ['from', 'to', 'reason'])

    print(f"[map] tags: {len(tags_rows)} rows → {TAGS_CSV}")
    print(f"[map] move plan: {len(plan_rows)} moves → {MOVE_PLAN_CSV}")
    return 0

if __name__ == '__main__':
    import sys
    sys.exit(main())
