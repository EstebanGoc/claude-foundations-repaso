#!/usr/bin/env python3
"""Scan the added lines of a diff for credentials and block the commit if any appear.

Run by .githooks/pre-commit (armed by `python init.py`). Two rule classes:

  A. CREDENTIAL ASSIGNMENTS -- `Password=`, `AccountKey=`, `ClientSecret=`,
     `ApiKey=`, `Token=` ... with a value that looks real.

  B. PARSER ERROR MESSAGES -- `Keyword not supported: '...'`, `Format of the
     initialization string ...`. When a parser rejects a connection string it
     echoes the unparsed remainder, which usually starts in the middle of the
     password. Pasting "the error as evidence" is how a credential leaks without
     anyone noticing; class A would not catch it because there is no `Password=`.

Usage:
    secret-guard.py                 scan the staged diff (pre-commit)
    secret-guard.py --range A..B    scan a commit range
    secret-guard.py --file PATH     scan one whole file

Exit 0 = clean, 1 = findings. Bypass: `git commit --no-verify` or
SKIP_SECRET_GUARD=1. Prefer redacting: keep the message, replace the secret
with a placeholder such as <redacted>.
"""

import os
import re
import subprocess
import sys

KEYS = r"(password|pwd|passwd|accountkey|clientsecret|client_secret|apikey|api_key|" \
       r"sastoken|sas_token|secret|token|connectionstring)"
ASSIGN = re.compile(KEYS + r"\s*[:=]\s*[\"']?([^\"';\s,}]+)", re.IGNORECASE)
PARSER_ERRORS = re.compile(
    r"(keyword not supported:\s*'|format of the initialization string|persist security info)",
    re.IGNORECASE,
)
PLACEHOLDER = re.compile(
    r"^(<.*>|\.\.\.|\*+|todo_\w*|redacted|\$\(.*\)|\$\{.*\}|\{.*\}|x+|changeme|"
    r"true|false|null|none|\"\"|'')$",
    re.IGNORECASE,
)
# Files that already carry secrets: warn instead of block, or the guard gets
# switched off. CUSTOMISE.
WARN_ONLY = re.compile(r"(appsettings\.[A-Za-z]+\.json|\.env\.example)$")


def looks_real(value: str) -> bool:
    if PLACEHOLDER.match(value):
        return False
    # Short values with no digit are mostly identifiers, not secrets.
    return len(value) >= 12 or any(ch.isdigit() for ch in value)


def added_lines(diff: str):
    path = None
    for line in diff.splitlines():
        if line.startswith("+++ "):
            path = line[6:] if line.startswith("+++ b/") else line[4:]
        elif line.startswith("+") and not line.startswith("+++"):
            yield path, line[1:]


def git(*args: str) -> str:
    return subprocess.run(["git", *args], capture_output=True, text=True,
                          encoding="utf-8", errors="replace").stdout


def scan(pairs) -> int:
    blocking = 0
    for path, text in pairs:
        reason = None
        if PARSER_ERRORS.search(text):
            reason = "parser error message that may echo part of a credential"
        else:
            for match in ASSIGN.finditer(text):
                if looks_real(match.group(2)):
                    reason = f"credential assignment ({match.group(1)})"
                    break
        if not reason:
            continue
        level = "WARN" if path and WARN_ONLY.search(path) else "BLOCK"
        print(f"secret-guard {level}: {path}: {reason}", file=sys.stderr)
        if level == "BLOCK":
            blocking += 1
    if blocking:
        print("\nRedact the credential and keep the rest of the evidence. "
              "If a real secret was committed before, rotate it.", file=sys.stderr)
    return 1 if blocking else 0


def main(argv) -> int:
    if os.environ.get("SKIP_SECRET_GUARD"):
        return 0
    if len(argv) >= 2 and argv[0] == "--file":
        with open(argv[1], encoding="utf-8", errors="replace") as fh:
            return scan((argv[1], line) for line in fh)
    if len(argv) >= 2 and argv[0] == "--range":
        return scan(added_lines(git("diff", "--unified=0", argv[1])))
    return scan(added_lines(git("diff", "--cached", "--unified=0")))


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
