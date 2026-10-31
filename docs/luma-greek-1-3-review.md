# Luma Greek 1.3

Source: Downloads/luma_greek_chapter_1_3.html. 26 scenes, one chapter achievement, 280 XP, independent `luma13` save. Uses shared voice-only progression, Soft/Examiner modes, no writing/Submit/Next/slower controls, and read-only Russian comprehension options. Adds Eleni, Sofia and an ensemble illustration while reusing established characters.

## Language review

Reviewed all source Greek lines independently; no grammatical errors found in the NPC text. Corrected Russian omissions: first scene includes the greeting; "Who is Maria?" becomes "Which one is Maria?" in Russian. Clarified polite singular versus plural address in instructions. Full accepted replies include optional subject pronouns, yes/no variants, and the complete suggested answers. Introduction validation rejects wellbeing words or misplaced articles used as a name. The final task requires an actual own-name introduction and positive wellbeing; it rejects bare fragments and negative wellbeing.

Primary references:
- Centre for Greek Language, verb paradigm: https://www.greek-language.gr/digitalResources/files/document/lex_first_grade/parartimataD-ST.pdf
- Centre for Greek Language, optional subject pronouns: https://www.greek-language.gr/digitalResources/modern_greek/tools/lexica/glossology_edu/iframe.html?heading=2&id=137
- CUNY Modern Greek introductory textbook, personal introductions and name cases: https://pressbooks.cuny.edu/moderngreek1/chapter/chapter-1/

`Einai` is shared by third-person singular/plural, so the source demonstrative sentences are retained. `Eimai o Kostas` and `Me lene Kosta` use different valid cases; these must not be mechanically made identical.

## Pronunciation status

The author reports repeated errors in existing Melina speech. A replacement Greek neural voice is being prepared and sampled separately. Microsoft documents the Greek locale/voice: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts . Greek language designation alone does not establish correct pronunciation; The author approved the audible Nestoras sample on 2026-10-31. This is approval of the voice sample, not a full independent phonetic audit of all clips. Actual IAB speech recognition previously returned service network errors.

Technical validation: 102/102 library tests pass, including seven chapter-three checks. All 26 candidate MP3 files have valid positive duration and exact source text in the manifest. Browser QA used an explicitly local fixture simulating SpeechRecognition callbacks: all 26 scenes reached one 280-XP chapter completion, reload retained progress, and the real chapter-two continuation link opened chapter three. Eleni, Sofia and ensemble scenes checked at 2560,1920,1440,1280,1024,768,390 px: all artwork loaded, no horizontal overflow. Candidate audio loads locally. QA fixture removed after testing; real app microphone is not mocked.

Status: author approved the Nestoras sample. All 55 scene recordings now use versioned audio-nestoras-v1 URLs; original recordings retained for provenance. Ready for publication after final technical validation.
