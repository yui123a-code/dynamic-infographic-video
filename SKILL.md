---
name: dynamic-infographic-video
description: Create final narrated 16:9 animated infographic videos from source documents, Markdown files, Word documents, PDFs, PPT/PPTX pages, screenshots, or technical text. Use when Codex must turn input material into an HTML/CSS/JavaScript motion infographic, optionally use a ppt-master deck/SVG pages as the visual master, generate AI voiceover audio from a script, align narration with the visuals, validate it, and export the finished MP4.
---

# Dynamic Infographic Video

## Outcome

Produce the final video, not just a plan. The expected deliverable is a narrated 16:9 animated infographic video, implemented with HTML + CSS + JavaScript, rendered in a browser, checked visually, combined with AI-generated voiceover audio, and exported as MP4. Keep source files so the user can request edits and regenerate.

Do not lock the video to a fixed duration. Decide duration from the source content, the number of ideas that must be explained, and the generated narration length. The video duration must be the timeline needed to explain the document clearly, not a template default.

Default visual language unless the user gives another style: technical infographic, fine structural lines, readable main text, risk/warning labels, translucent panels, simple module blocks, thin arrows, no real-photo background, no unrelated AI scene generation.

Choose the background theme automatically from the source content. Vary palette and background texture across projects while keeping it infographic-native. Never use real photos, photorealistic AI backgrounds, factory footage, data-center footage, scenic images, complex illustrations, or decorative scene art as the background.

## Operating Modes

Use one of two modes:

- **PPT-master handoff mode**: when the user provides a PPT/PPTX, a ppt-master project, or asks to use ppt-master first. ppt-master owns art direction, page composition, typography, and visual polish. This skill owns motion, timing, camera movement, highlights, narration, validation, and MP4 export.
- **Standalone mode**: when the user provides source content and no PPT visual master is requested. Build the infographic video directly from the source with the HTML template, diagrams, charts, and abstract theme backgrounds.

In PPT-master handoff mode, do not redesign the deck from scratch. Use the deck pages or ppt-master SVG pages as scene backplates and add restrained video behavior on top: zoom/pan, focus rings, progressive highlights, callouts, animated arrows, subtitle beats, and narration alignment. Map one slide to one scene by default; split only if one slide contains multiple dense ideas, and merge only if slides are too sparse for separate narration.

When ppt-master is available upstream, prefer its project folder over only the exported `.pptx`: use `<ppt_project>/svg_output/*.svg` as high-fidelity slide backplates and `<ppt_project>/notes/total.md` as narration source material when present. Use `scripts/import_pptmaster_assets.py <ppt_project> <video_project>` after scaffolding to copy those SVG pages into `assets/slides/` and create a slide manifest. Then set `timeline.js` to `source.mode: "ppt-master"` and set each scene's `backplate` to the corresponding `assets/slides/slide-XX.svg` path.

## Shared Runtime

Do not install Node dependencies inside every generated video project. This skill uses a shared runtime under:

```text
<skill_dir>/.runtime/node/
```

Initialize it once with `scripts/init_video_runtime.py`. The scaffold script writes `.skill-runtime.json` into each generated video project, and `export-video.js` uses that file to resolve shared `playwright` and `ffmpeg-static` packages. Only run project-local `npm install` as a fallback when the shared runtime is intentionally unavailable.

## Workflow

1. Ingest the source.
   - `.md` / text: read directly.
   - `.docx`: use the `doc` skill or `python-docx`; include tables if present.
   - `.pdf`: use the `pdf` skill when layout matters.
   - `.pptx` / one slide / screenshot: use PPT-master handoff mode when the deck is meant to define the look; otherwise extract visible text and visual structure.
   - ppt-master project folder: import `svg_output/` or `svg_final/` slide pages as backplates and use notes as narration source when available.
   - If the source is a technical slide, explain its logic. Do not invent cinematic real-world scenes.

