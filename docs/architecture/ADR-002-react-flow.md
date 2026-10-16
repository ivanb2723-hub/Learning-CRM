# ADR-002: React Flow boundary

## Status

Accepted for V1.

## Decision

Use `@xyflow/react` only for the System Atlas canvas: nodes, edges, viewport, focus, pan, zoom, fitView, and Case path highlighting. Nodes and edges are read-only projections of typed content. The application shell, knowledge details, overlays, and navigation remain outside React Flow.

## Alternatives

- Make the entire application a React Flow surface.
- Use a second graph engine for special views.
- Allow users to create or edit graph relations.

## Why not

Those alternatives blur application and canvas responsibilities, duplicate state, or turn the Explorer into a graph editor.

## Revisit when

Revisit only if a validated V2 requirement cannot be implemented through React Flow projections and normal React UI.
