# H02 Content Integration Implementation Plan

> **For agentic workers:** Execute inline with red/green tests; preserve the existing dirty S0 workspace.

**Goal:** Make the existing S0/S0-L Harness domain open generic S1 and S2 views backed by canonical content, with H02 as the only newly frozen card.

**Architecture:** Keep the atlas and its assets untouched. Extend the strict Node schema only for inventory Weight and make `why.industry` optional. Keep the available Harness seed partial; correct only an existing Node that would otherwise contradict Inventory 0.2 on S1 and repair its references atomically. A generic content focus view reads validated `content` and `sources`; the atlas only owns navigation state.

**Tech Stack:** React 19, TypeScript 6, Zod 4, Vitest 4, Vite 8, React Flow 12.

**Spec:** `D:/.codex/attachments/31dad683-ad32-4b63-aef6-e4f4fef5bcfc/已粘贴的文本.txt`; approval in current chat, 2026-10-08.

## Global Constraints

- S0 and S0-L visuals and interactions stay frozen except the Harness click route.
- Node Inventory 0.2 constrains existing/new canonical Harness identity and Weight; this round does not complete the inventory.
- Do not add H05 or H10–H12. H02 is the only newly frozen Card.
- No other Schema/Knowledge Architecture expansion; no H02-specific renderer or JSX content.
- Preserve user-owned dirty files and assets.

## Review Focus

- H07 rename must not leave orphan Relation, Case, or source references: run validator and direct reference tests.
- Missing Card must render honestly in generic S2/S1, not crash or show invented content.
- H02 course/project/JD/interview evidence must retain correct source-layer attribution.
- Back navigation must work from S2 to S1 to original S0/S0-L mode.
- Non-H02 card (H06) must render through the same component.

### Task 1: Strict content contract and available Harness seed

**Files:** `src/domain/content/schema.ts`, `content/authoringContent.ts`, `content/authoringContent.test.ts`, `src/domain/content/knowledgeSystem.test.ts`, `src/domain/content/validateContent.ts`.

**Interfaces:** `Node.weight?: 'Core'|'Standard'|'Reference'`; `KnowledgeCard.why.industry?: string`; validated content remains the sole consumer interface.

- [ ] Add failing tests for available Harness nodes, frozen names/weights, absent old H07, and valid atomic references.
- [ ] Run focused tests and observe intended failures.
- [ ] Apply minimal schema and data changes; update only affected references and boundary whitelist.
- [ ] Run focused tests and full content validator suite.

### Task 2: Formal H02 content and typed source fragments

**Files:** `content/authoringContent.ts`, `content/sourceIndex.ts`, content tests.

**Interfaces:** H02 card remains `card:h02-context`; source fragments use existing `SourceLayer` enum and `validateKnowledgeSystem`.

- [ ] Add failing tests for frozen H02, 3 boundaries, 5 interview questions, evidence layer resolution, optional industry, and H06 unchanged.
- [ ] Run focused tests and observe intended failures.
- [ ] Add approved H02 text and source fragments with checked locators; do not invent course or industry facts.
- [ ] Run focused tests and full content validator suite.

### Task 3: Generic S1/S2 and atlas navigation

**Files:** new focused components under `src/features/content-focus/`, `src/features/system-atlas-v2/SystemAtlasMilestoneA.tsx`, CSS in the new feature, tests.

**Interfaces:** S1 consumes Domain ID and validated nodes/cards. S2 consumes Node ID and validated card/sources. Atlas transitions only on Harness node click.

- [ ] Add failing tests for domain filtering, card lookup, source resolution, H06 reuse, and return navigation state.
- [ ] Run focused tests and observe intended failures.
- [ ] Build generic views with no H02-specific branch or JSX text; preserve S0/S0-L rendering.
- [ ] Run focused tests, typecheck, and suite.

### Task 4: Rendered and final verification

**Files:** no production files unless verification reveals a reproducible defect.

- [ ] Run `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
- [ ] Visit live S0 and S0-L: Harness → S1 → H02 S2 → S1 → original Atlas; exercise H06 generic Card.
- [ ] Check visible content, no framework overlay/console errors, and unchanged S0/S0-L atlas.
- [ ] Record exact results and remaining risks; no claim of completion without observed evidence.
