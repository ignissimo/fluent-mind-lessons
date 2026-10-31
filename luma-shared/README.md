# Luma Greek chapters

- Exactly one achievement per chapter, awarded only after every scene is complete. No per-scene achievements, achievement sidebar, counters or intermediate reward dialogs.
- `engine.js` derives chapter completion from unique valid completed scene indices; legacy saved badges are replaced without resetting scenes, drafts, mode or audio preference.
- XP: 10 per unique completed scene, plus 20 once for completing the chapter. Legacy totals are recalculated using this rule.
- `chapters.js` lists published chapters in order. Each chapter keeps its own storage key and configuration.
- Scene data fields: name, place, legacy emoji, Greek line, Russian translation, task, accepted answers, example answer, optional Russian translation choices. Achievements belong to the chapter, never scene data.
- Add future chapters to the ordered list and reuse this engine. Keep listening, microphone language, save validation and final-navigation checks covered by the Greek regression tests.

## Feedback modes

- Exactly two modes across the Greek project: `soft` and `exam`. Every answer is validated in both; there is no unchecked conversation mode.
- Soft: hints appear only when requested via the hint button; NPC transcript/translation can be revealed separately. An incorrect reply never automatically prints the example answer.
- Exam: no hint button, transcript/translation reveal or example answers in feedback. Wrong replies receive a neutral retry message, without limits, and do not complete the scene. Listening/replaying audio and task options remain available.
- Switching modes clears and closes all previously revealed assistance and cancels active audio/microphone work. Legacy `free` saves migrate to `soft` without resetting scene progress or drafts.
- When changing the shared engine, update its versioned URL in both chapter HTML files so cached code cannot restore retired behavior.

- A1 playback has one normal, already slow speech tempo. Do not add a slower-playback button or alternate playback-rate mode to current or future chapters.
