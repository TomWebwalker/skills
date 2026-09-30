---
# docs/agents/standards.md — review rules the reviewer agent checks each diff against.
# Every rule here is an EXAMPLE. Keep only rules this team actually holds reviews to.
# The builder never reads this file; only the reviewer does.
scope: changed-lines          # changed-lines | changed-files — what the reviewer judges
---

# Standards

Rules a reviewer holds every change to. Each has an id (the reviewer cites it), a tag,
and one line of *why* — a rule without a reason gets argued with.

- `judgment` — needs a reader to apply (naming, boundaries, error handling intent).
- `mechanical` — a tool could check it. It lives here until a lint rule or test
  replaces it; the reviewer marks its findings as *candidate for lint*, and `/retro`
  proposes the promotion when it keeps recurring.

Don't restate what linters, formatters, or type checkers already enforce — those run
as gates, and a duplicate rule here only adds noise to reviews.

## Rules

- **S1** `judgment` — Names say what a thing is for, not how it's built
  (`unpaidInvoices`, not `filteredList`). *Why: the next reader has only the name.*
- **S2** `judgment` — Errors are handled where something can be done about them;
  elsewhere they propagate. No empty catch blocks. *Why: a swallowed error is a bug
  report that never arrives.*
- **S3** `mechanical` — No new `TODO` without a ticket id. *Why: untracked TODOs are
  never done.*
- **S4** `judgment` — A behavior change comes with a test that fails without it.
  *Why: otherwise the next refactor removes it silently.*

## Worked examples

<details><summary>Angular frontend</summary>

- **A1** `judgment` — Components hold no HTTP calls; data comes from a service.
- **A2** `mechanical` — Services are injected with `inject()`, not constructor params.
- **A3** `mechanical` — New state uses signals, not `BehaviorSubject`.
</details>

<details><summary>Python service</summary>

- **P1** `judgment` — Route handlers validate input with a Pydantic model, never by
  hand.
- **P2** `mechanical` — No `print()` in `src/`; use the module logger.
- **P3** `judgment` — Database access goes through the repository layer, not from
  handlers.
</details>

<details><summary>Go CLI</summary>

- **G1** `judgment` — Errors are wrapped with context (`fmt.Errorf("load config: %w",
  err)`) once, at the boundary that knows the context.
- **G2** `mechanical` — Exported identifiers in `pkg/` have doc comments.
</details>

## Adapting

- Seed rules from `CONTRIBUTING.md`, style guides, `CLAUDE.md`/`AGENTS.md`
  conventions, and recurring review comments — not from a generic best-practice list.
- Fewer, sharper rules beat many vague ones. Five real rules is a good start.
- No standards yet? Leave the rules list empty; the reviewer then runs only the spec
  axis.
