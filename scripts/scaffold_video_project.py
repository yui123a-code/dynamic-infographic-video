#!/usr/bin/env python3
"""Copy the dynamic infographic HTML video template into a project directory."""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output_dir", help="Destination directory for the editable video project.")
    parser.add_argument("--force", action="store_true", help="Replace the destination if it already exists.")
    args = parser.parse_args()

    skill_dir = Path(__file__).resolve().parents[1]
    template_dir = skill_dir / "assets" / "html-video-template"
    output_dir = Path(args.output_dir).expanduser().resolve()

    if not template_dir.exists():
        raise SystemExit(f"Template not found: {template_dir}")

    if output_dir.exists():
        if not args.force:
            raise SystemExit(f"Destination already exists: {output_dir}. Use --force to replace it.")
        shutil.rmtree(output_dir)

    shutil.copytree(template_dir, output_dir)
    runtime_dir = skill_dir / ".runtime" / "node"
    runtime_config = {
        "skillDir": str(skill_dir),
        "runtimeDir": str(runtime_dir),
        "nodeModules": str(runtime_dir / "node_modules"),
        "initCommand": f"python {skill_dir / 'scripts' / 'init_video_runtime.py'}",
    }
    (output_dir / ".skill-runtime.json").write_text(
        json.dumps(runtime_config, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(output_dir)
    if not (runtime_dir / "node_modules").exists():
        print(f"Shared runtime is not initialized yet. Run once: {runtime_config['initCommand']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