2. Convert content into a shot plan and timing plan.
   - Choose the number of scenes from the content. Use 4-6 scenes for simple one-page material, 6-10 scenes for normal technical docs, and more only when the logic genuinely needs it.
   - Estimate duration from narration and visual complexity. Use roughly 4-8 seconds for short concept scenes and 8-14 seconds for dense charts or comparisons.
   - For each scene define: title, on-screen text, graphic elements, animation beats, narration sentence(s), and target duration.
   - Keep each scene to one idea. Sequence as: structure -> highlight -> conclusion.
   - Keep text readable: no dense paragraphs, no more than 3-4 short text groups per scene.
   - In PPT-master handoff mode, preserve slide order unless the source logic clearly requires rearrangement. Plan overlays and camera moves instead of rebuilding the visual system.
   - Store the final timing in `timeline.js`; this is the single source of truth for browser playback and export.

3. Choose a background theme.
   - Select a theme based on the document domain and emotional tone, then write it to `timeline.js` as `background.theme`.
   - Use `blueprint` for electrical, infrastructure, power, architecture, engineering, and system topology.
   - Use `energy` for energy storage, renewables, carbon, grid, sustainability, or green operations.
   - Use `semiconductor` for chips, power electronics, devices, materials, manufacturing processes, or hardware architecture.
   - Use `whitepaper` for consulting, policy, education, business reports, or content that should feel clear and neutral.
   - Use `finance` for investment, market, cost, risk, business model, or operations analysis.
   - Use `risk` for safety, compliance, bottlenecks, failure modes, warnings, or constraint analysis.
   - If no theme is clearly indicated, use `blueprint`.
   - Keep backgrounds abstract and structural: grids, circuit traces, subtle bands, faint radial depth, blueprint lines, contour lines, or dashboard-like axes. Do not use photos or complex generated scenes.

4. Scaffold the HTML video project.
   - Use `scripts/scaffold_video_project.py` to copy `assets/html-video-template` into the output directory.
   - If the shared runtime is missing, run `scripts/init_video_runtime.py` once before final export.
   - For PPT-master handoff mode, run `scripts/import_pptmaster_assets.py <ppt_project> <video_project>` and use the copied SVGs as scene backplates.
   - Replace the template scenes with content-specific markup and graphics.
   - Keep the stage fixed at `1920x1080`; scale only the preview shell, not the internal stage.
   - Use SVG/CSS/DOM elements for diagrams, arrows, charts, module grids, and counters.
   - Update `timeline.js` with the actual scene start/end times, voiceover file path, selected `background.theme`, `source.mode`, and any scene `backplate` assets.

5. Implement animation.
   - Use CSS keyframes for fades, draw-lines, fills, module pops, and highlights.
   - Use JavaScript only for timing, scene switching, counters, generated grids, export mode, and preview controls.
   - Include a `?start=<seconds>` preview parameter so individual scenes can be screenshot-checked quickly.
   - Avoid decorative chaos: no flashy transitions, particle storms, glitch effects, hard strobes, or spinning vortexes.

6. Generate AI voiceover audio.
   - Write the narration as `voiceover/voiceover_script.md`, grouped by scene.
   - Use an available AI TTS provider/tool in the environment to synthesize the narration. Prefer per-scene audio clips when possible: `voiceover/scene-01.*`, `voiceover/scene-02.*`, etc.
   - If generating per-scene clips, measure each clip duration, add small breathing gaps where useful, and set each scene's `start` and `end` in `timeline.js` to match that clip's spoken content.
   - Concatenate per-scene clips into `voiceover/voiceover.*`, or generate one full-file narration only after scene timings are planned.
   - If no AI TTS provider or credential is available, stop before final export and tell the user exactly what is missing; do not silently deliver an unnarrated video when narration was requested.

7. Align narration and visuals.
   - The narration for a scene must begin when that scene appears, and the scene must stay on screen until its narration finishes.
   - Reveal graphic elements in the same order the narration mentions them.
   - Do not let audio discuss a previous/next scene while the wrong scene is visible.
   - After TTS generation, measure the audio duration and compare it with `timeline.js`. If the difference is more than about 0.5 seconds per scene or 1 second overall, adjust scene timings and animation delays before export.
   - Keep `timeline.js`, `voiceover/voiceover_script.md`, and the generated audio file together in the project folder.

