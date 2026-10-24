---
id: 0001
title: Static-first hosting on GitHub Pages
date: 2026-10-22
status: Accepted
---
## Context
The portfolio should cost nothing to host and have nothing to keep running. GitHub Pages serves static files only.

## Problem
Choose between a server-rendered app with a backend and a fully static site.

## Alternatives considered
- Server-rendered Next.js on a VPS or serverless platform
- Plain HTML and hand-written JavaScript
- Next.js static export (chosen)

## Decision
Use Next.js with `output: 'export'`. Every page is pre-rendered at build time and published by a GitHub Actions workflow.

## Advantages
- Free hosting and no servers to patch
- Pages are plain files
- The same React component model for the UI

## Disadvantages
- No server features: no secure login, no direct writes to the repository, no runtime database
- Content changes need a rebuild and a deploy

## Consequences
Dynamic needs are handled by build-time scripts (sitemap, feed, build facts), browser-only features (search, filters) and optional external services such as a form endpoint.

## Follow-up
Add automated browser tests that load the exported files from a static server.
