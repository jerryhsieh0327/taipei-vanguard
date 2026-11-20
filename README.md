# Taipei Vanguard: Skyline Alert — Mission & Landmark Update (2026-11-20)

This revision fixes unexpected enemies after Interact and adds recognizable building/ground-layout studies for all eight requested Taipei sites. It is a playable development build with simplified geometry, not a photorealistic or measured reconstruction.

## What changed in this revision

- Rescue, escort, waypoint and disable steps never generate hidden reinforcements. Cleared areas show `AREA CLEAR`.
- Stage setup is one-shot; duplicate and stale transitions cannot restart combat. Interact consumes each objective once and ignores rapid repeats, paused play and result screens.
- Missions 8 and 12 retain three explicit defense waves (3, 4 and 5 enemies). Each wave must be cleared, with a minimum ten-second interval; living enemies are never erased by the wave timer. The final heavy unit remains an explicit mission-12 combat objective.
- Taipei 101 has segmented glass-tower geometry and an entrance/lift-lobby slice; Memorial Hall has its white main hall, octagonal blue roof and stair approach; Longshan Temple has halls and side-corridor courtyard; the Palace Museum has its north-campus green-roofed building massing and gallery cover; Liberty Square has a five-opening/six-column arch and flanking theater buildings; Taipei Dome has a roofed baseball field and seating bowl; Raohe has an aisle, stalls, east gate and adjacent Ciyou Temple; Yangmingshan is represented by the Xiaoyoukeng trail, slope, exposed rock and fumaroles.
- Dead actors are positioned using the transformed model's lowest vertex so all four actor types contact the floor throughout the fall animation.

See `FIX_REPORT.md` for the exact diagnosis and test scope, and `SCENE_REFERENCES.md` for the site references and remaining scene limitations.

This build replaces the earlier ray-cast/paper-sprite gameplay scene with a custom, offline WebGL 3D renderer. The game retains its twelve mission definitions, all eight Taipei map names, English HUD, touch controls, original tools, and local progress.

## Launch / deployment

Upload the whole folder (including `assets`) to the root of a GitHub Pages repository and enable Pages. Open its HTTPS URL using iPad Safari in landscape. No API keys, logins, microtransactions, ads, or network game services are required. Do not launch by opening `index.html` directly in a restricted file viewer; use GitHub Pages or another static website.

## Files

- `index.html`: game page, HUD, briefing, result and pause screens
- `style.css`: responsive touch interface, landscape layout
- `game.js`: twelve mission definitions, touch controls, weapons, enemies, guarded objective/stage state, simulation and progress
- `landmarks.js`: eight reference-led landmark builders and site-specific objective positions
- `renderer3d.js`: local dependency-free WebGL renderer, procedural 3D landmarks and enemy meshes
- `manifest.webmanifest`: standalone installation metadata
- `assets/landmark-1.jpg` through `assets/landmark-8.jpg`: eight approved-style background/briefing plates in the specified order
- `assets/approved-fps.png` and `assets/approved-briefing.png`: approved art direction references used in menu screens
- `assets/icon.svg`, `icon-180.png`, `icon-512.png`: installation icons

## 3D features

Perspective camera with horizontal and vertical look; WebGL depth testing; fully dimensional meshes and geometry; collision and movement maintained from the game simulation; generated articulated 3D hostile figures/robots that animate limbs, visibly take hits, and remain as inert 3D shapes when defeated; 3D cover, trees, paving, exterior architecture and landmarks. The first-person weapon and HUD are layered over the 3D view for touchscreen responsiveness. Gunshots use Web Audio procedural synthesis.

## Important limitations

This is a **first 3D development build**, not yet a finished high-fidelity 3D production game. Landmark geometry is a stylized procedural interpretation; it does not reconstruct verified building dimensions, actual street connectivity, architectural interiors, or survey-accurate layouts. The concept-art environment plates are used for mission selection, not as the only playable environment. Full visual fidelity to the approved artwork requires custom textured 3D assets and further environment and character art work.

