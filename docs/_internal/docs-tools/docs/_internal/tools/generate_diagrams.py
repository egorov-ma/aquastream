#!/usr/bin/env python3
import os
import subprocess
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
SRC = REPO / 'docs' / '_diagrams'
DEST = REPO / 'docs' / '_media' / 'diagrams'

PUML_EXT = '.puml'
MERMAID_EXT = ('.mmd', '.mermaid')

STRICT = os.environ.get('DIAGRAMS_STRICT', '0') == '1'


def ensure_dirs():
    DEST.mkdir(parents=True, exist_ok=True)


def render_plantuml(puml_file: Path) -> bool:
    out_png = DEST / (puml_file.stem + '.png')
    try:
        cmd = [
            'docker', 'run', '--rm', '-v', f'{puml_file.parent.as_posix()}:/work', '-v', f'{DEST.as_posix()}:/out',
            'plantuml/plantuml:1.2024.6', '-tpng', '-o', '/out', f'/work/{puml_file.name}'
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"[diagram] PUML → {out_png}")
        return True
    except Exception as e:
        print(f"[error] PlantUML render failed for {puml_file}: {e}")
        return False


def main() -> int:
    ensure_dirs()
    if not SRC.exists():
        print('[diagram] no source directory, skipping')
        return 0
    failures = 0
    for root, dirs, files in os.walk(SRC):
        for f in files:
            p = Path(root) / f
            if p.suffix.lower() == PUML_EXT:
                ok = render_plantuml(p)
                if not ok:
                    failures += 1
            elif p.suffix.lower() in MERMAID_EXT:
                # Rendered at runtime by mkdocs-mermaid2-plugin
                pass
    if failures and STRICT:
        print(f"[diagram] failures: {failures}")
        return 1
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
