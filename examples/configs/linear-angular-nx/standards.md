---
scope: changed-lines
---

# Standards

The reviewer holds every change to these. The builder never reads this file.

- **A1** `judgment` — Components hold no HTTP calls; data comes from a service in
  `libs/data-access`. *Why: components stay testable without an HTTP mock.*
- **A2** `mechanical` — Services and dependencies use `inject()`, not constructor
  parameters. *Why: one DI style across the monorepo.*
- **A3** `mechanical` — New component state uses signals, not `BehaviorSubject`.
  *Why: we are migrating off RxJS for local state; don't add to the pile.*
- **A4** `mechanical` — Components of 20 lines or fewer use an inline template.
  *Why: a separate file for three lines of markup is navigation for nothing.*
- **A5** `judgment` — User-facing copy goes through the i18n pipe, never a literal.
  *Why: literals ship untranslated.*
