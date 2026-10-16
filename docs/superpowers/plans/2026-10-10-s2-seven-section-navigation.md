# S2 Seven-Section Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the frozen H02 S2 reader to the canonical seven-field order while retaining the trusted mechanism summary and flow visualization inside the project-landing section.

**Architecture:** Keep canonical `KnowledgeCard.mechanism` and `H02Text.mechanism` unchanged for editing, persistence, Attached Card preview, and JSON export. Remove only the standalone S2 navigation entry and render the mechanism editor/flow as the principle subsection of `project`, followed by the existing project implementation subsection.

**Tech Stack:** React 19, TypeScript, Vitest, server-rendered component tests, CSS.

## Global Constraints

- Preserve the accepted S2 visual baseline and all S0/S0-L/S1 behavior.
- Keep the Attached Card mechanism summary unchanged.
- Do not change the canonical schema or frozen H02 body text.
- Do not add content for other nodes.

---

### Task 1: Seven-section reading model

**Files:**
- Modify: `src/features/s1-preview/s2Sections.test.ts`
- Modify: `src/features/s1-preview/s2Sections.ts`

**Interfaces:**
- Produces: `S2_SECTIONS` in the order `definition`, `why`, `project`, `boundaries`, `case`, `interview`, `evidence`.
- Preserves: `previousS2Section()` and `nextS2Section()` clamped navigation behavior.

- [x] **Step 1: Write the failing test** asserting the exact seven IDs and adjacency across the removed `mechanism` position.
- [x] **Step 2: Run** `npm test -- src/features/s1-preview/s2Sections.test.ts --run` and confirm failure because the eighth mechanism section still exists.
- [x] **Step 3: Remove the standalone mechanism descriptor and reorder the remaining seven descriptors.**
- [x] **Step 4: Re-run the focused test and confirm it passes.**

### Task 2: Merge mechanism presentation into project landing

**Files:**
- Modify: `src/features/s1-preview/S2DeepReadDialog.test.tsx`
- Modify: `src/features/s1-preview/S2DeepReadDialog.tsx`

**Interfaces:**
- Consumes: unchanged `H02Text.mechanism` and `H02Text.projectUsage`.
- Produces: one `project` panel containing a principle/mechanism subsection, the existing flow visualization, and the CRM implementation subsection.

- [x] **Step 1: Write failing component assertions** for seven labels, `1 / 7`, absence of the standalone mechanism tab, and mechanism text/flow within the project section rendering path.
- [x] **Step 2: Run** `npm test -- src/features/s1-preview/S2DeepReadDialog.test.tsx --run` and confirm the old eight-section output fails.
- [x] **Step 3: Remove the standalone mechanism switch branch and move its editor plus flow into the project branch before project usage.**
- [x] **Step 4: Run the focused S2 tests and confirm they pass.**

### Task 3: Regression and browser verification

**Files:**
- Verify only: H02 storage/edit/export files and close-return integration.
- Create: browser screenshots under the existing S2 QA visualization directory.

**Interfaces:**
- Verifies: seven tabs, pagination, scroll reset, flow visibility, edit/save/cancel, JSON export, close to Attached Card, Attached Card close to Focus.

- [x] **Step 1: Run** `npm test -- --run`, `npm run typecheck`, and `npm run build`.
- [x] **Step 2: In the real browser, traverse all seven tabs and verify `1 / 7` through `7 / 7`.**
- [x] **Step 3: Verify the project tab contains one mechanism explanation, one flow, and the unchanged project implementation body.**
- [x] **Step 4: Exercise edit cancel/save, export download, and both close-return paths without modifying frozen source content.**
- [x] **Step 5: Capture the final project/mechanism integration screenshot and report the exact modified files.**
