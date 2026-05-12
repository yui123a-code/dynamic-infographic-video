#!/usr/bin/env python3
"""Copy PPT Master SVG pages into a video project as slide backplates."""

from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path


def natural_key(path: Path) -> list[object]:
    parts = re.split(r"(\d+)", path.stem.lower())
    return [int(part) if part.isdigit() else part for part in parts]


def find_svg_dir(project_dir: Path) -> Path:
    for name in ("svg_output", "svg_final"):
        svg_dir = project_dir / name
        if svg_dir.exists():
            svg_files = sorted(svg_dir.glob("*.svg"), key=natural_key)
            if svg_files:
                return svg_dir
    raise SystemExit(f"No SVG pages found in {project_dir / 'svg_output'} or {project_dir / 'svg_final'}.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pptmaster_project", help="PPT Master project directory containing svg_output/ or svg_final/.")
    parser.add_argument("video_project", help="Dynamic infographic video project directory.")
    args = parser.parse_args()

    pptmaster_project = Path(args.pptmaster_project).expanduser().resolve()
    video_project = Path(args.video_project).expanduser().resolve()
    if not pptmaster_project.exists():
        raise SystemExit(f"PPT Master project not found: {pptmaster_project}")
    if not video_project.exists():
        raise SystemExit(f"Video project not found: {video_project}")

    svg_dir = find_svg_dir(pptmaster_project)
    output_dir = video_project / "assets" / "slides"
    output_dir.mkdir(parents=True, exist_ok=True)

    slides = []
    for index, source_svg in enumerate(sorted(svg_dir.glob("*.svg"), key=natural_key), start=1):
        target_name = f"slide-{index:02d}.svg"
        target_svg = output_dir / target_name
        shutil.copy2(source_svg, target_svg)
        slides.append(
            {
                "index": index,
                "source": str(source_svg),
                "asset": f"assets/slides/{target_name}",
            }
        )

    notes_path = pptmaster_project / "notes" / "total.md"
    manifest = {
        "mode": "ppt-master",
        "sourceProject": str(pptmaster_project),
        "sourceSvgDir": str(svg_dir),
        "notesPath": str(notes_path) if notes_path.exists() else None,
        "slides": slides,
    }
    manifest_path = output_dir / "slide_manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Imported {len(slides)} slide backplates into {output_dir}")
    print(f"Manifest: {manifest_path}")
    print("Set timeline.source.mode to 'ppt-master' and assign each scene.backplate from the manifest asset paths.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
