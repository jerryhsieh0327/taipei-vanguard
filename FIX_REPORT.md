# R6 change report

The previous scene pass had few neutral inhabitants and mostly generic stalls. Both 101 missions now use the Xinyi shopping district; a more distant tower landmark fits the initial camera view. Department-store masses frame the promenade. Parked vehicles have detailed original geometry and collision. Eight market stall types have distinct product geometry, with six neutral vendors.

ambient-life.js owns civilian state separately from enemies, downed enemies and the objective hostage. Connected paths are baked with the existing pathfinder. Pedestrians walk, browse, yield near the player, flee nearby gunfire and return. They use unique actor keys and are unarmed; only the nearest eight within range are drawn. This does not call enemy spawning or change mission counters.

The museum starts outside. A required entry stage advances only after reaching the raised lobby without a local threat, before the two disposal stages. The entrance coordinate is converted to the same point representation as other objectives. The new gallery partition hides existing guards and preserves passable approaches. Display objects, service information, original ink studies and lighting enrich the interior.

Campaign spawning remains locked to the initial fixed roster. Region encounters activate existing enemies once. Interact, entry, disposal, retreat and civilian ticks cannot refill the roster. The separately selected defense exercise retains its three intentional waves. Space jumps and left mouse fires; both desktop and simulated touch hold-to-defuse still pass.

Validation: 56 Node checks, complete 12-mission Chromium flow, actual 3D opening occlusion in all missions, 101 projected bounds and ray samples, moving unarmed civilians, museum exterior-to-interior traversal, eight market goods categories, 25 varying retargeted run poses, 48 grounded corpse cases, elevated cameras, keyboard/mouse and simulated touch. No page errors or external runtime requests. Reports are in tests/. Human difficulty tuning and physical tablet performance are not established by these automated checks.

Runtime assets remain bundled locally. Nested module URLs use the R6 cache token. All screenshots in SCENE_DESIGN.html are actual renders. Scenes are compressed stylized geometry, not measured replicas. No deployment was performed.
