---
commit:
  convention: conventional
  ticket_ref: header-suffix
  coauthor_line: 'Co-Authored-By: Claude <noreply@anthropic.com>'
  validator: 'npx commitlint'
  rules: 'header <= 100 chars including the [PC-1234] suffix; every physical body/footer line <= 100; blank line before body and before footer'
gates:
  - { name: test,        cmd: 'stack.commands.test' }
  - { name: lint,        cmd: 'stack.commands.lint' }
  - { name: build,       cmd: 'stack.commands.build' }
  - { name: duplication, cmd: 'see dup_check.cmd' }
dup_check:
  enabled: true
  scope: changed-files
  cmd: >-
    npx --yes jscpd@latest --min-tokens 100 --min-lines 10
    --reporters consoleFull --silent
    --ignore "**/node_modules/**,**/dist/**,**/coverage/**,**/*.spec.ts,**/test-setup.ts,**/jest.config.ts,**/jest.preset.js,**/*.stories.ts,**/.storybook/**,**/e2e/**"
    apps libs
loop:
  max_cycles: 5
  builder_agent: angular-keeper   # stack.md#fix_agent knows the framework
  checker_agent: checker
  on_exhausted: stop-and-report
---

# Quality gates

## Commit messages

CI runs `commitlint --from <base> --to <head>`, which lints the **whole** message.
Validate first, never `--no-verify`:

```bash
cat > /tmp/commit-msg.txt <<'EOF'
<type>(<scope>): <subject> [PC-1234]

<body, hard-wrapped at <= 100 chars per physical line>

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
npx commitlint < /tmp/commit-msg.txt   # must exit 0
git commit -F /tmp/commit-msg.txt
```

A single long `-m "paragraph"` is ONE physical line and will fail `body-max-line-length`.

## Duplication

Mirrors Sonar's PR duplication rule (thresholds match Sonar's TypeScript CPD
defaults). Refactor any reported clone that touches a file in
`git diff --name-only develop...HEAD`; pre-existing clones elsewhere can wait.
