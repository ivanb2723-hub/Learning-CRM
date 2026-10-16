# ADR-004: No backend in V1

## Status

Accepted for V1.

## Decision

V1 is a statically built and hosted client application. It has no application backend, database, authentication, cloud synchronization, or live CRM integration.

## Alternatives

- Add a backend API and database from the start.
- Connect directly to the existing CRM or Agent runtime.
- Add user accounts and persisted progress.

## Why not

These capabilities do not improve the primary V1 goal of exploring a structured knowledge model and would make the learning system approach the complexity of the source CRM Agent.

## Revisit when

Revisit when a confirmed requirement needs multi-user access, online editing, private remote data, persistent user data, or live system integration.
