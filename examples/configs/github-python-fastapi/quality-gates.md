---
commit:
  convention: conventional
  ticket_ref: footer
  coauthor_line: ''
  validator: ''
  rules: 'subject <= 72 chars, imperative mood; ticket referenced in the footer as "Refs: #42" so GitHub links it'
gates:
  - { name: hooks,     cmd: 'pre-commit run --all-files' }
  - { name: typecheck, cmd: 'stack.commands.typecheck' }
  - { name: test,      cmd: 'stack.commands.test' }
dup_check:
  enabled: false
  cmd: ''
  scope: changed-files
app_verify:
  enabled: true
  skill: verify-api             # .claude/skills/verify-api — curl against uvicorn on :8000
loop:
  max_cycles: 4
  builder_agent: builder
  checker_agent: checker
  reviewer_agent: reviewer
  on_exhausted: ask
---

# Quality gates

## Commit messages

Conventional commits, no automated validator. Reference the issue in the footer so
GitHub links the commit to it:

```
fix(auth): refresh tokens before expiry

Tokens were refreshed on 401, causing one failed request per hour.

Refs: #42
```

## Gates

`pre-commit run --all-files` covers ruff lint + format, so there is no separate lint
gate — it would duplicate the hook run. `mypy` and `pytest` run separately because CI
runs them as separate jobs.

## App verification

`verify-api` brings up Postgres and Redis, starts uvicorn, waits on `GET /health`, then
`curl`s every endpoint the branch touched — happy path plus hostile bodies (300-char
names, `"quoted"@example.com`, empty and oversized lists). Request/response
transcripts are the evidence.

## Duplication

Not enforced. No duplication service on this repo.
