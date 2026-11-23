# R4 site mission change report

## Cause

R3.1 route-layouts.js generated the same U-shaped route for every map from turnX, lowY and returnX. Three side pockets were generated from the same normal-vector formula, followed by a shared final screen. game.js then used largely shared end-of-map objective positions and a global living-enemy gate. Different decor did not produce different level structure or mission decisions.

## Change

site-plans.js now authors rooms, connecting paths, physical features, entry/exit points, objective positions, guard hiding cells, proximity gates, emergence targets and optional flank paths per site. All twelve missions have different suggested routes and guard deployments. The 101 observation mission uses a separate playable 89F ring; repeat memorial, night-market and mountain missions use alternate guard deployments. Minimap/design lines are expanded through actual walkable cells, so they do not cut through buildings.

route-layouts.js creates collision and matching visible occluders from those plans. Proximity gates and real visual contact replace accumulated-distance activation. The sealed campaign roster and one-shot encounter ledger remain in force. Water blocks movement but does not block sight. Tactics add sentry holds, authored flanks, close-range rushes and patrol movement while preserving dodge, pathfinding and burst recovery.

game.js places mission-specific hostage, bomb and extraction objectives. Mission completion requires disposal/escort and evacuation. Remote guards no longer gate objectives globally; nearby visible threats block interaction. Bombs require four uninterrupted seconds, reset on release/movement/jump/fire/damage, and retain an independent armed countdown. Escort extraction checks both the player and ally positions. Optional defense remains explicitly selected and retains three waves.

renderer3d.js displays bomb cases, evacuation rings and route breadcrumbs separately. Visible landmark roofs, halls, stadium seats/roof, market gates and observation windows supplement the new layouts. Libraries and the Soldier model are unchanged.

## Validation and limits

47 Node checks pass. Chromium checks all twelve missions, physical raycast occlusion of every opening guard, actual collision movement/shooting/objective completion, keyboard/mouse controls, four-second desktop and emulated-touch disposal, body ground contact and optional defenses. Page errors and external runtime requests are empty. Test actors receive increased armor for flow coverage; this is not a difficulty balance or device performance certification. Physical iPad testing remains outstanding.

SCENE_DESIGN.md distinguishes sourced architecture from fictional gameplay. The game still uses simplified procedural geometry, flat-grid movement and separate mission zones for tower floors. No website deployment was performed.
