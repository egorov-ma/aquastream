#!/usr/bin/env python3
import os
import re
import shutil
from pathlib import Path
from typing import List, Tuple, Optional

REPO = Path(__file__).resolve().parents[1]
SOURCES_HINTS = ['api', 'contracts']
SPEC_EXTS = ('.yaml', '.yml', '.json')
DEST_SPECS = REPO / 'docs' / 'api' / 'specs'
DEST_REDOC = REPO / 'docs' / 'api' / 'redoc'
INDEX_MD = REPO / 'docs' / 'api' / 'index.md'

OPENAPI_PATTERNS = [
    re.compile(r'^\s*openapi\s*:\s*\d+\.\d+'),
    re.compile(r'"openapi"\s*:\s*"\d+\.\d+"'),
    re.compile(r'^\s*swagger\s*:\s*\d+\.\d+'),
]


def looks_like_openapi(file_path: Path) -> bool:
    try:
        with file_path.open('r', encoding='utf-8', errors='ignore') as f:
            head = f.read(4096)
    except Exception:
        return False
    if not head:
        return False
    for pat in OPENAPI_PATTERNS:
        if pat.search(head):
            return True
    return False


def guess_module(file_path: Path) -> str:
    parts = file_path.relative_to(REPO).parts
    if not parts:
        return 'root'
    top = parts[0]
    if top.startswith('backend-') or top in ('frontend', 'infra'):
        return top
    return 'root'


def find_specs() -> List[Path]:
    specs: List[Path] = []
    for base, dirs, files in os.walk(REPO):
        p = Path(base)
        # prune heavy dirs
        if any(seg in {'.git', '.venv-docs', 'node_modules', 'build', 'bin', 'dist', '.gradle', '.next', '.cache'} for seg in p.parts):
            continue
        if not any(h in p.as_posix() for h in SOURCES_HINTS):
            continue
        for f in files:
            fp = Path(base) / f
            if fp.suffix.lower() in SPEC_EXTS:
                if looks_like_openapi(fp):
                    specs.append(fp)
    return specs


def write_redoc_html(spec_rel_from_html: str, title: str) -> str:
    return f"""<!doctype html>
<html>
  <head>
    <meta charset=\"utf-8\"/>
    <title>{title}</title>
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>
    <style>body {{ margin: 0; padding: 0; }}</style>
    <script src=\"https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js\"></script>
  </head>
  <body>
    <redoc spec-url=\"{spec_rel_from_html}\"></redoc>
  </body>
</html>"""


def ensure_dirs():
    DEST_SPECS.mkdir(parents=True, exist_ok=True)
    DEST_REDOC.mkdir(parents=True, exist_ok=True)


def main() -> int:
    ensure_dirs()
    specs = find_specs()
    rows: List[Tuple[str, str, Path, Path]] = []  # (module, name, spec_dest, html_dest)

    for spec in specs:
        module = guess_module(spec)
        name = spec.stem
        spec_dest_dir = DEST_SPECS / module
        spec_dest_dir.mkdir(parents=True, exist_ok=True)
        spec_dest = spec_dest_dir / spec.name
        shutil.copy2(spec, spec_dest)
        html_dest_dir = DEST_REDOC / module
        html_dest_dir.mkdir(parents=True, exist_ok=True)
        html_dest = html_dest_dir / f"{name}.html"
        # build relative path from HTML to spec
        spec_rel = os.path.relpath(spec_dest, html_dest.parent)
        html = write_redoc_html(spec_rel, f"{module} — {name}")
        html_dest.write_text(html, encoding='utf-8')
        rows.append((module, name, spec_dest, html_dest))

    # write index.md
    INDEX_MD.parent.mkdir(parents=True, exist_ok=True)
    with INDEX_MD.open('w', encoding='utf-8') as f:
        f.write('# API\n\n')
        f.write('---\n')
        f.write('title: API\n')
        f.write('summary: Автоматически сгенерированные страницы API (ReDoc) и исходные спецификации.\n')
        f.write('---\n\n')
        if not rows:
            f.write('Пока не найдено спецификаций OpenAPI. Поместите файлы в `contracts/` или `**/api/` в модулях.\n')
        else:
            f.write('| Модуль | Имя | Спецификация | ReDoc |\n')
            f.write('|---|---|---|---|\n')
            for module, name, spec_dest, html_dest in sorted(rows):
                spec_rel = spec_dest.relative_to(REPO / 'docs')
                html_rel = html_dest.relative_to(REPO / 'docs')
                f.write(f"| {module} | {name} | [{spec_dest.name}]({spec_rel.as_posix()}) | [Открыть]({html_rel.as_posix()}) |\n")
    print(f"[api] specs found: {len(rows)}")
    print(f"[api] index: {INDEX_MD.relative_to(REPO)}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
