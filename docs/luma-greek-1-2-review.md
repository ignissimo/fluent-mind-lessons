# Luma Greek 1.2 — 2026-10-31

Public path: `/fluent-mind-lessons/luma-greek-1-2/`.
Source: `Downloads/luma_greek_chapter_1_2.html`, retained unchanged.

Preserved all 19 scenes and three feedback modes. Existing illustrations maintain character identity; new Marina and Markos portraits are stored with provenance in `luma-greek-1-2/assets/ARTWORK.md`. All 19 NPC lines have local AAC audio, slower playback and revealable Greek text/Russian translation. Auto sound begins only after an explicit first playback and can be turned off; preference is saved.

Greek conversational answers use el-GR speech recognition. The three Russian meaning quizzes explicitly use ru-RU and retain clickable options and editable transcription. Comprehension questions are checked even in free conversation mode. Recognition checks the recognized text, not acoustic pronunciation quality. App does not record or retain audio; browser's recognition service may process speech remotely.

Fixed skipping, substring matches, names without a name, and incomplete final answers with only Εσύ. The compound greeting requires both greeting and response. Invalid or unavailable storage cannot block play. Unique rewards derive from completed scenes: 19 scenes + eight achievements = 350 XP.

Chapter 1.1 links to 1.2 in its final dialog and below the activity; both chapters have series navigation. `luma-shared/chapters.js` defines the ordered published chapters; future chapters can be added to that list. No link to an unpublished chapter. Shared engine preserves original `luma11` and independent `luma12` saves. First-chapter learning data and 260-XP completion remain unchanged. Reset only clears the active chapter.

Validation: full 19-scene browser run reached 350 XP/eight achievements; wrong conversational and comprehension answers rejected; reload preserved completion and drafts. Real first-chapter final-dialog link opened chapter two, which retained all 19 completed scenes. Three representative scenes (Marina, Markos, Russian comprehension) tested at 2560,1920,1440,1280,1024,768,390 px: all images loaded and no page overflow. Tablet layout inspected visually. Local audio readyState 4, playing with advancing currentTime and no media error. Shared microphone lifecycle tested with deterministic callbacks (Russian/Greek selection, errors, duplicate start, stale result rejection).

Pronunciation limit: Γεια σου uses the documented native-speaker source; remaining speech is synthetic Melina. No claim of a full native-speaker phonetic audit or successful live human speech recognition. Existing IAB speech service returned a network error in earlier testing. Browser microphone permissions, service access and device support remain required.
