(function () {
  const fallbackTimeline = {
    scenes: [
      { id: 1, start: 0, end: 7 },
      { id: 2, start: 7, end: 15 },
      { id: 3, start: 15, end: 23 },
      { id: 4, start: 23, end: 30 },
    ],
  };

  const timeline = window.VIDEO_TIMELINE || fallbackTimeline;
  const sceneDefs = Array.isArray(timeline.scenes) && timeline.scenes.length ? timeline.scenes : fallbackTimeline.scenes;
  const totalDuration = Number(timeline.durationSeconds) || Math.max(...sceneDefs.map((scene) => Number(scene.end) || 0));
  const backgroundTheme = timeline.background?.theme || "blueprint";
  const params = new URLSearchParams(window.location.search);
  const exportMode = params.has("export");
  const initialTime = Math.max(0, Math.min(totalDuration, Number(params.get("start") || 0)));
  const stageShell = document.getElementById("stageShell");
  const pauseBtn = document.getElementById("pauseBtn");
  const restartBtn = document.getElementById("restartBtn");
  const timeReadout = document.getElementById("timeReadout");
  const timelineFill = document.getElementById("timelineFill");
  const scenes = sceneDefs.map((scene) => ({ ...scene, element: document.querySelector(`.scene-${scene.id}`) }));

  let startTime = 0;
  let pausedElapsed = 0;
  let pauseStarted = 0;
  let isPaused = false;
  let lastActiveScene = 0;

  document.body.dataset.theme = backgroundTheme;
  document.body.classList.toggle("export-mode", exportMode);

  function buildGrids() {
    document.querySelectorAll(".module-grid").forEach((grid) => {
      const count = Number(grid.dataset.count || 8);
      for (let index = 0; index < count; index += 1) {
        const cell = document.createElement("span");
        cell.className = "grid-cell";
        cell.style.setProperty("--i", index);
        grid.appendChild(cell);
      }
    });
  }

  function fitStage() {
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stageShell.style.transform = `scale(${scale})`;
  }

  function elapsed() {
    const now = isPaused ? pauseStarted : performance.now();
    return Math.min((now - startTime - pausedElapsed) / 1000, totalDuration);
  }

  function formatTime(seconds) {
    const rounded = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(rounded / 60)).padStart(2, "0")}:${String(rounded % 60).padStart(2, "0")}`;
  }

  function updateScene(time) {
    const active = scenes.find((scene) => scene.element && time >= scene.start && time < scene.end) || scenes.find((scene) => scene.element);
    if (!active || active.id === lastActiveScene) return;
    scenes.forEach((scene) => {
      if (scene.element) scene.element.classList.toggle("active", scene.id === active.id);
    });
    lastActiveScene = active.id;
  }

  function tick() {
    const time = elapsed();
    updateScene(time);
    timelineFill.style.width = `${(time / totalDuration) * 100}%`;
    timeReadout.textContent = `${formatTime(time)} / ${formatTime(totalDuration)}`;
    if (time < totalDuration || !exportMode) requestAnimationFrame(tick);
  }

  function restart() {
    startTime = performance.now() - initialTime * 1000;
    pausedElapsed = 0;
    pauseStarted = 0;
    isPaused = false;
    lastActiveScene = 0;
    document.body.classList.remove("paused");
    pauseBtn.textContent = "Pause";
    scenes.forEach((scene) => {
      if (scene.element) scene.element.classList.remove("active");
    });
    requestAnimationFrame(tick);
  }

  function togglePause() {
    if (isPaused) {
      pausedElapsed += performance.now() - pauseStarted;
      isPaused = false;
      document.body.classList.remove("paused");
      pauseBtn.textContent = "Pause";
      requestAnimationFrame(tick);
    } else {
      pauseStarted = performance.now();
      isPaused = true;
      document.body.classList.add("paused");
      pauseBtn.textContent = "Resume";
    }
  }

  pauseBtn.addEventListener("click", togglePause);
  restartBtn.addEventListener("click", restart);
  window.addEventListener("resize", fitStage);

  buildGrids();
  fitStage();
  const ready = () => {
    window.__videoReady = true;
    restart();
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready).catch(ready);
  else ready();
})();
