# Brawl Lab 2: The Secret Upgrade

Public URL: https://ignissimo.github.io/fluent-mind-lessons/brawl-lab-2/

Adapted from `Downloads/brawl_lab_2.html`. Separate lesson; Brawl Lab 1 is unchanged. Six teacher-led speaking/design missions, planned total 45 minutes. This timing has not been measured in a live lesson. All balance scenarios, costs and stats are fictional, not official game data. This lesson has no original audio feature and adds none.

Original illustrations: ImageGen atlas `assets/missions.jpg`, 3 columns × 2 rows, reading order matches the six missions. Friendly original turquoise laboratory robot, not an official Brawler. Optimized JPEG; full PNG retained under the original generated-images location. Character emoji and student-created SVG robot remain separate from the illustrations.

Fixes:
- Sequential mission unlocking checks every preceding approval. Changed decisions invalidate affected approvals.
- Balance mission requires a selected change; playtest requires all three choices. Oral reasoning remains teacher assessed, not automatically scored.
- Fictional Teleport cost raised from 5 to 7 so the 10-point energy limit is meaningful; over-budget builds cannot be approved.
- Arena requires at least two spawns and one gem, with a non-wall path from every spawn to every gem. This checks reachability, not full competitive balance; dangerous tiles remain traversable.
- Drawing survives workshop option changes and navigation; pointer cancel/lost capture stops drawing, image-load guards prevent stale restores. PNG uses Blob download.
- Automatic local progress/draft/map/drawing persistence, validated load and visible unavailable-storage notice. Save key `fma-brawl-lab-2-v1`, independent of all other lessons.
- Keyboard-accessible choices and named arena cells; clearer report includes actual choices instead of numeric indexes.

Validation: seven regression/flow tests in `tests/brawl-lab-2.test.cjs`; all 114 library tests passed. Real browser completion of all six missions, over-budget rejection, arena painting, drawing, PNG/TXT downloads and reload checked. Six stages × seven widths (2560,1920,1440,1280,1024,768,390) have no horizontal page overflow; tablet visually checked. Browser console clear. Native print dialog not exercised.
