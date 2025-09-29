#!/usr/bin/env python3
import re
from pathlib import Path


def quote_front_matter_values(text: str) -> tuple[str, bool]:
    m = re.match(r"^---\s*\n(.*?)\n---(\s*\n)?", text, flags=re.S)
    if not m:
        return text, False
    header = m.group(1)

    def repl(match: re.Match) -> str:
        key = match.group(1)
        value = match.group(2).strip()
        if value.startswith(('"', "'")):
            return match.group(0)
        # escape inner quotes
        value = value.replace('"', '\\"')
        return f"{key}: \"{value}\""

    new_header = re.sub(r"^(title|summary)\s*:\s*(.+)$", repl, header, flags=re.M)
    if new_header == header:
        return text, False
    start, end = m.span()
    rest = text[end:]
    # Ensure newline after closing front matter
    if rest.startswith('#'):
        rest = "\n" + rest
    elif rest.startswith('\r\n#'):
        rest = "\r\n" + rest
    new_text = f"---\n{new_header}\n---" + rest
    return new_text, True


def main() -> None:
    repo = Path(__file__).resolve().parents[3]
    all_md = [p for p in repo.rglob('*.md') if '/docs/' in str(p)]
    changed = 0
    for p in all_md:
        try:
            content = p.read_text(encoding='utf-8')
        except Exception:
            continue
        new_content, did = quote_front_matter_values(content)
        if did:
            p.write_text(new_content, encoding='utf-8')
            changed += 1
            print(f"[fix] quoted front matter in {p}")
    print(f"Done. Files changed: {changed}")


if __name__ == '__main__':
    main()


