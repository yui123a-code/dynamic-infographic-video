(function (root, factory) {
  const timeline = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = timeline;
  } else {
    root.VIDEO_TIMELINE = timeline;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  return {
    title: "Dynamic Infographic Video",
    background: {
      theme: "blueprint",
    },
    voiceover: {
      path: "voiceover/voiceover.mp3",
      scriptPath: "voiceover/voiceover_script.md",
    },
    scenes: [
      {
        id: 1,
        start: 0,
        end: 7,
        narration: "Introduce the core problem and the logic map.",
      },
      {
        id: 2,
        start: 7,
        end: 15,
        narration: "Compare the before and after structure.",
      },
      {
        id: 3,
        start: 15,
        end: 23,
        narration: "Explain the main chart or causal relationship.",
      },
      {
        id: 4,
        start: 23,
        end: 30,
        narration: "Close with the final thesis.",
      },
    ],
  };
});
