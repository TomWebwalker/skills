---
# docs/agents/quality-gates.md — commit rules and pre-push checks this repo enforces.
# Every value is an EXAMPLE. Mirror what CI actually runs; delete what doesn't apply.
commit:
  convention: conventional    # conventional | none | custom
  ticket_ref: none            # header-suffix '[ABC-123]' | header-prefix | footer | none
  coauthor_line: ''           # e.g. 'Co-Authored-By: Claude <noreply@anthropic.com>' ('' to omit)
  validator: ''               # command that lints a message on stdin, '' = no validator
                              #   commitlint: 'npx commitlint'
                              #   gitlint:    'gitlint'
                              #   cog:        'cog verify --file -'
  rules: ''                   # free-text summary of the limits that bite (see below)
gates:                        # run in order before push; fix failures before continuing
  # Reference stack.md commands rather than repeating them where possible.
  - { name: test,  cmd: 'stack.commands.test' }
  - { name: lint,  cmd: 'stack.commands.lint' }
  - { name: build, cmd: 'stack.commands.build' }
dup_check:
  enabled: false              # true only if CI/Sonar enforces a duplication rule
  cmd: ''                     # full command, e.g. the jscpd invocation below
  scope: changed-files        # changed-files | whole-repo — what must be clean for this PR
app_verify:                   # optional last gate: drive the running app (see below)
  enabled: false              # true once a verify-<app> skill exists in this repo
  skill: ''                   # project-local skill name, e.g. 'verify-web' ('' = none)
loop:                         # settings for /loop (build → verify → repeat)
  max_cycles: 5               # cycle budget before the loop hands back to a human
  builder_agent: builder      # subagent that writes/fixes code ('' = run inline)
  checker_agent: checker      # subagent that runs verify-feature ('' = run inline)
  on_exhausted: stop-and-report   # stop-and-report | ask
---

# Quality gates

## Commit messages

Write messages in the configured `convention`. Place the ticket id per `ticket_ref`,
and append `coauthor_line` if set.

When `commit.validator` is non-empty, CI lints the **entire** message (header, body,
and footer) — not just the first line. Validate before committing, and never bypass
with `--no-verify`:

```bash
cat > /tmp/commit-msg.txt <<'EOF'
<message, formatted per convention and ticket_ref>
EOF
<commit.validator> < /tmp/commit-msg.txt   # must exit 0
git commit -F /tmp/commit-msg.txt
```

Record the limits that actually fail builds in `commit.rules` so an agent doesn't have
to rediscover them. Common ones:

- header length cap (often 72 or 100 chars, **including** any ticket suffix)
- per-**physical-line** body/footer length caps — a single long `-m "paragraph"` is one
  line and will fail; hard-wrap the body or omit it
- a blank line required before the body and before the footer

If `validator` is empty, still write clean conventional messages — just skip the
validation step.

## Duplication

Only relevant when a code-quality service (Sonar, Qodana, CodeClimate) fails PRs on
duplicated blocks. Set `dup_check.enabled: true` and put the exact command in
`dup_check.cmd`. With `scope: changed-files`, refactor only clones that touch a file
this branch changed:

```bash
git diff --name-only <base_branch>...HEAD
```

Pre-existing clones in untouched files may be left for this PR.

## App verification

The gates above prove the code compiles and its tests pass; they don't prove the app
works when a person uses it. `/setup-project-skills` can generate a project-local
`verify-<app>` skill (under `.claude/skills/`) that starts the app, drives the flows
the branch touched per `stack.md#qa_mode`, tries hostile input, and saves screenshots
or transcripts as evidence.

When `app_verify.enabled` is true, `/verify-feature` runs `app_verify.skill` as its
**last** gate — after everything cheaper has passed — and merges its report. It is
marked `blocked` when an earlier gate failed the build, and `skipped` when the skill
isn't installed.

## Loop

`/loop` builds and verifies in cycles until the gates above pass. `loop.max_cycles`
caps how long it tries before handing back to a human; the loop also stops early on
its own when it isn't converging (see the skill for the full list).

Leave `builder_agent`/`checker_agent` at their defaults unless this repo has better
ones. Set them to `''` to run both roles inline without subagents. If
`stack.md#fix_agent` is set, `/loop` prefers it over the generic builder.

## Worked examples

<details><summary>Node + commitlint + jscpd (Sonar mirror)</summary>

```yaml
commit:
  convention: conventional
  ticket_ref: header-suffix
  validator: 'npx commitlint'
  rules: 'header <= 100 chars incl. [TICKET]; every body/footer line <= 100; blank line before body and footer'
gates:
  - { name: test,  cmd: 'stack.commands.test' }
  - { name: lint,  cmd: 'stack.commands.lint' }
  - { name: build, cmd: 'stack.commands.build' }
  - { name: duplication, cmd: 'see dup_check.cmd' }
dup_check:
  enabled: true
  scope: changed-files
  cmd: >-
    npx --yes jscpd@latest --min-tokens 100 --min-lines 10
    --reporters consoleFull --silent
    --ignore "**/node_modules/**,**/dist/**,**/coverage/**,**/*.spec.*,**/*.test.*,**/e2e/**"
    apps libs
app_verify: { enabled: true, skill: verify-web }
```
</details>

<details><summary>Python, pre-commit runs everything</summary>

```yaml
commit:
  convention: conventional
  ticket_ref: footer
  validator: 'gitlint'
gates:
  - { name: hooks,     cmd: 'pre-commit run --all-files' }
  - { name: typecheck, cmd: 'stack.commands.typecheck' }
  - { name: test,      cmd: 'stack.commands.test' }
dup_check: { enabled: false }
app_verify: { enabled: true, skill: verify-api }
```
</details>

<details><summary>Go, no commit convention</summary>

```yaml
commit: { convention: none, ticket_ref: none, validator: '' }
gates:
  - { name: vet,   cmd: 'go vet ./...' }
  - { name: lint,  cmd: 'stack.commands.lint' }
  - { name: test,  cmd: 'go test -race ./...' }
  - { name: build, cmd: 'stack.commands.build' }
dup_check: { enabled: false }
```
</details>

## Adapting

- No validator? `validator: ''` — write good messages, skip the check.
- No duplication service? `dup_check.enabled: false` and drop the gate.
- Library or `qa_mode: none`? `app_verify.enabled: false` — there is no app to drive.
- Gates should mirror CI exactly. A gate CI doesn't run is wasted local time; a CI
  check missing from `gates` is a surprise failure after push.
