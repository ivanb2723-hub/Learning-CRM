# S0 Web Handoff Integration Plan

> **For agentic workers:** Execute inline in the current dirty checkout because the approved S0-L and registration changes exist here and must not be reset or copied incompletely. Do not commit unrelated work.

**Goal:** Bring the approved S0 baked image, detachable three-layer assets, and departure-only socket cleanup into the current React Flow system while leaving S0-L visuals unchanged.

**Architecture:** The default S0 image is the frozen baked raster. The existing Core React Flow node retains logical identity and click hitbox but does not paint its old S0 image. A click first swaps baked to the visually equivalent three-layer composition, then moves the Core flight asset while the cleanup overlay appears on the stationary socket; only after departure does the existing S0-L view become active.

**Tech Stack:** React, TypeScript, React Flow ViewportPortal, CSS transitions, Vite image imports, Vitest, browser visual QA.

## Global Constraints

- Do not edit the approved baked PNG or any of the five approved/diagnostic source assets.
- Do not modify S0-L scaffold, domain registrations, content, schema, or domain visual assets.
- The cleanup overlay is hidden in the default baked frame and visible only while the Core departs.
- Keep Core node ID `crm-core` and the existing domain IDs and click semantics.
- No new dependency.

---

### Task 1: Default S0 baked rendering

**Files:** `src/features/system-atlas-v2/AtlasStructureLayer.tsx`, `src/features/system-atlas-v2/AtlasAssetNode.tsx`, `src/features/system-atlas-v2/system-atlas-milestone-a.css`, `src/features/system-atlas-v2/AtlasStructureLayer.test.ts`.

- [ ] Add a failing markup/CSS test asserting S0 uses baked while S0-L retains its existing scaffold and the old S0 Core image is visually hidden but its node remains present.
- [ ] Run `npm test -- src/features/system-atlas-v2/AtlasStructureLayer.test.ts` and observe the expected failure.
- [ ] Import the approved baked PNG; render it at the current Fabric rect; hide only the old overview Core image, not the React Flow node.
- [ ] Run the same test and check a real S0 browser screenshot against the approved baked composition.

### Task 2: Detachable departure and cleanup

**Files:** `src/features/system-atlas-v2/AtlasStructureLayer.tsx`, `src/features/system-atlas-v2/SystemAtlasMilestoneA.tsx`, `src/features/system-atlas-v2/system-atlas-milestone-a.css`, `src/features/system-atlas-v2/AtlasStructureLayer.test.ts`.

- [ ] Add failing tests for three-layer prepared composition, cleanup hidden in that first frame, cleanup visible only in departure, and no detachable layers in S0-L.
- [ ] Run the focused test and observe the expected failure.
- [ ] Add the three same-coordinate assets and cleanup as separate ViewportPortal visual layers. At click, hold S0 at a prepared frame, animate Core flight downward toward the S0-L Core, fade in cleanup, then enter existing S0-L.
- [ ] Run focused tests and browser interaction; verify no first-frame jump, no static contact stain during departure, and S0-L visual unchanged.

### Task 3: Regression and visual proof

**Files:** Existing tests only; screenshot evidence outside committed source.

- [ ] Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`.
- [ ] Verify browser S0 default, Core click departure, S0-L final, and return to S0. Check console and screenshots.
- [ ] Report exact asset placement, unchanged scope, and any remaining visual mismatch rather than claiming success from tests alone.
