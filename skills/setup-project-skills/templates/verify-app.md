---
# Template for the project-local app-verification skill that /setup-project-skills
# writes to .claude/skills/verify-<app>/SKILL.md in the TARGET repo.
# Replace every <placeholder>, keep only the drive section for this repo's qa_mode,
# and delete these comment lines. The skill stays model-invoked: /verify-feature
# (and /loop's checker) runs it as the last gate, so no one types it.
name: verify-<app>
description: Verify <app> end to end — start it, drive the flows the current branch touches, try to break them with hostile input, and save evidence. Run as the last gate of /verify-feature.
---

**Load config first.** Read `docs/agents/stack.md` (`commands.dev`, `services`,
`qa_mode`) and `docs/agents/vcs.md` (`base_branch`). This skill checks the running
app; the unit gates already ran before it. **Never edit code** — report, don't fix.

## Evidence directory

Save everything under one run directory and print its path:

```bash
repo=$(basename "$(git rev-parse --show-toplevel)")
branch=$(git branch --show-current | tr '/' '-')
run="${TMPDIR:-/tmp}/delivery-skills/$repo/$branch/app-verify/$(date +%Y%m%dT%H%M%S)"
mkdir -p "$run"
```

## Steps

1. **Scope.** List what the branch changed (`git diff --name-only <base_branch>...HEAD`)
   and map it to the routes, endpoints, or commands a user would hit. Verify those,
   not the whole app.
2. **Start.** Run `services` if set, then `commands.dev` in the background with its
   output going to `$run/server.log`. Wait for readiness: <ready check, e.g.
   `curl -sf http://localhost:<port>/health` in a retry loop, max 60 s>. If it never
   becomes ready, report `FAILED` with the last 40 lines of `server.log`.
3. **Drive** the scoped flows. <Keep one of these:>
   - **browser** — write a throwaway Playwright script to `$run/check.spec.ts` and run
     it with `npx playwright test $run/check.spec.ts`. Take a screenshot per step into
     `$run/`. Use a script run from the shell rather than browser MCP tools, so this
     works inside a checker subagent that only has shell access.
   - **api** — one `curl -sS -i` per endpoint and method, with a concrete body.
     Append each request and full response to `$run/transcript.txt`. Check the status
     code and the response shape, not just "it returned".
   - **cli** — build with `commands.build`, then run each command in a pseudo-terminal
     so colors, prompts, and TTY detection behave as they do for a user
     (`script -q "$run/transcript.txt" <cmd>` on macOS/BSD,
     `script -qc "<cmd>" "$run/transcript.txt"` on Linux). Check stdout and the exit
     code.
4. **Try to break it.** Repeat the scoped flows with hostile input, only where the
   change accepts input:
   - names: empty, 1 char, 300+ chars, emoji, right-to-left text, leading and
     trailing spaces, `<script>` and `'; --`
   - emails: `a+tag@example.com`, `"quoted"@example.com`, uppercase, IDN domains,
     missing TLD
   - data sets: none (empty state), one item, and far more than a page (1,000+ rows,
     so pagination and rendering hold up)
   - numbers: 0, negative, very large, decimal where an integer is expected

   A crash, a 5xx, a broken layout, or silently wrong data is a failure. A clear
   validation error is a pass.
5. **Tear down** everything this skill started (dev server, services it brought up).
   Leave services running that were already up before step 2.
6. **Write `$run/index.md`**: one line per check (flow, input, result, evidence file),
   then report.

## Report format

Same as `/verify-feature`, so the caller can merge it:

```
ALL GREEN
evidence: <run dir>
```

```
FAILED
<route | endpoint | command> - <what broke, with the real error or response> - app_verify
evidence: <run dir>
```
