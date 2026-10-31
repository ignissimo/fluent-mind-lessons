# Luma Greek 1.1 — 2026-10-31

Source: Downloads/luma_greek_chapter_1_1.html (original unchanged).
Public path: /fluent-mind-lessons/luma-greek-1-1/.

Preserved ten A1 encounters, Russian instructions, Greek phrases, three feedback modes and luma11 storage key. Added four generated illustrations and ten local Greek audio clips; listening-first hidden transcript, slow playback, reveal text and translation. Every encounter supports spoken or typed response. Microphone starts only on demand; Greek transcription is automatically checked and can be manually corrected. Browser service may process speech; audio recordings are not stored by the app. This checks recognized phrase content, not pronunciation quality. Free mode explicitly accepts Greek replies without checking correctness.

Fixed substring false positives, incomplete name answers, unchecked advancement/final completion, unsafe stored state, blocked storage crashes, repeated recording launches, stale speech callbacks, missing no-result/error recovery. Navigation preserves drafts, completed rewards are idempotent. Added keyboard focus, labelled input and modal Escape/focus handling. No other lesson or quest modified.

Validation: eight targeted jsdom tests; full ten-scene browser walkthrough reached 260 XP/eight badges; incorrect answer rejected; reload restored all ten scenes; local audio readyState=4, playing and advancing currentTime, no media error. Checked widths 2560,1920,1440,1280,1024,768,390: images loaded, no horizontal page overflow. IAB console had no warnings/errors.

Limit: actual SpeechRecognition launch in IAB returned a network error from its external service. Successful live human speech recognition was not validated. Deterministic tests exercise recognition callbacks, Greek language selection, successful automatic checking, permission denial, no-result completion, repeat-click guard, stale result rejection and cancelled audio fallback suppression. Browser/device support, microphone permission and speech-service connectivity are necessary. No promise of acoustic pronunciation scoring.

Pronunciation correction after author feedback: initial Γεια σου changed to documented native-speaker recording (Sarri.greek, CC BY-SA 4.0). Browser fallback now refuses a non-Greek voice; a regression test covers this. This is source validation and technical verification, not a completed human phonetic review of all ten clips. Nine clips still use Melina.
