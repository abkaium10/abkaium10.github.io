---
id: 0002
title: Validated content and honest empty states
date: 2026-10-22
status: Accepted
---
## Context
Portfolio data is easy to fake and easy to get wrong. Visitors and recruiters should only see real information.

## Problem
Decide how personal data is stored, validated and shown when it is missing.

## Alternatives considered
- Hard-coded sample content in the components
- Content in a CMS with a backend
- Plain data files with build-time validation (chosen)

## Decision
Keep personal data in lib/profile.js and public/data/*.json. A validation script fails the build on invalid data, and sections without data are hidden instead of showing placeholders.

## Advantages
- No invented claims reach the live site
- Errors name the file and field
- Content stays in version control

## Disadvantages
- The site looks sparse until real data is added
- Editing needs the local editor or a text editor, not a hosted CMS

## Consequences
Every optional field must be safe to omit, and every link must be validated before it is rendered.

## Follow-up
Add checks for referenced images and external link health that do not fail the build on temporary network problems.
