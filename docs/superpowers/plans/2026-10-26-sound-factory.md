# Sound Factory implementation plan

Goal: Publish standalone Crack the Code Part 8 for today's teacher-led reading lesson, retaining a reusable visual/data structure for Parts 1–7.
Architecture: Buildless HTML/CSS/JS, content separated from renderer, local main/homework records, click/keyboard tile construction, opt-in audio. GitHub Pages in existing fluent-mind-lessons repository, isolated new folder; preserve existing dirty files.
Approved design: calm dark laboratory, seven modules (six repairs plus results), accessible English instructions, no timing or error penalties, distinct mechanics, honest assisted completion and notebook self-reports. Suno external/manual mode until local MP3 and exact lyrics are provided.

- [x] Write and run failing tests in tests/sound-factory.test.cjs for validation, all-task completion, independent homework, reload, awards, storage errors, audio absence and teacher navigation.
- [x] Implement sound-factory/data.js (content), engine.js (state and validation), app.js (DOM and controls), audio.js (local clips and speech fallback), index.html and style.css. Add original SVG diagrams for song scenes and word cues.
- [x] Generate local English word/sentence/instruction recordings with macOS speech; never synthesise IPA as phonemes. Provide optional phoneme recording inputs and configurable local MP3/lyrics.
- [x] Run focused tests, syntax checks and full existing test suite. Browser-check actual student interactions, save/restore, wrong answers, song/manual mode and responsive layout.
- [x] Add teacher.html with timing, support strategies, answer access and audio replacement instructions. Commit only this game's files, tests and plan; push main under the standing publication rule. Wait for Pages and interaction checks; verify live content/assets and open live game.

Validation commands: node --test tests/sound-factory.test.cjs; npm test; node --check sound-factory/{data,engine,audio,app}.js (one invocation per file). Browser QA via CUA local HTTP preview and final live URL.
