---
scope: changed-lines
---

# Standards

The reviewer holds every change to these. The builder never reads this file.

- **G1** `judgment` — Errors are wrapped with context once, at the boundary that
  knows it (`fmt.Errorf("load config: %w", err)`). *Why: double-wrapped errors read
  like stack traces.*
- **G2** `mechanical` — Exported identifiers in `pkg/` have doc comments.
  *Why: `pkg/` is imported by other tools.*
- **G3** `judgment` — User-facing errors go to stderr with a non-zero exit; stdout is
  for data only. *Why: the tool is piped into other commands.*
