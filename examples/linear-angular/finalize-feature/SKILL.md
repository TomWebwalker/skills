---
name: finalize-feature
description: Commit changes using conventional commits, update develop branch, rebase current branch on develop, create a PR targeting develop, then write a note on the Linear ticket for QA explaining how to test the changes
---

1. Commit changes using conventional commits, stage and group logically if needed. Before running `git commit`, validate the **entire** commit message — header **and** body **and** footer — against the project's commitlint config, because CI lints the whole message (`commitlint --from <base> --to <head> --verbose`), not just the first line. Write the full message to a file and pipe it through commitlint exactly as CI sees it:
   ```bash
   cat > /tmp/commit-msg.txt <<'EOF'
   <type>(<scope>): <subject> [PC-XXXX]

   <body line 1, hard-wrapped at <= 100 chars>
   <body line 2, hard-wrapped at <= 100 chars>

   Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
   EOF
   npx commitlint < /tmp/commit-msg.txt   # must exit 0
   git commit -F /tmp/commit-msg.txt
   ```
   Rules that bite (the config `extends: ['@commitlint/config-conventional']`, so these are inherited even though only `header-max-length` is written out in `commitlint.config.js`):
   - `header-max-length`: header (type+scope+subject, including `[PC-XXXX]`) must be **≤ 100 chars**.
   - `body-max-line-length` and `footer-max-line-length`: **every body/footer line ≤ 100 chars**. This counts per physical line — a single `-m "long paragraph…"` is ONE long line and will fail. Hard-wrap the body, or avoid a body. Do not rely on a single long `-m`.
   - `body-leading-blank` / `footer-leading-blank`: keep a blank line before the body and before the footer.
   If commitlint exits non-zero, fix the message (shorten the header, hard-wrap body lines) and re-validate — never bypass with `--no-verify`. After committing, you can mirror CI's exact check with `git log -1 --format=%B | npx commitlint`.
2. Checkout develop branch and pull latest changes
3. Checkout the feature branch again and rebase it on develop
4. Run unit tests, lint, serve and check if it builds. If there are any issues, fix them before proceeding.
5. Pre-push duplication check (mirrors Sonar's PR rule). Run:
   ```bash
   npx --yes jscpd@latest --min-tokens 100 --min-lines 10 \
     --reporters consoleFull --silent \
     --ignore "**/node_modules/**,**/dist/**,**/coverage/**,**/*.spec.ts,**/*.spec.js,**/test-setup.ts,**/jest.config.ts,**/jest.preset.js,**/*.stories.ts,**/.storybook/**,**/e2e/**" \
     apps libs
   ```
   Thresholds (`--min-tokens 100 --min-lines 10`) match Sonar's TypeScript CPD defaults. Cross-reference any reported clones against the branch's changed files (`git diff --name-only develop...HEAD`). If a clone involves a file you touched, refactor (extract shared util/component/service) before push — Sonar's PR check will otherwise fail. Pre-existing clones in files this branch did not touch may be left as-is for this PR.
6. Push the feature branch to remote
7. Create a PR targeting develop
8. Find the Linear ticket based on the branch name (e.g. feature/PC-1234 -> PC-1234)
9. Write a comment with instructions for QA testing.
10. Check if ticket has a version label, if not, get version from the package.json file and add a version label to the Linear ticket (e.g. 1.2.3)

Use task list for the above and mark the tasks as completed once they are done. If you are not sure how to implement a certain part of the process, ask for help or look for examples in the codebase.