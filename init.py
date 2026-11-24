#!/usr/bin/env python3
"""Check the environment the agent harness needs and arm the git hooks.

    python init.py

Safe to run any number of times. Run it once per clone and once per new git
worktree: core.hooksPath is a per-clone setting, so a fresh checkout has the
guards unarmed until this runs.
"""

import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
AGENTS = ("orchestrator", "analyzer", "implementer", "validator", "reviewer", "manager")
REQUIRED = (
    "CLAUDE.md",
    "AGENTS.md",
    ".claude/CLAUDE.md",
    ".claude/settings.json",
    ".claude/commands/task.md",
    ".claude/commands/harness-improve.md",
    ".claude/hooks/git-guard.py",
    ".claude/hooks/secret-guard.py",
    ".claude/agent-memory/README.md",
    ".claude/workspace/README.md",
    ".githooks/pre-commit",
)
# CUSTOMISE: the tools your build and tests need.
TOOLS = ("git",)

problems = 0


def ok(msg):
    print(f"  [ OK ] {msg}")


def warn(msg):
    print(f"  [WARN] {msg}")


def fail(msg):
    global problems
    problems += 1
    print(f"  [FAIL] {msg}")


def run(cmd):
    try:
        res = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=20)
        return res.returncode, res.stdout.strip()
    except (OSError, subprocess.SubprocessError) as exc:
        return 1, str(exc)


def main() -> int:
    print("\n1. Toolchain")
    ok(f"python {sys.version.split()[0]}")
    for tool in TOOLS:
        ok(tool) if shutil.which(tool) else fail(f"{tool} not found on PATH")

    print("\n2. Harness layout")
    for rel in REQUIRED:
        path = ROOT / rel
        ok(rel) if path.is_file() and path.stat().st_size > 0 else fail(f"{rel} missing or empty")
    for agent in AGENTS:
        rel = f".claude/agents/{agent}.md"
        ok(rel) if (ROOT / rel).is_file() else fail(f"{rel} missing")
        (ROOT / f".claude/agent-memory/{agent}/entries").mkdir(parents=True, exist_ok=True)
    (ROOT / ".claude/workspace/tasks").mkdir(parents=True, exist_ok=True)

    print("\n3. Git hooks")
    rc, _ = run(["git", "rev-parse", "--is-inside-work-tree"])
    if rc != 0:
        warn("not a git repository yet -- run `git init`, then this script again")
    else:
        rc, current = run(["git", "config", "core.hooksPath"])
        if current == ".githooks":
            ok("core.hooksPath = .githooks (guards armed)")
        else:
            rc, _ = run(["git", "config", "core.hooksPath", ".githooks"])
            ok("core.hooksPath set to .githooks (guards armed)") if rc == 0 else \
                fail("could not set core.hooksPath -- run: git config core.hooksPath .githooks")

        rc, out = run(["git", "check-ignore", ".claude/workspace/current.md"])
        ok(".claude/workspace/ is ignored") if rc == 0 else \
            warn(".claude/workspace/ is NOT ignored -- copy gitignore.snippet into .gitignore")

    print()
    if problems:
        print(f"{problems} problem(s) found.")
        return 1
    print("All checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
