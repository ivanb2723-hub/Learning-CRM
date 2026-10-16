# ADR-005: Single source of knowledge

## Status

Accepted for V1.

## Decision

Every system Node is globally unique and has one `primaryDomainId`. Cross-domain meaning is expressed through Relation. System Explorer and Case Trace are base projections; Interview Lens is an overlay. They all read the same content objects and never maintain copies of a Node.

## Alternatives

- Maintain separate data for Explorer, Case, and Interview views.
- Duplicate cross-domain Nodes in each Domain.
- Store selected content in the UI state store.

## Why not

All three alternatives create competing truths and make corrections require multiple edits.

## Revisit when

Revisit only if future content requires explicit versioned variants; variants must still reference one canonical entity identity.
