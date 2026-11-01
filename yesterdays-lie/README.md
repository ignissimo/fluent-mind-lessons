# Yesterday's Lie Quest

Public lesson: https://ignissimo.github.io/fluent-mind-lessons/yesterdays-lie/

Adapted from `Downloads/Yesterday_Lie_Quest.html`. Six missions: episode recall, vocabulary (Match OR Memory), six true/false statements, character choice, imagined letter, and ethical discussion. Five real stills from The Owl House S2E10; provenance and copyright in assets/SOURCES.md and source link in the lesson footer. No generated images or added audio. Picture proportions preserved; no character crops.

Corrections and safeguards:
- Later tasks require vocabulary completion, six correct factual answers and at least five sentence segments in the current draft. The sentence counter is a simple punctuation heuristic, not language/meaning assessment; teacher reviews the requested 5–6 connected sentences and oral answers.
- Final completion appears only after a final opinion is selected and previous tasks are complete. Every final opinion is valid for discussion.
- Duplicate matching callbacks cannot increase the count. Memory cancellation guards prevent an old mismatch timeout from clearing a new turn after changing mode/page; returning to a task is safe.
- Same legacy save key `yesterday-quest`, preserving the original selected author and text; now saves real stage, vocabulary progress, deck, answers, final choice and separate drafts for Luz/Vee/Camila. Invalid values normalized; unavailable storage shows a notice and leaves editing/download available. Copy has success/failure feedback; downloads use a Blob URL with deferred revocation and author-specific filename.
- Two factual statements clarify their point in episode time; final promise is paraphrased accurately. Writing prompts are imagined letters, not quotations from the show.

Validation: seven focused tests; all121 repository tests pass. Browser: eight vocabulary matches, Memory opening/mode switch, all six factual answers, Vee letter, reload persistence, copying and actual TXT download, final choice/completion. Complete Memory route and stale-timer case checked automatically. Six mission types × seven viewport widths (2560–390px), no horizontal overflow or unloaded images; Memory visually checked on a 768×1024 tablet. Browser console clear. Successful grammar grading or automated spoken-response evaluation is not claimed.