The 3D engine requires WebGL. If WebGL cannot start, deployment is blocked with a clear message. Desktop Chromium WebGL rendering has been verified for all eight maps, and automated mission progression has been verified for all twelve missions. Physical iPad Safari behavior and hardware performance remain unverified.

## Gameplay

Landscape iPad: left virtual joystick to move; drag right-side look area horizontally/vertically to aim; FIRE, AIM, RELOAD and SWITCH buttons; ARC KEY / SHIELD / DRONE; INTERACT appears near objectives. Keyboard (desktop testing): WASD, arrows, Space to shoot, R to reload, F to interact, 1/2 switch weapons, Q shield, E drone, Esc pause.

## Map and mission roster

1. Taipei 101 — Tower Lobby Sweep, Express Lift Rescue
2. National Chiang Kai-shek Memorial Hall — Memorial Hall Approach, Honor Gate Escort
3. Mengjia Longshan Temple — Temple Courtyard Watch
4. National Palace Museum — Palace Archive Lockdown
5. Liberty Square — Liberty Route Clear
6. Taipei Dome — Dome Concourse Push
7. Raohe Street Night Market — Night Lantern Rescue, Market Exit Escort
8. Yangmingshan — Mountain Signal Break, Skyline Final Stand

All eight environments are different procedural 3D scene variants, including independent Memorial Hall and Liberty Square construction.

## Revision: Site-specific cover and grounded character animation (2026-11-20)

The eight maps no longer share the same central plaza/crate arrangement. Collision layouts and WebGL meshes now use different prop families: Taipei 101 has lobby columns, shop kiosks and lift doors; Memorial Hall has monument-approach balustrades and stone planters; Longshan Temple has courtyard columns, incense burner and protective low railings; National Palace Museum has gallery display cases; Liberty Square has open landscaped sightlines and benches; Taipei Dome has modeled stepped spectator seating and turnstiles; Raohe Street Night Market has food stalls, awnings and lantern stands; Yangmingshan has boulders, timber railings and trail-like paving. The two Memorial Hall-area scenes remain distinct.

Humanoid opponents now have articulated mesh limbs and a walking gait tied to actual movement. Hostile actors move at walking speed instead of constantly bobbing in place. When defeated, a timed full-body rotation lowers the 3D character onto the ground, with the body kept for the remainder of the mission sequence. No blood or graphic wounds are shown. A disabled robot also comes to rest on the ground.

**IMPORTANT — real-world accuracy:** These are differentiated, stylized 3D gameplay environments. They are NOT yet accurate digital twins: road coordinates, floor connectivity, spectator bowl geometry, and exact architectural dimensions are not measured against survey data or photogrammetry. Taipei 101's elevator doors and upper atrium are shown as architectural elements; playable vertical floor transitions are NOT implemented. The approved plates remain visual references and mission-select assets, not fully reconstructed 3D buildings. This is an interim gameplay improvement, not completion of the requested photoreal/authentic streetscape build.

**Compatibility:** The former flat-sprite fallback was deliberately disabled. If WebGL cannot start, the game displays a clear 3D-required message instead of silently reverting to the unacceptable paper-enemy version. 

**Current validation:** All three JavaScript files pass syntax checks. `node --test tests/mission-flow.test.cjs` passes 21 regression/integration checks, including every mission. Chromium 157 renders every map with zero WebGL errors and completes all twelve mission paths using the actual shooting, interaction and simulation code. Keyboard Interact, mouse Interact and emulated landscape touch Interact pass. Sixteen actor/fall cases contact the floor. See `tests/browser-results.json` and `tests/mission-results.tap`. Automated campaign runs use test-only positioning and extra armor to isolate logic; they are not manual playthroughs or combat-balance/performance certification. Test hooks are confined to the test server and are absent from the delivered game scripts.

**Install:** Upload the contents of this folder to the repository root, including the NEW `landmarks.js`, updated `index.html`, `game.js`, `renderer3d.js` and all original assets. Keep `index.html` at the root. The entry page versions the three script URLs to refresh old cached scripts after deployment. Reload the page after publishing. No live GitHub files or hosting settings were changed while preparing this ZIP.
