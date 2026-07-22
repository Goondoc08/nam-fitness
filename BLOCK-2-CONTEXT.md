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
- **Block 2 is LIVE on `main`** as of Jul 22 2026 (merged from branch `block-2`, then a same-day follow-up commit for the Block 1 review adjustments below). Current build: **v19 / update modal v2.1**.
- Built: `BLOCK_START`→Jul 23; cycle-variant engine (accessory + Day 2 deck alternation by `weekNum%2`); **run-owed 🏃 badge** (auto-detects a Garmin run or logged VO₂ session, neutral Days 1–3, escalates Days 4–5, resets Cycle Day 1) + evening-note nag on Day 4+; foam-roll + plank 60s; VO₂ copy.
- **Block 1 review adjustments (same day, build v19):** floor press moved from auto +5-lb progression to rep-based progression (weight field stays free-typed — raise it manually any time; new reps/set field + progression chain); Lift B reframed as a Day 4–5 window with Day 5 the expected default (not "missing the key day"); Day 2's lowest BB tier floor lowered 20/15 min → 10 min (was the most-skipped Block 1 session); swim goal (SWOLF 45–47) marked met/maintenance (best was 44); bedtime target 22:45–23:00 added to the coach's medical context (Block 1 sleep got shorter in the final third despite better efficiency).
- Verified: JS parses cleanly, rollover date math checked, hold-vs-progress branching logic simulated in isolation. **Full on-device check still pending** — confirm build tag reads v19 and the floor press logger shows a reps field next time Lift B is opened.

## Current numbers (Cycle 10, Jul 5)
VO₂ 36.5, Productive, ACWR 0.9. Squat 130 / Bench 105 / Row 105 / DL 165 / Floor press ~60 / Pulldown 110, zero stalls. Sleep ~6h43m, down ~60 lb.
