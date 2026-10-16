# Learning CRM

An interactive, frontend-only learning system for understanding a CRM Agent through a system atlas, a knowledge map, attached knowledge cards, and a deep reader. It also includes an isolated customer-analysis learning-path experiment.

## Run locally

Use Node.js **24.21.x** and npm **11.13.0**.

```bash
npm ci
npm run dev
```

Open the local address printed by Vite. The routes are:

- `/` — S0 system overview; enter S0-L and the original S1 knowledge map from the UI.
- `/?view=s1` — original S1 knowledge map with 55 canonical nodes.
- `/?p1Path=1` — isolated L1–L4 customer-analysis learning-path sample.
- `/?view=s1&p1=1` — P1 experimental knowledge map with an entry to that sample.

The P1 routes are experiments, not a replacement for the original 55-node system. The six L3 query actions are a learning sample, not a fixed execution trace or final knowledge taxonomy.

## Validate

```bash
npm test
npm run typecheck
npm run build
npm run lint
```

## Repository contents

- `src/` — React UI, system atlas, knowledge map, readers, interactive learning path, and visual assets.
- `content/` — canonical learning content and source index.
- `experiments/p1/` — P1 compatibility fixture and adapter tests.
- `docs/` — architecture and historical design/verification notes.
- `src/features/p1-learning-path/source/` — the complete Work-authored learning text used by the isolated sample, including preserved contract and monthly-report material.

This repository includes the application source and its tests, not `node_modules`, generated builds, browser profiles, or local QA caches. Some provenance records refer to external course/project source files using `local-source://` placeholders; those original files are not part of this repository.

## Scope and data

This is a static learning frontend. It does not ship the original CRM Agent backend, live CRM data, authentication, or an AI service. Existing personal learning/edit states are browser-local and are not included in the repository or synchronized across devices. The P1 sample does not read or write the original learning-progress storage.

The Work learning text describes educational and project-study material; an interactive page is not proof that any CRM workflow was executed or evaluated in production.

## License

MIT; see [LICENSE](LICENSE). Original content in this repository may be reused under the same license. References to third-party courses, products, or source documents do not grant rights to those external materials.