8. Validate visually before export.
   - Use Playwright/browser screenshots at representative timestamps and inspect them.
   - Check for: text overflow, overlapping labels, misaligned arrows, clipped elements, unreadable contrast, blank frames, and final-scene collisions.
   - Check that the chosen background supports readability and matches the content domain.
   - In PPT-master handoff mode, compare preview screenshots against the source slide pages; the video should feel like the deck gained motion, not like a new unrelated design.
   - Spot-check audio-video alignment by previewing timestamps near scene changes.
   - Fix issues in source HTML/CSS/JS before exporting.

9. Export the video.
   - Use the template `export-video.js` or an equivalent Playwright recording script.
   - Use the shared runtime. Do not run `npm install` in every generated project unless the shared runtime is unavailable by design.
   - Export WebM from browser recording, then MP4 with `ffmpeg-static` or system `ffmpeg`.
   - If `timeline.js` points to an existing `voiceover/voiceover.*` file, merge that audio into the MP4.
   - Trim/limit the MP4 to the timeline duration and verify with ffmpeg: duration, resolution, aspect ratio, frame rate, and audio stream.

10. Deliver.
   - Give the user the final MP4 path first.
   - Also mention the editable project folder and key source files.
   - Mention whether the video includes AI voiceover, and point to the script and audio file.

## Project Layout

Use an output folder like:

```text
output/<topic>_infographic_video/
  .skill-runtime.json
  index.html
  timeline.js
  styles.css
  app.js
  export-video.js
  package.json
  assets/
    slides/
      slide-01.svg
      slide_manifest.json
  voiceover/
    voiceover_script.md
    voiceover.mp3
  dist/
    <topic>_infographic.mp4
    <topic>_infographic.webm
```

## Useful Commands

Initialize the shared runtime once:

```powershell
python C:\Users\31184\.codex\skills\dynamic-infographic-video\scripts\init_video_runtime.py
```

Scaffold:

```powershell
python C:\Users\31184\.codex\skills\dynamic-infographic-video\scripts\scaffold_video_project.py output\my_infographic_video --force
```

Import ppt-master SVG pages as video backplates:

```powershell
python C:\Users\31184\.codex\skills\dynamic-infographic-video\scripts\import_pptmaster_assets.py C:\path\to\ppt-master-project output\my_infographic_video
```

Export:

```powershell
cd output\my_infographic_video
npm run export
```

Check the final video:

```powershell
node -e '$c=require("./.skill-runtime.json");process.env.NODE_PATH=$c.nodeModules;require("module").Module._initPaths();console.log(require("ffmpeg-static"))'
```

Then run the printed ffmpeg executable with `-i <final.mp4> -hide_banner` and confirm `1920x1080`, `DAR 16:9`, the intended content-driven duration, and an audio stream when narration was requested.

## Quality Bar

- The final answer must point to an actual video file.
- Keep source files editable; never tell the user to edit `dist/*.mp4` directly.
- Prefer deterministic browser-rendered graphics over AI-generated scene imagery.
- When a ppt-master deck/project is the source, preserve its art direction and use slide pages as the visual master; add motion and emphasis without restyling the deck.
- Choose a content-matched abstract background theme for each project; do not reuse the same palette by habit.
- Never use real photos, photorealistic AI scenes, complex scene illustrations, or unrelated scenic footage as backgrounds.
- Use `timeline.js` as the single source of truth for scene timing; do not keep hidden hardcoded durations in both `app.js` and `export-video.js`.
- Narrated exports must include `voiceover/voiceover_script.md`, an AI-generated audio file, and an MP4 with an audio stream.
- Audio and visuals must be semantically aligned scene by scene.
- Reuse the shared runtime for exports after the first initialization; avoid repeated per-project dependency downloads.
- Re-export after every user-requested visual/content fix.
- If export fails, still provide the working HTML preview and explain exactly which dependency blocked video export.
