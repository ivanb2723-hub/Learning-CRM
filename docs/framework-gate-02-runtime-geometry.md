# Framework Gate 02 — Runtime Geometry Freeze

This record freezes the geometry used to evaluate the L2 shelf experiment. It does not change the Runtime asset, interaction hull, footprint, node identity, renderer, or state machine.

## Source visual

- Asset: `src/assets/system-atlas/runtime-direction-c.webp`
- Source coordinate system: `1536 × 1024`
- Alpha bbox: `(87, 36) → (1474, 1024)`
- Registered asset remains unscaled in this Gate composition.

## Runtime footprint

```text
backLeft   = (390, 560)
backRight  = (1100, 560)
frontRight = (1300, 800)
frontLeft  = (230, 800)
```

The footprint describes the main system's physical ground contact. It intentionally excludes glow, shadows, transparent padding, and the outer extent of the interaction hull.

## Runtime interaction hull

The existing source-coordinate polygon in `atlasRegistration.ts` is frozen. It is not a shelf input and will not be regenerated.

## Camera and projection

- Fixed oblique 2.5D camera.
- Back and front footprint edges remain horizontal.
- Left depth axis: approximately `(-160, +240)` from back-left to front-left.
- Right depth axis: approximately `(+200, +240)` from back-right to front-right.
- No affine shear or non-uniform scale is permitted for Runtime.

## L2 shelf design envelope

- Target center: `(755, 680)` in the same `1536 × 1024` source coordinate system.
- Surface envelope: the Runtime footprint enlarged uniformly by 15% around its centroid, preserving both camera axes.
- Desired surface corners:

```text
backLeft   = (335.25, 542)
backRight  = (1151.75, 542)
frontRight = (1381.75, 818)
frontLeft  = (151.25, 818)
```

- Shelf thickness: visually `46–64 px` at source resolution.
- Front rim depth: visually `34–48 px`, below the surface front edge at `y = 818`.
- Rim must sit in front of the Runtime asset; the surface/back must sit behind it.
- No text, labels, dashboard furniture, domain modules, or Runtime equipment may be baked into the framework assets.

## Visual invariants

- Cool white ceramic/polymer body with restrained pale-blue structure accents.
- Teal illumination may appear only as subtle reflected light from Runtime, not as a new identity color on the shelf.
- Soft upper-left lighting, cool lower-right shadow, low-contrast Direction C material treatment.
- Transparent background outside the shelf.

## Gate rendering order

```text
L2 surface/back
→ unchanged Runtime asset
→ L2 front rim
```

