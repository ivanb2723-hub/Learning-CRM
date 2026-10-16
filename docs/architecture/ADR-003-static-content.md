# ADR-003: Typed static content

## Status

Accepted for V1.

## Decision

Store content as typed static TypeScript data validated by Zod. The only core objects are Domain, Node, Relation, Case, KnowledgeCard, InterviewQuestion, and Evidence. Cross-object integrity is checked before content is accepted.

## Alternatives

- Store content in component files.
- Use Markdown pages as the primary model.
- Add a CMS or database.

## Why not

Component-owned or page-owned content creates duplication. A CMS or database adds operational complexity before multi-user editing or persistence exists.

## Revisit when

Revisit when content scale, multi-user editing, cloud sync, or publishing workflow makes static TypeScript materially unmanageable.
