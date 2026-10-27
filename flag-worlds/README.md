# Flag Worlds: The Glitch

Published lesson: https://ignissimo.github.io/fluent-mind-lessons/flag-worlds/

Adapted from Flag_Worlds_Adventure.html. Original game route and questions retained. Four original voxel illustrations generated with ImageGen (museum, coastal workshop, historical harbour, Japanese island); atlas quadrants in reading order. Art is imaginative, not documentary. All country flags remain code-drawn SVG, separate from generated art. 36 local English voice clips generated with macOS Daniel; browser voice fallback.

Fixes: duplicate-item protection, draft drawing autosave, actual gallery image, safe saved-state normalization, image-load race guard, Blob PNG download, visible alternate object navigation, modal keyboard handling, completed museum message, and working sunglasses avatar. Japan's sun key explicitly belongs to the game portal, not the national flag.

Country facts cross-checked against:
- https://www.gov.il/BlobFolder/generalpage/facts-about-israel-2018/en/English_ABOUT_ISRAEL_PDF_Democracy.pdf
- https://www.cbs.gov.il/he/publications/DocLib/isr_in_n/isr_in_n11e.pdf
- https://www.cao.go.jp/en/flag_anthem.html
- https://www.prlib.ru/gosudarstvennaya-simvolika-flag-rossiyskoy-federacii

Progress key: `flag_glitch_v3`. Stored on this browser/device; private browsing or clearing site data removes it. Optional speech and free discussion activities have no right/wrong scoring. No timer.

Validation: `npm test`, including six focused tests in `tests/flag-worlds.test.cjs`; browser checks for exploration, wrong/correct answers, stories, audio playback, drawing/gallery and download.
