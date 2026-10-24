---
id: 0003
title: Few runtime dependencies, features written in-house
date: 2026-10-22
status: Accepted
---
## Context
The site needs a Markdown renderer, syntax highlighting, a command palette, a terminal and several small charts.

## Problem
Decide whether to add a library for each feature or write small purpose-built code.

## Alternatives considered
- A library per feature (Markdown, highlighting, charts, animation)
- Small in-house modules (chosen)

## Decision
Ship with three runtime dependencies (Next.js, React and React DOM) and implement the features as small modules in lib/.

## Advantages
- Less JavaScript shipped and fewer packages to audit
- Behaviour is fully understood and testable

## Disadvantages
- The Markdown renderer supports only a subset of Markdown
- More code to maintain than using a vetted library

## Consequences
New features must justify any new dependency, and untrusted Markdown stays escaped with only https links and images allowed.

## Follow-up
Reconsider a vetted Markdown and sanitizing library if content features grow.
