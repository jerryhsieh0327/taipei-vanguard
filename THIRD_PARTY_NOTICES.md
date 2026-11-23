# Third-party components

## Three.js

Three.js r170 and the GLTFLoader, BufferGeometryUtils and SkeletonUtils addons are distributed under the MIT License. The complete license is retained at vendor/three/LICENSE. Addon imports were changed to relative local paths; the library is otherwise vendored from the pinned r170 tag.

Source: https://github.com/mrdoob/three.js/tree/r170
License: https://github.com/mrdoob/three.js/blob/r170/LICENSE

## Soldier character and animations

The textured, rigged Soldier.glb is the Mixamo character used by the official Three.js skeletal-animation blending example, including Idle, Walk, Run and TPose clips. It is bundled as a character asset in this playable game.

Asset source: https://threejs.org/examples/models/gltf/Soldier.glb
Attribution/example: https://threejs.org/examples/webgl_animation_skinning_blending.html
Mixamo usage information: https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html

Adobe's Mixamo FAQ permits royalty-free use of its characters and animations in video games. The model is not asserted to be covered by the Three.js software MIT license. No Counter-Strike or Valve model, sound or texture is included.

## Casual Walker civilian model (R5)

Model: Casual Walker v1, LOD1, by tevy. License: CC0 1.0 (public domain).
Author, preview and license: https://tevy.dev/models/casual-walker
Pinned asset: https://tevy.dev/models/casual-walker/v1/lod1.glb
CC0 legal text: https://creativecommons.org/publicdomain/zero/1.0/legalcode

The model is used as a civilian body/rig/texture base. Clothing overlays, aprons,
caps, floral pattern, accessories, body variation and runtime animation adaptation
are original additions for this game. Neither model is a Counter-Strike asset.

## Local compressed-model decoders (R5)

KTX2Loader, WorkerPool and ColorSpaces are vendored from Three.js r170 under its
MIT license. Imports were adjusted to local paths.

- Basis Universal transcoder, Apache-2.0: vendor/licenses/BasisUniversal-APACHE2.txt
  https://github.com/BinomialLLC/basis_universal
- Meshoptimizer decoder, MIT: vendor/licenses/Meshoptimizer-MIT.txt
  https://github.com/zeux/meshoptimizer
- ktx-parse, MIT: vendor/licenses/KTX-Parse-MIT.txt
  https://github.com/donmccurdy/ktx-parse
- zstddec and embedded decoder notices: vendor/licenses/Zstddec-MIT.txt
  https://github.com/donmccurdy/zstddec

These dependencies are bundled locally. No external CDN is used at runtime.

## Supplied imagery

The original approved imagery remains unchanged. Rights to user-supplied imagery remain with their respective owners. The existing game geometry is retained as simplified Taipei site studies; references and limitations are listed in SCENE_REFERENCES.md.

## R6 original additions

Street vehicles, market products, museum exhibit studies, ink-study textures, civilian routes and shopping accessories are original procedural additions. Scene references are informational and are listed in SCENE_DESIGN_R6.md; no new downloaded third-party art is included in R6. The existing bundled model and decoder notices above still apply.
