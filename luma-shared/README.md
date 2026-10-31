# Luma Greek chapters

- Exactly one achievement per chapter, awarded only after every scene is complete. No per-scene achievements, achievement sidebar, counters or intermediate reward dialogs.
- `engine.js` derives chapter completion from unique valid completed scene indices; legacy saved badges are replaced without resetting scenes, drafts, mode or audio preference.
- XP: 10 per unique completed scene, plus 20 once for completing the chapter. Legacy totals are recalculated using this rule.
- `chapters.js` lists published chapters in order. Each chapter keeps its own storage key and configuration.
- Scene data fields: name, place, legacy emoji, Greek line, Russian translation, task, accepted answers, example answer, optional Russian translation choices. Achievements belong to the chapter, never scene data.
- Add future chapters to the ordered list and reuse this engine. Keep listening, microphone language, save validation and final-navigation checks covered by the Greek regression tests.
