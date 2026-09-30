---
commit:
  convention: none
  ticket_ref: none
  coauthor_line: ''
  validator: ''
  rules: 'plain imperative subject <= 72 chars; body optional'
gates:
  - { name: format, cmd: 'stack.commands.format_check' }
  - { name: vet,    cmd: 'go vet ./...' }
  - { name: lint,   cmd: 'stack.commands.lint' }
  - { name: test,   cmd: 'stack.commands.test' }
  - { name: build,  cmd: 'stack.commands.build' }
dup_check:
  enabled: false
  cmd: ''
  scope: changed-files
app_verify:
  enabled: false                # set true with skill: verify-tool once it's generated
  skill: ''
loop:
  max_cycles: 5
  builder_agent: builder
  checker_agent: checker
  reviewer_agent: reviewer
  models: { builder: sonnet, checker: haiku, reviewer: opus }
  on_exhausted: stop-and-report
---

# Quality gates

## Commit messages

No convention enforced. Write a plain imperative subject under 72 characters.

## Gates

These mirror `.github/workflows/ci.yml` exactly. `go test -race` is the slow one —
run it last, but do run it: the race detector catches things CI would otherwise catch
after push.

`gofmt -l .` fails when it prints anything, regardless of exit code.

## Duplication

Not enforced.
