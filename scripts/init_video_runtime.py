#!/usr/bin/env python3
"""Initialize the shared Node runtime used by dynamic infographic video projects."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from pathlib import Path


RUNTIME_PACKAGE = {
    "name": "dynamic-infographic-video-runtime",
    "private": True,
    "version": "1.0.0",
    "description": "Shared runtime for dynamic-infographic-video exports.",
}

REQUIRED_PACKAGES = ("playwright", "ffmpeg-static")


def run(command: list[str], cwd: Path) -> None:
    print(f"+ {' '.join(command)}")
    subprocess.run(command, cwd=str(cwd), check=True)


def package_present(runtime_dir: Path, package_name: str) -> bool:
    return (runtime_dir / "node_modules" / package_name).exists()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--runtime-dir",
        type=Path,
        default=None,
        help="Custom runtime directory. Defaults to <skill>/.runtime/node.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Run npm install even when the required packages are already present.",
    )
    parser.add_argument(
        "--skip-browser-install",
        action="store_true",
        help="Install Node packages only; do not run `playwright install chromium`.",
    )
    args = parser.parse_args()

    skill_dir = Path(__file__).resolve().parents[1]
    runtime_dir = (args.runtime_dir or skill_dir / ".runtime" / "node").expanduser().resolve()
    runtime_dir.mkdir(parents=True, exist_ok=True)

    package_json = runtime_dir / "package.json"
    if not package_json.exists():
        package_json.write_text(json.dumps(RUNTIME_PACKAGE, indent=2) + "\n", encoding="utf-8")

    npm = shutil.which("npm")
    npx = shutil.which("npx")
    if not npm:
        raise SystemExit("npm was not found on PATH. Install Node.js before initializing the video runtime.")
    if not npx and not args.skip_browser_install:
        raise SystemExit("npx was not found on PATH. Install Node.js or pass --skip-browser-install.")

    missing = [package_name for package_name in REQUIRED_PACKAGES if not package_present(runtime_dir, package_name)]
    if missing or args.force:
        run([npm, "install", "--no-audit", "--no-fund", *REQUIRED_PACKAGES], runtime_dir)
    else:
        print("Node packages already present; reusing shared runtime.")

    if not args.skip_browser_install:
        run([npx, "playwright", "install", "chromium"], runtime_dir)

    print(f"Shared runtime ready: {runtime_dir}")
    print(f"Node modules: {runtime_dir / 'node_modules'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
