#!/usr/bin/env python3
import os
import subprocess
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SRC = REPO / 'docs' / '_diagrams'
DEST = REPO / 'docs' / '_media' / 'diagrams'

PUML_EXT = '.puml'
MERMAID_EXT = ('.mmd', '.mermaid')


def ensure_dirs():
    DEST.mkdir(parents=True, exist_ok=True)


def render_plantuml(puml_file: Path) -> None:
    out_png = DEST / (puml_file.stem + '.png')
    try:
        # Try local dockerized PlantUML
        cmd = [
            'docker', 'run', '--rm', '-v', f'{puml_file.parent.as_posix()}:/work', '-v', f'{DEST.as_posix()}:/out',
            'plantuml/plantuml:latest', '-tpng', '-o', '/out', f'/work/{puml_file.name}'
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except Exception:
        # Fallback: remote render via plantuml.com (simplified)
        # Note: For CI stability, prefer docker path.
        print(f"[warn] Docker PlantUML failed for {puml_file}, skipping remote render.")
    print(f"[diagram] PUML → {out_png}")


def main() -> int:
    ensure_dirs()
    if not SRC.exists():
        print('[diagram] no source directory, skipping')
        return 0
    for root, dirs, files in os.walk(SRC):
        for f in files:
            p = Path(root) / f
            if p.suffix.lower() == PUML_EXT:
                render_plantuml(p)
            elif p.suffix.lower() in MERMAID_EXT:
                # Rendered at runtime by mkdocs-mermaid2-plugin
                pass
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
