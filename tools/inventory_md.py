#!/usr/bin/env python3
import argparse
import csv
import json
import os
import re
import subprocess
from datetime import datetime
from typing import Dict, List, Tuple

EXCLUDE_DIR_NAMES = {
    'node_modules', 'dist', 'build', 'out', 'coverage', '.next', '.nuxt', '.turbo', '.cache',
    '.git', '.github', '.gradle', 'bin', '.idea', '.vscode', 'test-results', '.venv', '.venv-docs'
}

MD_EXT = '.md'


def detect_language(sample_text: str) -> str:
    has_cyr = bool(re.search(r"[\u0400-\u04FF]", sample_text))
    has_lat = bool(re.search(r"[A-Za-z]", sample_text))
    if has_cyr and not has_lat:
        return 'ru'
    if has_lat and not has_cyr:
        return 'en'
    if has_cyr and has_lat:
        return 'mixed'
    return 'unknown'


def extract_h1_h2(file_path: str) -> Tuple[str, str]:
    h1 = ''
    h2 = ''
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
    except Exception:
        return h1, h2

    # Skip YAML front matter if present
    start_idx = 0
    for i, line in enumerate(lines[:5]):
        if line.strip() == '---':
            # find closing '---'
            for j in range(i + 1, min(len(lines), i + 200)):
                if lines[j].strip() == '---':
                    start_idx = j + 1
                    break
            break

    for line in lines[start_idx:]:
        if not h1:
            m1 = re.match(r"^\s*#\s+(.+)$", line)
            if m1:
                h1 = m1.group(1).strip()
                continue
        if not h2:
            m2 = re.match(r"^\s*##\s+(.+)$", line)
            if m2:
                h2 = m2.group(1).strip()
        if h1 and h2:
            break
    return h1, h2


def get_file_language(file_path: str, sample_size: int = 4000) -> str:
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            sample = f.read(sample_size)
        return detect_language(sample)
    except Exception:
        return 'unknown'


def get_git_last_commit(repo_root: str, rel_path: str) -> Tuple[str, str]:
    try:
        result = subprocess.run(
            ['git', '-C', repo_root, 'log', '-1', '--pretty=format:%cs|%an', '--', rel_path],
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, check=False, text=True
        )
        output = result.stdout.strip()
        if '|' in output:
            date_str, author = output.split('|', 1)
            return date_str, author
        return 'N/A', 'N/A'
    except Exception:
        return 'N/A', 'N/A'


def should_skip_dir(dir_name: str) -> bool:
    if dir_name in EXCLUDE_DIR_NAMES:
        return True
    if dir_name.startswith('.') and dir_name not in {'.', '..'}:
        # Skip other hidden dirs by default
        return True
    return False


def find_markdown_files(repo_root: str) -> List[str]:
    md_files: List[str] = []
    for current_root, dirnames, filenames in os.walk(repo_root):
        # Prune dirs in-place
        dirnames[:] = [d for d in dirnames if not should_skip_dir(d)]
        for fname in filenames:
            if fname.lower().endswith(MD_EXT):
                abs_path = os.path.join(current_root, fname)
                rel_path = os.path.relpath(abs_path, repo_root)
                md_files.append(rel_path)
    return sorted(md_files)


def write_csv(rows: List[Dict[str, str]], csv_path: str) -> None:
    os.makedirs(os.path.dirname(csv_path), exist_ok=True)
    fieldnames = ['path', 'h1', 'h2_first', 'lang', 'size_bytes', 'last_commit_date', 'last_author']
    with open(csv_path, 'w', encoding='utf-8', newline='') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def write_json(rows: List[Dict[str, str]], json_path: str) -> None:
    os.makedirs(os.path.dirname(json_path), exist_ok=True)
    with open(json_path, 'w', encoding='utf-8') as jf:
        json.dump(rows, jf, ensure_ascii=False, indent=2)


def main() -> int:
    parser = argparse.ArgumentParser(description='Inventory Markdown files in a repo')
    parser.add_argument('--repo-root', default='.', help='Path to repository root')
    parser.add_argument('--csv', default='docs/_inventory/md_inventory.csv', help='CSV output path')
    parser.add_argument('--json', default='docs/_inventory/md_inventory.json', help='JSON output path')
    args = parser.parse_args()

    repo_root = os.path.abspath(args.repo_root)

    md_files = find_markdown_files(repo_root)

    rows: List[Dict[str, str]] = []
    for rel_path in md_files:
        abs_path = os.path.join(repo_root, rel_path)
        try:
            size_bytes = os.path.getsize(abs_path)
        except OSError:
            size_bytes = 0
        h1, h2 = extract_h1_h2(abs_path)
        lang = get_file_language(abs_path)
        last_date, last_author = get_git_last_commit(repo_root, rel_path)
        rows.append({
            'path': rel_path.replace('\\', '/'),
            'h1': h1,
            'h2_first': h2,
            'lang': lang,
            'size_bytes': str(size_bytes),
            'last_commit_date': last_date,
            'last_author': last_author,
        })

    write_csv(rows, os.path.join(repo_root, args.csv) if not os.path.isabs(args.csv) else args.csv)
    write_json(rows, os.path.join(repo_root, args.json) if not os.path.isabs(args.json) else args.json)

    print(f"[inventory] Markdown files: {len(rows)}")
    print(f"[inventory] CSV: {args.csv}")
    print(f"[inventory] JSON: {args.json}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
