# Taipei Vanguard: Skyline Alert — 3D rebuild (development build)

This build replaces the earlier ray-cast/paper-sprite gameplay scene with a custom, offline WebGL 3D renderer. The game retains its twelve mission definitions, all eight Taipei map names, English HUD, touch controls, original tools, and local progress.

## Launch / deployment

Upload the whole folder (including `assets`) to the root of a GitHub Pages repository and enable Pages. Open its HTTPS URL using iPad Safari in landscape. No API keys, logins, microtransactions, ads, or network game services are required. Do not launch by opening `index.html` directly in a restricted file viewer; use GitHub Pages or another static website.

## Files

- `index.html`: game page, HUD, briefing, result and pause screens
- `style.css`: responsive touch interface, landscape layout
- `game.js`: twelve original mission definitions, touch controls, weapons, enemies, objectives, simulation, progress and original fallback renderer
- `renderer3d.js`: local dependency-free WebGL renderer, procedural 3D landmarks and enemy meshes
- `manifest.webmanifest`: standalone installation metadata
- `assets/landmark-1.jpg` through `assets/landmark-8.jpg`: eight approved-style background/briefing plates in the specified order
- `assets/approved-fps.png` and `assets/approved-briefing.png`: approved art direction references used in menu screens
- `assets/icon.svg`, `icon-180.png`, `icon-512.png`: installation icons

## 3D features

Perspective camera with horizontal and vertical look; WebGL depth testing; fully dimensional meshes and geometry; collision and movement maintained from the game simulation; generated articulated 3D hostile figures/robots that animate limbs, visibly take hits, and remain as inert 3D shapes when defeated; 3D cover, trees, paving, exterior architecture and landmarks. The first-person weapon and HUD are layered over the 3D view for touchscreen responsiveness. Gunshots use Web Audio procedural synthesis.

## Important limitations

This is a **first 3D development build**, not yet a finished high-fidelity 3D production game. Landmark geometry is a stylized procedural interpretation; it does not reconstruct verified building dimensions, actual street connectivity, architectural interiors, or survey-accurate layouts. The concept-art environment plates are used for mission selection, not as the only playable environment. Full visual fidelity to the approved artwork requires custom textured 3D assets and further environment and character art work.

The 3D engine requires a browser that supports WebGL. If WebGL is disabled, the original 2.5D renderer serves as a compatibility fallback; it cannot satisfy the new visual-quality target. We verified JavaScript syntax and the baseline menu and mission flow in a desktop browser, but headless sandbox graphics restrictions prevented rendering verification of WebGL output. **A physical iPad Safari QA pass, combat testing on every mission, and performance profiling remain necessary** before calling this production-ready.

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
