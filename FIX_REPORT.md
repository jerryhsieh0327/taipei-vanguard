# Interact respawn diagnosis and repair

Base: the user's downloaded `taipei_vanguard_3d_scene_animation_update.zip`, not the older 2.5D GitHub repository.

Base ZIP SHA-256: `7BC4C43E933D48B64FA9197619783358D7B069A1D5E82CC8AB8B15EC46D022AC`.

## Exact causes in the original game.js

| Original location | Behavior | Visible symptom |
| --- | --- | --- |
| Line 90, `prepareStage()`, disable branch | Always called `spawnWave(Tight ? 2 : 1)` | Entering an ordinary device objective spawned reinforcements after the previous combat was cleared. This could follow a waypoint interaction. |
| Line 90, escort branch | Always called `spawnWave(2)` | Interact on a rescue target immediately spawned two enemies as the escort stage began. |
| Line 100, `interact()`, unfinished multi-device branch | Set `enemies=[]`, then called `spawnWave(1)` | Disabling the first controller created another enemy even after the area was clear. It also erased any existing enemy records. |
| Line 90, stage initialization | Reset the enemy array and lacked a stage-entry guard | Re-entering stage setup could regenerate its encounter. |
| Line 116, defense branch | Cleared the enemy array every ten seconds and advanced the wave regardless of survivors | Living threats vanished and the mission could succeed without clearing the final wave. |

These are explicit calls in mission code. The primary problem was not a duplicate browser event handler, revived corpse model, or a rendering effect.

## Repair

Only `combat` and `defend` stages can generate enemies. Rescue/escort/device/checkpoint transitions preserve the cleared area and corpse list. Stage entry is guarded by `preparedStage`; completion requires the expected current stage and no active enemies. Each objective has an active/consumed state, and a 0.3-second simulation-time guard absorbs double taps at colocated successive objectives. Interaction is disabled while paused or after results.

Defense remains intentional in missions 8 and 12. The HUD shows `WAVE n / 3` and terminal health. Each wave is 3, 4, then 5 enemies. The next wave requires both clearance and the ten-second minimum interval. Terminal damage, player failure and timeout remain enabled. Mission 12's heavy unit still appears once, as its explicitly briefed combat stage after both controllers.

## Validation

- The original source fails all three targeted regression checks for rescue-to-escort reinforcement, multi-device reinforcement and repeated stage setup. The original returned 2, 2 and a changed spawn cycle where the checks expect no new spawn.
- The repaired source passes 21 automated checks: all twelve mission completions; rescue/escort; multiple devices; one-shot setup and stale completion; far, paused, consumed, repeated and post-result interactions; corpse retention and intentional restart; both three-wave defenses; reachable site-specific objective cells; terminal failure and timeout.
- A real Chromium 157 WebGL session rendered all eight maps with zero GL errors and completed all twelve mission paths. Expected stopped-unit totals are 4, 6, 5, 6, 4, 6, 5, 20, 5, 7, 4 and 19. No hidden interaction-stage enemies are included in these totals.
- Keyboard F, mouse Interact and emulated landscape touch Interact were exercised. No browser console or page errors were recorded.
- All four actor types at four fall positions (16 cases) had finite geometry and their lowest vertex at ground height 0.015.
- JavaScript syntax checks pass for `game.js`, `renderer3d.js` and `landmarks.js`.

The automated campaign uses controlled positioning and extra armor to isolate state changes, while using the real shooting/HP/death/escort/simulation code. It does not certify combat difficulty, iPad hardware rendering or touch ergonomics. Physical iPad Safari testing remains outstanding.

Run the logic suite from this folder: `node --test tests/mission-flow.test.cjs`.

The optional browser suite is `node tests/browser-smoke.cjs` with Playwright and a Chromium/Chrome/Edge executable available. `CHROME_PATH` can select an executable and `QA_OUTPUT` can select the screenshot/report directory. Test hooks exist only in the local test server's responses; the playable scripts expose no test access.

## Delivery

The full ZIP includes the updated source, original assets, tests and validation results. Scene reference notes distinguish recognizable architectural features from compressed game layouts. No remote repository changes or website deployment were performed.
