# R3: Progressive ambush encounters and longer routes

## Changes

R2's campaign deployed the whole roster along the opening sightline and let every guard detect the player. R3 keeps a fixed, sealed roster but physically positions it in four occluded pockets along an extended approach. Guards remain idle until the player reaches the section or makes genuine visual contact with that group. Activated guards navigate out of the pocket, then retain the existing pursuit, strafe, dodge, cover and burst-fire logic. No enemy is teleported into the camera view or created by Interact.

route-layouts.js owns the 64x36 collision grid, 71–79-unit centerline routes, pocket cells, one-shot activation ledger, route projection, guides and visible wall faces. The original 24x24 landmark footprint is translated 36 units along X and connected to the approach. Wall faces are generated from the same cells used for collision and visibility. Each theme has its own proportions and architectural treatment. These approaches are gameplay layouts, not claims about real site plans.

Only one campaign roster-creation event occurs. spawnLocked rejects subsequent campaign creation. An activation event releases existing actors; it does not spawn or revive them. Each group ID can activate once. Route progress is monotonic, so walking back does not re-arm a trigger. Disabled actors remain in the corpse list.

Pathfinding keys and bounds now use the actual map dimensions. Escort personnel can request paths around blocked turns. Device, rescue and checkpoint coordinates move with the original site footprint, while escort exit coordinates remain at the new entrance. The minimap caches its static background and displays the longer route. Dormant guards are not shown normally; the deliberate scout-drone ability can still reveal their positions.

## Verification

- 30 Node checks pass. Every map has no visible or engaged guard at deployment, navigable pockets and objectives, a connected long route and four encounter sections. Waiting eight seconds does not move or activate the hidden roster.
- All twelve campaigns are traversed using collision-checked movement, real shooting, encounter AI and objective interactions. Rescue missions escort personnel back along the extended route. Every campaign finishes with exactly one roster-creation event, four unique activated groups and final kills equal to the original roster.
- Crossing the first gate releases only its one- or two-person team. Guards run out using the same collision grid. Later teams remain stationary. Backtracking and repeated Interact neither replay the encounter nor revive bodies.
- Stage-entry, stale completion, far/paused/consumed/repeated/result-screen interaction guards, running, delayed dodge, timed reload, intentional restart, terminal failure and timeout remain checked.
- The separate optional defense drills still produce exactly three intentional waves of 3, 4 and 5; their entry moves to the landmark arena.
- Chromium 157 additionally raycasts the actual rendered environment mesh to verify physical occlusion of every opening guard on all eight maps. It verifies the transition from zero visible guards to a moving, visible first team, including Run animation clips.
- Browser checks complete all twelve route flows, recheck backtracking and touch Interact, and verify 24 precise skinned-mesh floor-contact cases. No page/console/WebGL errors or external runtime resource requests are recorded.

Browser and Node campaign runs use extra armor to isolate state/path behavior. Opening and first-contact screenshots use normal armor. A physical iPad Safari performance and manual balance pass remains outstanding. No remote deployment was performed while preparing this release.
