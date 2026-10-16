# Detachable Asset Gate v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This session executes inline because the user explicitly requested the work now and did not request delegation.

**Goal:** Test whether the frozen S0 baked raster can be decomposed into static socket-back, static front-lip-contact, and movable Core assets that pass both first-frame identity and departure integrity.

**Architecture:** The frozen baked PNG is the pixel authority. Build explicit ownership masks in its 1487×1058 coordinate system. Retain every exposed static pixel from baked, use the original Fabric and generated empty-floor reference only beneath the moving Core, and alpha-composite the three layers in the prescribed order. Produce visual and numeric Gate A/B evidence before any PASS claim.

**Tech Stack:** Node.js, sharp, SVG raster masks, transparent PNG. No Web runtime changes.

## Global Constraints

- Do not modify `qa/static-asset-gate/S0-baked-static-candidate-02.png`, S0-L, or any React/TS/CSS/React Flow file.
- Do not regenerate the whole Fabric or redesign Core.
- Static pixels already visible in baked remain unchanged.
- The Core must be visibly independent after departure, and the empty socket must remain complete.

---

### Task 1: Ownership and source audit

**Files:** Create `qa/detachable-asset-gate-v2/ownership-audit.md`; create `qa/detachable-asset-gate-v2/source-socket-floor-reference.png`.

- [x] Record frozen baked dimensions/hash and inspect original Fabric, original Core, and generated floor sources; detailed counts are in `metrics.json`.
- [x] Classify central pixels as static Fabric, front lip/contact, moving Core, hidden socket, or 1–3 px boundary band.
- [x] Render a colored ownership overlay and inspect the central area at 4×.

### Task 2: Three asset decomposition

**Files:** Create `qa/detachable-asset-gate-v2/build-assets.mjs` and three PNG outputs in that folder.

- [x] Derive the hidden empty floor from the original Fabric plus the local inpaint reference without replacing already exposed baked pixels.
- [x] Make distinct back, front-lip, and moving-Core masks in baked coordinates.
- [x] Export `S0-socket-back.png`, `S0-front-lip-contact.png`, and `S0-core-flight.png` at 1487×1058 RGBA.

### Task 3: Dual Gate verification

**Files:** Generate Gate A full/2×/4×/diff/metrics and Gate B shifted/full-departure previews in `qa/detachable-asset-gate-v2/`.

- [x] Composite back → Core → front lip, compare against frozen baked, and report unequal pixels, maximum channel delta, and location of structural differences.
- [x] Composite back → shifted Core → front lip and back → front lip only; inspect the exposed socket and isolated Core for static-pixel carryover and edge halos.
- [x] Mark each Gate PASS or FAIL based on visual evidence. After the local contact-band correction, Gate A and the asset-only Gate B pass; stop before Web integration as instructed.
