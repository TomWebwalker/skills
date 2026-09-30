---
# Template for the project-local app-verification skill that /setup-project-skills
# writes to .claude/skills/verify-<app>/SKILL.md in the TARGET repo, next to a
# committed harness at e2e/verify-<app>.mjs (see "The harness" below).
# Replace every <placeholder>, keep only the drive notes for this repo's qa_mode,
# and delete these comment lines. The skill stays model-invoked: /verify-feature
# (and /loop's checker) runs it as the last gate, so no one types it.
name: verify-<app>
description: Verify <app> end to end — start it, run the committed app-verify harness against it, and save evidence. Run as the last gate of /verify-feature.
---

**Load config first.** Read `docs/agents/stack.md` (`commands.dev`, `services`,
`qa_mode`) and `docs/agents/vcs.md` (`base_branch`). This skill checks the running
app; the unit gates already ran before it.

**Run the harness; never write or edit checks.** Every check lives in
`e2e/verify-<app>.mjs`, which is committed and reviewed like any other code. A check
written on the fly by whoever runs verification passes by construction as often as
not (a "move" check that never clicks, an overflow check that only screenshots the
viewport). If the branch adds a flow the harness doesn't cover, report it as
`missing check: <flow>` — the builder adds it, the reviewer reviews it.

## Evidence directory

```bash
repo=$(basename "$(git rev-parse --show-toplevel)")
branch=$(git branch --show-current | tr '/' '-')
run="${TMPDIR:-/tmp}/delivery-skills/$repo/$branch/app-verify/$(date +%Y%m%dT%H%M%S)"
mkdir -p "$run"
```

## Steps

1. **Self-test.** `node e2e/verify-<app>.mjs --self-test`. It runs every check against a
   known-bad fixture and must report each one as failing. If any check passes its
   bad fixture, stop and report `FAILED` — `app_verify - check <name> cannot fail`.
2. **Start.** Run `services` if set, then `commands.dev` in the background with output
   to `$run/server.log`. Wait for readiness: <ready check, e.g. `curl -sf
   http://localhost:<port>/health` in a retry loop, max 60 s>. If it never becomes
   ready, report `FAILED` with the last 40 lines of `server.log`.
3. **Run.** `node e2e/verify-<app>.mjs --base <url> --out "$run"`. It writes one result
   per check and the evidence each check produced (screenshots, request/response
   transcripts) into `$run/`, then `$run/index.md`.
4. **Tear down** everything this skill started. Leave running what was already up.
5. **Report** the harness result in the format below. Copy each failing check's
   message as the harness printed it.

## The harness

`/setup-project-skills` writes `e2e/verify-<app>.mjs` and commits it. Its shape:

- **One function per check**, each returning `{ pass, detail, evidence }`. Assertions
  must be able to fail: count *changes* (a new line naming the moved task), measure
  (`document.documentElement.scrollHeight` vs the viewport), and match exact text
  (a failed load must not read as "No items yet").
- **The hostile pass** is a fixed list, one check each: empty data (a 200 with `[]`,
  not an aborted request), one item, 1,000 items, a 300-character title, emoji and
  right-to-left names, and a 500 response. A crash, a blank panel, a layout that
  overflows the page, or silently wrong text is a failure; a clear empty or error
  state is a pass.
- **Unreachable cases are reported, not dropped.** When the app can't be put into a
  state a check needs (a store that always starts seeded, so no empty list), the check
  returns `skipped: <check> (<why>)` and names the hook that would reach it (for
  example a `SEED=empty` variable).
- **`--self-test`** feeds each check a bad fixture (a static page or a stub server that
  violates it) and exits non-zero unless every check fails there.
- **Flows** the branch adds get a check in the same file, written by the builder with
  the feature.

Drive notes per `qa_mode` — keep the one that applies:

- **browser** — Playwright (`playwright` as a devDependency), headless Chromium, stub
  API responses with `page.route` for the hostile pass.
- **api** — plain `fetch` against the running server; write each request and full
  response to `$run/transcript.txt`.
- **cli** — run commands in a pseudo-terminal (`script -q` on macOS/BSD,
  `script -qc` on Linux) and check stdout and exit code.

## Report format

Same as `/verify-feature`, so the caller can merge it:

```
ALL GREEN
skipped: <check> (<why>)
evidence: <run dir>
```

```
FAILED
<check> - <what broke, as the harness printed it> - app_verify
missing check: <flow the branch adds that the harness doesn't cover>
evidence: <run dir>
```
