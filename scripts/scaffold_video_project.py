#!/usr/bin/env python3
"""Copy the dynamic infographic HTML video template into a project directory."""

from __future__ import annotations

import argparse
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
    print(output_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
