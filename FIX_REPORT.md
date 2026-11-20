# Tactical R2 repair report

## Live-site diagnosis

The GitHub Pages game and entry page were read directly during this repair. The page was loading the prior mission-fix build. Its prepareStage function still created defense enemies when device interaction advanced mission 8 to defense, and still spawned the late heavy unit and defense stage in mission 12. This was the preserved design in the earlier delivery, not evidence that the user had failed to upload the previous update.

## Default campaign invariant

All campaign enemies are created by start() before objectives begin. spawnLocked is then set, and both spawnEnemy() and spawnWave() reject subsequent creation. prepareStage() creates no enemies in any branch. The mission-12 armored leader is included in its seven-person opening roster. Missions 8 and 12 now have terminal/checkpoint objectives after the opening encounter.

The expected campaign roster totals are 4, 6, 5, 6, 4, 6, 5, 8, 5, 7, 4, 7. Automated checks complete every objective and assert one creation event per campaign mission and final kills equal the original roster. Restarting a mission or explicitly deploying a new mission intentionally creates a new round.

Three-wave defense is retained behind a separate, explicitly labeled briefing button for missions 8 and 12. That mode has no Interact-driven spawning, and is the only mode allowed to generate later waves. Its three waves contain 3, 4 and 5 enemies; cleared waves advance after the minimum ten-second interval. Success in the drill does not unlock campaign missions.

## Character and movement replacement

The box-built hostile renderer is removed from the playable path. Three.js r170, GLTFLoader, independent skeleton clones, physically based textured materials, character lighting and shadows are local to the package. Each character uses the Soldier mesh and 49-bone rig, Idle/Walk/Run clips, short animation fades, a weapon aiming pose and shot muzzle visibility. Mixamo's source model faces -Z; a model-local rotation aligns it with the game's movement heading. Skinning is initialized before measuring height, and rendered character height is checked in the browser to prevent an incorrectly scaled or invisible model.

Enemy logic is in enemy-ai.js. It supports line-of-sight detection, shot hearing, a short reaction delay before dodging, lateral strafing, run pursuit, nearby cover selection, collision-aware pathfinding, local separation and short bursts with recovery. No logic in that module creates enemies. Simulation x/y coordinates are horizontal map positions, not jumps. Cover is a firing-position/visibility behavior; no crouch or jump animation is claimed.

The grounded death pose freezes its own animation, relaxes limb joints and lowers the transformed skinned mesh to minimum world height 0.012. It is a controlled collapse, not a physics ragdoll. Corpses remain disabled through subsequent objectives.

## Evidence and scope

- 25 Node regression/integration checks pass, including every campaign, hard spawn rejection after deployment, repeated and stale interactions, explicit defenses, AI run/dodge, navigation around a wall, objective connectivity and reload timing.
- Chromium 157 renders all eight maps with textured SkinnedMesh instances and normal humanoid heights; all twelve campaign paths finish with one creation event each.
- A live Run action visibly changes leg-bone quaternions between frames; reacting to a shot produces a collision-checked lateral dodge and body lean.
- 24 precise skinned-mesh death-bound checks contact the floor. Keyboard F and emulated landscape touch Interact are exercised without campaign reinforcements.
- No external runtime requests, page errors, console errors or WebGL errors are recorded.

Browser campaign tests control positions and armor to test state transitions deterministically. Physical iPad Safari, manual combat balance and hardware frame-rate validation remain outstanding. No GitHub push or deployment was performed.
