#!/usr/bin/env python3
import os
import re
from typing import List, Dict, Tuple

REPORT = 'docs/_reports/markdown_normalization_report.md'
TARGET_DIRS = ['docs']  # позже можно добавить module/**/docs

H1_RE = re.compile(r'^\s*#\s+.+')
H2_RE = re.compile(r'^\s*##\s+.+')
HEADER_RE = re.compile(r'^(\s*#{1,6})\s+.+')
ABS_GH_RE = re.compile(r'https?://github\.com/.+')
CODE_FENCE_RE = re.compile(r'^```([a-zA-Z0-9+-]*)\s*$')
LINK_MD_RE = re.compile(r'\[[^\]]+\]\(([^)]+)\)')


def list_markdown_files(root: str) -> List[str]:
    res = []
    for base in TARGET_DIRS:
        abs_base = os.path.join(root, base)
        if not os.path.isdir(abs_base):
            continue
        for cur, dirs, files in os.walk(abs_base):
            for f in files:
                if f.lower().endswith('.md'):
                    res.append(os.path.join(cur, f))
    return sorted(res)


def strip_front_matter(lines: List[str]) -> Tuple[List[str], bool]:
    if not lines:
        return lines, False
    if lines[0].strip() != '---':
        return lines, False
    for i in range(1, min(len(lines), 500)):
        if lines[i].strip() == '---':
            return lines[i+1:], True
    return lines, False


def analyze_file(path: str) -> Dict[str, object]:
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        raw_lines = f.readlines()
    content_lines, has_front_matter = strip_front_matter(raw_lines)
    issues: List[str] = []

    # H1 and summary after front matter
    if not content_lines or not H1_RE.match(content_lines[0]):
        issues.append('missing-or-invalid-h1')
    else:
        # summary is the next non-empty line after H1
        summary_ok = False
        for ln in content_lines[1:4]:
            if ln.strip():
                summary_ok = True
                break
        if not summary_ok:
            issues.append('missing-summary-after-h1')

    # Heading level jumps (use full file but ignore front matter)
    last_level = 0
    for line in content_lines:
        m = HEADER_RE.match(line)
        if not m:
            continue
        level = len(m.group(1).strip())
        if last_level and level > last_level + 1:
            issues.append(f'heading-level-jump:{last_level}->{level}')
        last_level = level

    # Absolute Github links
    for line in content_lines:
        if ABS_GH_RE.search(line):
            issues.append('has-absolute-github-link')
            break

    # Code fence languages (check only opening fences)
    inside_fence = False
    for line in content_lines:
        m = CODE_FENCE_RE.match(line)
        if not m:
            continue
        lang = m.group(1)
        if not inside_fence:
            # opening fence
            if lang == '':
                issues.append('code-fence-missing-language')
                break
            inside_fence = True
        else:
            # closing fence
            inside_fence = False

    # Relative links existence (superficial check)
    joined = ''.join(content_lines)
    for m in LINK_MD_RE.finditer(joined):
        href = m.group(1)
        if href.startswith(('http://', 'https://', '#')):
            continue
        base_dir = os.path.dirname(path)
        target = os.path.normpath(os.path.join(base_dir, href))
        if not os.path.exists(target):
            issues.append(f'broken-relative-link:{href}')

    return {'path': path, 'issues': sorted(set(issues))}


def write_report(root: str, results: List[Dict[str, object]]):
    os.makedirs(os.path.join(root, 'docs/_reports'), exist_ok=True)
    report_path = os.path.join(root, REPORT)
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write('# Markdown Normalization Report\n\n')
        total = len(results)
        with_issues = sum(1 for r in results if r['issues'])
        f.write(f'Total files: {total}\n\n')
        f.write(f'Files with issues: {with_issues}\n\n')
        for r in results:
            if not r['issues']:
                continue
            rel = os.path.relpath(r['path'], root)
            f.write(f'## {rel}\n\n')
            for iss in r['issues']:
                f.write(f'- {iss}\n')
            f.write('\n')
    print(f'[normalize] report: {REPORT}')


def main() -> int:
    root = os.getcwd()
    files = list_markdown_files(root)
    results = [analyze_file(p) for p in files]
    write_report(root, results)
    return 0

if __name__ == '__main__':
    import sys
    sys.exit(main())
