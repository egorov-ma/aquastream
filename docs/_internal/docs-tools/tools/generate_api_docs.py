#!/usr/bin/env python3
import os
import re
import shutil
from pathlib import Path
from typing import List, Tuple, Optional

REPO = Path(__file__).resolve().parents[4]
SOURCES_HINTS = ['api', 'docs/api/specs']
SPEC_EXTS = ('.yaml', '.yml', '.json')
DEST_SPECS = REPO / 'docs' / 'api' / 'specs'
DEST_REDOC = REPO / 'docs' / 'api' / 'redoc'
DEST_SWAGGER = REPO / 'docs' / 'api' / 'swagger'
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


def write_swagger_html(spec_rel_from_html: str, title: str) -> str:
    cdn_base = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5"
    return f"""<!doctype html>
<html>
  <head>
    <meta charset=\"utf-8\"/>
    <title>{title}</title>
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>
    <link rel=\"stylesheet\" href=\"{cdn_base}/swagger-ui.css\"/>
    <style>html, body {{ margin: 0; padding: 0; }}</style>
  </head>
  <body>
    <div id=\"swagger-ui\"></div>
    <script src=\"{cdn_base}/swagger-ui-bundle.js\"></script>
    <script src=\"{cdn_base}/swagger-ui-standalone-preset.js\"></script>
    <script>
      window.onload = function() {{
        const ui = SwaggerUIBundle({{
          url: '{spec_rel_from_html}',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'BaseLayout'
        }});
        window.ui = ui;
      }};
    </script>
  </body>
</html>"""


def ensure_dirs():
    DEST_SPECS.mkdir(parents=True, exist_ok=True)
    DEST_REDOC.mkdir(parents=True, exist_ok=True)
    DEST_SWAGGER.mkdir(parents=True, exist_ok=True)


def main() -> int:
    ensure_dirs()
    specs = find_specs()
    rows: List[Tuple[str, Path, Path, Path]] = []  # (name, spec_dest, redoc_dest, swagger_dest)

    for spec in specs:
        name = spec.stem
        spec_dest_dir = DEST_SPECS
        spec_dest_dir.mkdir(parents=True, exist_ok=True)
        spec_dest = spec_dest_dir / spec.name
        # Only copy if source and destination are different
        if spec.resolve() != spec_dest.resolve():
            shutil.copy2(spec, spec_dest)
        html_dest_dir = DEST_REDOC
        html_dest_dir.mkdir(parents=True, exist_ok=True)
        html_dest = html_dest_dir / f"{name}.html"
        spec_rel = os.path.relpath(spec_dest, html_dest.parent)
        html = write_redoc_html(spec_rel, name)
        html_dest.write_text(html, encoding='utf-8')

        swagger_dest_dir = DEST_SWAGGER
        swagger_dest_dir.mkdir(parents=True, exist_ok=True)
        swagger_dest = swagger_dest_dir / f"{name}.html"
        swagger_rel = os.path.relpath(spec_dest, swagger_dest.parent)
        swagger_html = write_swagger_html(swagger_rel, f"{name} (Swagger UI)")
        swagger_dest.write_text(swagger_html, encoding='utf-8')

        rows.append((name, spec_dest, html_dest, swagger_dest))

    # write index.md
    INDEX_MD.parent.mkdir(parents=True, exist_ok=True)
    with INDEX_MD.open('w', encoding='utf-8') as f:
        f.write('---\n')
        f.write('title: API\n')
        f.write('summary: Автоматически сгенерированные страницы API (ReDoc) и интерактивный Swagger UI.\n')
        f.write('---\n\n')
        f.write('# API\n\n')
        f.write(
            'Эта страница собирается автоматически из OpenAPI спецификаций, расположенных в '
            '`docs/api/specs/`. Для каждого файла создаются две HTML-версии:\n\n'
        )
        f.write('- **ReDoc** — удобный режим чтения спецификации.\n')
        f.write('- **Swagger UI** — интерактивное тестирование и проверка контрактов.\n\n')
        f.write('## Обновление\n\n')
        f.write('```bash\n')
        f.write('python3 docs/_internal/docs-tools/tools/generate_api_docs.py\n')
        f.write('```\n\n')
        f.write('Команда копирует актуальные спецификации, пересобирает HTML и индекс.\n\n')
        if not rows:
            f.write('Пока не найдено спецификаций OpenAPI. Поместите файлы в `docs/api/specs/` и выполните скрипт выше.\n')
        else:
            f.write('## Список API\n\n')
            f.write('| API | Спецификация | ReDoc | Swagger UI |\n')
            f.write('|---|---|---|---|\n')
            for name, spec_dest, html_dest, swagger_dest in sorted(set(rows)):
                spec_rel = spec_dest.relative_to(INDEX_MD.parent)
                html_rel = html_dest.relative_to(INDEX_MD.parent)
                swagger_rel = swagger_dest.relative_to(INDEX_MD.parent)
                f.write(
                    f"| {name} | [{spec_dest.name}]({spec_rel.as_posix()}) | "
                    f"[Открыть]({html_rel.as_posix()}) | [Открыть]({swagger_rel.as_posix()}) |\n"
                )
    print(f"[api] specs found: {len(rows)}")
    print(f"[api] index: {INDEX_MD.relative_to(REPO)}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
