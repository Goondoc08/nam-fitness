# NAM Fitness — Block 2 Context (as of Jul 12, 2026)

*Portable project-context summary. Full plan in BLOCK-2-PLAN.md.*

## Long-term end state (governs all future blocks)
- **Cardio is the permanent priority** (firefighter cardiac risk). VO₂ max **42+ held for good** (~45 = comfortable margin). The only metric that keeps progressing block to block.
- **Strength has a finish line, not infinite progression:** ~DL 1.5×BW / squat 1.25×BW / bench 185–200 (≈315/265/195 at eventual ~210–215 lb). Once reached → maintenance volume, test once a block, rebuild only if a test degrades.
- **Tiebreaker:** when recovery is scarce, cardio quality wins the budget.
- ~3 more "climb" blocks to the standards, then permanent maintenance mode.

## Block 2 = bridge block (~Jul 23 → Oct 2, 12 cycles), "slow approach"
- **VO₂ target 37.5–38.5** (hold the slope, don't force it). No numeric lift targets; holding a weight is a logged success, not a failure; stall rule = 2 misses → drop 10%.
- **Key physiology finding:** HR no longer spikes during lifts (heart adapted to the barbell), so Garmin's hard-aerobic load falls passively. Runs/rows are now the only hard-aerobic source → the floating run exists to fix this.

### Training structure
- **Day 1 Lift A** (station, on-shift), **Day 2 Recovery Cardio** (station), **Day 3 Recovery Swim** (untouched — the favorite session, cortisol flush), **Day 4 Lift B** (city gym, key day), **Day 5 Swim Build** (every cycle), **Day 6 Mobility**.
- **Main 5×5 never changes.** Accessories **alternate every cycle** — Deck A (odd), Deck B (even):
  - *Lift A:* A = farmer carry / cable row / pushdown / hammer curl / plank 60s. B = chest-supported row / **banded lateral walk (glute-med, knee)** / skull crusher / incline curl / Pallof.
  - *Lift B:* A = KB RDL / face pull / **machine external rotation (cuff)** / dead bug. B = single-leg RDL / reverse fly / **cable pull-through** / cable woodchop.
- **Day 2 alternates machine deck** (station = treadmill + rower only): odd = treadmill, even = rower. BB tiers preserved.
- **Floating run:** 1 GPS run/cycle, any day, easy Z2 + optional pickups. No dedicated tile.
- **Knee/IT-band = glute-med problem:** foam-roll TFL/outer-quad (Lift A warm-up + Day 6) + banded walks / single-leg work. Not "stretch the band."
- **Deload Cycle 7**, flexed to land on the nicotine Phase 3 step-down week (15→5 lozenges).
- **No overhead pressing ever** (floor press permanent); no push-up accessories (warm-up push-up is the only one); no dips (shoulder). Controlled shoulder machine work kept pain-free, PT-check the specific picks.

### End-of-Block-2 review (the real deliverable)
Set Block 3's pace by answering: VO₂ slope vs. 42 target? Lifts still moving on +5? Recovery held? Sleep-study status (resolving changes the whole recovery budget)?

## App / system changes (built, staged, not live)
- App: single-file PWA (`index.html`) at Goondoc08/nam-fitness, GitHub Pages, viewed on Android. Only reaches the phone via `git push` to `main`.
- **Block 2 build is committed on branch `block-2` (pushed to GitHub), NOT merged to `main`** — live app stays Block 1 until rollover.
- Built: `BLOCK_START`→Jul 23; cycle-variant engine (accessory + Day 2 deck alternation by `weekNum%2`); **run-owed 🏃 badge** (auto-detects a Garmin run or logged VO₂ session, neutral Days 1–3, escalates Days 4–5, resets Cycle Day 1) + evening-note nag on Day 4+; foam-roll + plank 60s; VO₂ copy; sw.js v18 / update modal v2.0.
- Verified: JS parses, rollover date math (Jul 23 = Cycle 1/Day 1/Deck A). **Not yet on-device tested** — happens at rollover.

## Rollover plan (night of Jul 22)
Finish Mobility → **Export Data first** (Block 1's permanent record; adherence recomputes off BLOCK_START) → `git checkout main && git merge block-2 && git push` → reload phone, confirm build v18 + 🏃 pill. ~15 min.

## Current numbers (Cycle 10, Jul 5)
VO₂ 36.5, Productive, ACWR 0.9. Squat 130 / Bench 105 / Row 105 / DL 165 / Floor press ~60 / Pulldown 110, zero stalls. Sleep ~6h43m, down ~60 lb.
