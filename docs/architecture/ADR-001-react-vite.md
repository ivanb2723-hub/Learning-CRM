# ADR-001: React and Vite application foundation

## Status

Accepted for V1.

## Decision

Use a conservative version of the official Vite React + TypeScript template. The accepted baseline is Node.js 24.21.x, React 19.2.8, Vite 8.2.2, TypeScript 6.0.3, and strict TypeScript. React Flow is added as a feature dependency rather than used as the application template.

## Alternatives

- Use the xyflow Vite starter as the entire project foundation.
- Build the tooling configuration from an empty directory.
- Use Next.js or another SSR framework.

## Why not

The xyflow starter carries an older tooling baseline and structures the demo as a full-screen flow. Building from zero adds avoidable setup risk. SSR adds complexity without helping a static V1.

## Revisit when

Revisit only if static Vite deployment cannot satisfy a confirmed product requirement.
