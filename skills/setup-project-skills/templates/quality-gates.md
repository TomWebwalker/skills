---
# docs/agents/quality-gates.md — commit rules and pre-push checks CI enforces.
commit:
  convention: conventional      # conventional | none
  ticket_ref: 'header-suffix'   # where the ticket id goes: header-suffix '[PC-1234]' | none
  commitlint: true              # repo runs commitlint in CI (validate full message before commit)
  coauthor_line: 'Co-Authored-By: Claude <noreply@anthropic.com>'  # '' to omit
gates:                          # run in order before push; fix failures before continuing
  - { name: test,  cmd: npm test }
  - { name: lint,  cmd: npm run lint }
  - { name: build, cmd: npm run build }
  - { name: duplication, cmd: jscpd }   # see "Duplication" below for the full invocation
dup_check:
  enabled: true
  min_tokens: 100
  min_lines: 10
  ignore: '**/node_modules/**,**/dist/**,**/coverage/**,**/*.spec.ts,**/*.spec.js,**/test-setup.ts,**/jest.config.ts,**/jest.preset.js,**/*.stories.ts,**/.storybook/**,**/e2e/**'
---

# Quality gates

## Commit messages
When `commit.commitlint: true`, CI lints the **entire** message (header + body +
footer), not just the first line. Validate before committing — never `--no-verify`:

```bash
cat > /tmp/commit-msg.txt <<'EOF'
<type>(<scope>): <subject> [<TICKET>]     # [<TICKET>] only when ticket_ref = header-suffix

<body, hard-wrapped at <= 100 chars per physical line>

<coauthor_line>                            # omit if coauthor_line is empty
EOF
npx commitlint < /tmp/commit-msg.txt        # must exit 0
git commit -F /tmp/commit-msg.txt
```

Rules that bite (`@commitlint/config-conventional`):
- `header-max-length` ≤ 100 chars (type+scope+subject including the `[TICKET]` suffix).
- `body-max-line-length` / `footer-max-line-length`: **every physical line** ≤ 100.
  A single long `-m "paragraph"` is ONE line and will fail — hard-wrap or omit the body.
- `body-leading-blank` / `footer-leading-blank`: blank line before body and footer.

## Duplication (Sonar PR rule mirror)
When `dup_check.enabled`, run before push and refactor any clone that touches a file
this branch changed (`git diff --name-only <base>...HEAD`):

```bash
npx --yes jscpd@latest --min-tokens 100 --min-lines 10 \
  --reporters consoleFull --silent \
  --ignore "<dup_check.ignore>" \
  <stack.source_paths>      # e.g. apps libs
```

Pre-existing clones in untouched files may be left for this PR.

## Adapting
- No commitlint? set `commitlint: false` — still write conventional messages, but skip
  the validation dance.
- No Sonar/jscpd? set `dup_check.enabled: false` and drop the `duplication` gate.
- Adjust the `gates` list to match what this repo's CI actually runs.
