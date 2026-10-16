# Framework Gate 02 — Result

## Decision

**FAIL — stop at L2.**

The material language is plausible, but the generated framework cannot accept the frozen Runtime asset with the required camera and occlusion rules without distortion or asset-specific masking.

## Evidence produced

1. Immutable Runtime asset: `src/assets/system-atlas/runtime-direction-c.webp`
2. Surface candidate: `src/assets/framework-gate-02/l2-runtime-surface-candidate.png`
3. Front-rim candidate: `src/assets/framework-gate-02/l2-runtime-front-rim-candidate.png`
4. Isolated Web verification page: `/framework-gate-02.html`
5. Geometry freeze: `docs/framework-gate-02-runtime-geometry.md`

## Projection comparison

Frozen Runtime footprint axes:

```text
left depth  = (-160, +240)
right depth = (+200, +240)
```

The generated shelf uses visibly steeper, nearly symmetric side axes. A uniform scale and translation can align its overall bbox, but cannot make both shelf depth edges parallel to the Runtime footprint. Correcting both sides requires controlled affine/shear beyond the Gate's permitted uniform transform.

## Occlusion failure

The Runtime source is one monolithic transparent asset. It contains foreground devices and teal paths below/outside the main footprint quadrilateral.

With the required order:

```text
surface
→ Runtime
→ front rim
```

the complete front rim intersects and hides those foreground devices and paths. Moving the rim below them removes the physical contact cue and makes Runtime look pasted on top. A natural result would require one of the following, all outside this Gate:

- split Runtime into back/middle/foreground visual layers;
- create an asset-specific rim mask with cut-outs around foreground equipment;
- redefine the Runtime footprint to include every grounded peripheral module;
- render the complete shelf and Runtime together as a new composite asset.

The Gate freezes the Runtime asset, footprint, interaction hull, and renderer, so none of these changes are permitted here.

## Interaction

The existing Runtime interaction hull was not modified. No production renderer or state-machine code was changed.

## Scope stop

- No L1/L3/L4 generation.
- No S0 or A asset replacement.
- No S1/S2 work.
- No Content, Schema, Inventory, React Flow identity, or registration architecture changes.

