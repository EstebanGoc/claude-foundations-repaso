#!/usr/bin/env python3
"""PreToolUse guard for destructive or policy-violating git commands.

Registered in .claude/settings.json for the Bash tool. Enforces three rules the
harness states in prose but cannot otherwise police:

  1. no plain `git push --force`     -- use --force-with-lease
  2. no AI attribution in commits    -- team policy
  3. no committing on a protected branch

Claude Code sends the tool call as JSON on stdin. Exit 2 blocks the call and
returns stderr to the model as the reason; exit 0 allows it.
"""

import json
import re
import subprocess
import sys

PROTECTED = ("develop", "main", "master")  # CUSTOMISE


def blocked(reason: str, fix: str) -> int:
    print(f"BLOCKED: {reason}\n\n{fix}", file=sys.stderr)
    return 2


def current_branch() -> str:
    try:
        return subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=5,
        ).stdout.strip()
    except (subprocess.SubprocessError, OSError):
        return ""


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return 0  # never break the session over a malformed payload

    if payload.get("tool_name") != "Bash":
        return 0

    cmd = (payload.get("tool_input") or {}).get("command", "")
    if "git" not in cmd:
        return 0

    if re.search(r"git\s+push\b", cmd) and \
       re.search(r"(?<!-)(--force|(?<![\w-])-f)(?![\w-])", cmd):
        if "--force-with-lease" not in cmd:
            return blocked(
                "plain `git push --force` discards commits pushed by other people.",
                "Use `git push --force-with-lease`. See docs/gitflow.md.",
            )

    if re.search(r"git\s+commit\b", cmd):
        if re.search(r"co-authored-by:\s*claude", cmd, re.IGNORECASE) or \
           re.search(r"generated with \[?claude", cmd, re.IGNORECASE):
            return blocked(
                "AI attribution in a commit message.",
                "Team policy: no `Co-Authored-By: Claude` or similar.",
            )

        branch = current_branch()
        if branch in PROTECTED:
            return blocked(
                f"committing directly on protected branch `{branch}`.",
                "Work belongs on a feature/bugfix/hotfix/chore branch. "
                "See docs/gitflow.md.",
            )

    return 0


if __name__ == "__main__":
    sys.exit(main())
