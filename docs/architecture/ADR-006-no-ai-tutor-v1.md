# ADR-006: No AI Tutor in V1

## Status

Accepted for V1.

## Decision

Do not include an AI Tutor, model API, streaming chat, RAG backend, prompt session, or API-key flow in V1. V1 must first prove that the System Explorer is an effective learning product without generated guidance.

## Alternatives

- Add an embedded chat tutor during initial development.
- Generate KnowledgeCard answers dynamically.
- Connect the learning system to the CRM Agent runtime.

## Why not

These alternatives introduce security, backend, session, token, cost, and evaluation concerns unrelated to the V1 validation goal.

## Revisit when

Revisit through a new ADR after the static Explorer is complete and there is evidence that an AI Tutor improves learning outcomes.
