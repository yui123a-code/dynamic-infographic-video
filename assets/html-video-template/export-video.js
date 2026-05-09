const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const Module = require("module");

const bundledNodeModules = path.join(
  process.env.USERPROFILE || "",
  ".cache",
  "codex-runtimes",
  "codex-primary-runtime",
  "dependencies",
  "node",
  "node_modules",
);

if (fs.existsSync(bundledNodeModules)) {
  process.env.NODE_PATH = [process.env.NODE_PATH, bundledNodeModules].filter(Boolean).join(path.delimiter);
  Module._initPaths();
}

const { chromium } = require("playwright");
const timeline = require("./timeline.js");

const ROOT = __dirname;
const DIST_DIR = path.join(ROOT, "dist");
const RAW_DIR = path.join(DIST_DIR, "raw-recording");
const FINAL_WEBM = path.join(DIST_DIR, "infographic_video.webm");
const FINAL_MP4 = path.join(DIST_DIR, "infographic_video.mp4");
const HTML_URL = `file:///${path.join(ROOT, "index.html").replace(/\\/g, "/")}?export=1`;

function maxSceneEnd() {
  const scenes = Array.isArray(timeline.scenes) ? timeline.scenes : [];
  return Math.max(...scenes.map((scene) => Number(scene.end) || 0), 0);
}

function resolveDurationSeconds() {
  return Number(process.env.VIDEO_DURATION_SECONDS) || Number(timeline.durationSeconds) || maxSceneEnd() || 30;
}

function resolveVoiceoverPath() {
  const configuredPath = process.env.VOICEOVER_PATH || timeline.voiceover?.path;
  if (!configuredPath) return null;
  return path.isAbsolute(configuredPath) ? configuredPath : path.join(ROOT, configuredPath);
}

const DURATION_SECONDS = resolveDurationSeconds();
const VOICEOVER_PATH = resolveVoiceoverPath();

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function findFfmpeg() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) return process.env.FFMPEG_PATH;
  try {
    const ffmpegStatic = require("ffmpeg-static");
    if (ffmpegStatic && fs.existsSync(ffmpegStatic)) return ffmpegStatic;
  } catch (_error) {}
  const whereResult = spawnSync("where.exe", ["ffmpeg"], { encoding: "utf8" });
  if (whereResult.status === 0) {
    const firstPath = whereResult.stdout.split(/\r?\n/).find(Boolean);
    if (firstPath && fs.existsSync(firstPath)) return firstPath;
  }
  return null;
}

function getMediaDuration(ffmpegPath, filePath) {
  const result = spawnSync(ffmpegPath, ["-i", filePath, "-hide_banner"], { encoding: "utf8" });
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  const match = output.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (!match) return null;
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function convertToMp4(ffmpegPath) {
  const hasVoiceover = VOICEOVER_PATH && fs.existsSync(VOICEOVER_PATH);
  if (VOICEOVER_PATH && !hasVoiceover) {
    console.log(`Voiceover not found, exporting silent MP4: ${VOICEOVER_PATH}`);
  }

  if (hasVoiceover) {
    const voiceoverDuration = getMediaDuration(ffmpegPath, VOICEOVER_PATH);
    if (voiceoverDuration !== null && Math.abs(voiceoverDuration - DURATION_SECONDS) > 1) {
      console.log(
        `Warning: voiceover duration (${voiceoverDuration.toFixed(2)}s) differs from timeline duration (${DURATION_SECONDS.toFixed(2)}s). Adjust timeline.js before final delivery if this is not intentional.`,
      );
    }
  }

  const args = [
    "-y",
    "-i", FINAL_WEBM,
  ];

  if (hasVoiceover) {
    args.push("-i", VOICEOVER_PATH);
  }

  args.push(
    "-t", String(DURATION_SECONDS),
    "-map", "0:v:0",
  );

  if (hasVoiceover) {
    args.push("-map", "1:a:0");
  }

  args.push(
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
  );

  if (hasVoiceover) {
    args.push("-c:a", "aac", "-b:a", "192k");
  } else {
    args.push("-an");
  }

  args.push("-movflags", "+faststart", FINAL_MP4);

  const result = spawnSync(ffmpegPath, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`ffmpeg conversion failed with exit code ${result.status}`);
}

async function main() {
  fs.mkdirSync(DIST_DIR, { recursive: true });
  cleanDir(RAW_DIR);
  fs.rmSync(FINAL_WEBM, { force: true });
  fs.rmSync(FINAL_MP4, { force: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: { dir: RAW_DIR, size: { width: 1920, height: 1080 } },
  });
  const page = await context.newPage();
  await page.goto(HTML_URL, { waitUntil: "networkidle" });
  await page.waitForFunction("window.__videoReady === true", null, { timeout: 15000 });
  await page.waitForTimeout((DURATION_SECONDS + 1.2) * 1000);

  const video = page.video();
  await context.close();
  await browser.close();

  fs.renameSync(await video.path(), FINAL_WEBM);
  fs.rmSync(RAW_DIR, { recursive: true, force: true });
  console.log(`WebM exported: ${FINAL_WEBM}`);

  const ffmpegPath = findFfmpeg();
  if (!ffmpegPath) {
    console.log("MP4 skipped: ffmpeg was not found. The WebM video is ready.");
    return;
  }
  convertToMp4(ffmpegPath);
  console.log(`MP4 exported: ${FINAL_MP4}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
