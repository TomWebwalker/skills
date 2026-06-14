---
name: setup-project-skills
description: Configure a repository so the generic workflow skills (start-issue, qa-local, finalize-feature) know its issue tracker, branching model, stack, and quality gates. Use when onboarding these skills to a new repo, or when their assumptions (Linear, develop branch, Angular) don't match the project.
---

This skill writes per-repo configuration that the generic workflow skills read at
runtime. It is **prompt-driven**: detect what you can, show findings, confirm with
the user, then write the files. Do not silently guess — confirm each axis.

The configuration lives in four files under `docs/agents/` in the **target repo**
(the current working directory), plus a pointer block in `CLAUDE.md`/`AGENTS.md`.
Annotated schemas for each file are bundled at `templates/` next to this SKILL.md —
read them first; they define every key the skills depend on.

## Steps

1. **Detect.** Inspect the repo without writing anything yet:
   - Issue tracker: look for Linear/Jira/GitHub references in CLAUDE.md, README, PR
     templates, existing branch names, and which MCP/CLI tools are available.
   - VCS: `git branch -a` and `git symbolic-ref refs/remotes/origin/HEAD` to infer the
     base branch (`develop` vs `main`); look at recent branch names for the pattern.
   - Stack: read `package.json` (scripts, deps), check for `nx.json`/`angular.json`/
     `next.config.*`; note `apps/`+`libs/` vs a single app. Check available subagents
     for a suitable `fix_agent`.
   - Quality gates: `commitlint.config.*`, `.husky/`, CI workflows, jscpd/sonar config;
     read the `scripts` block for test/lint/build commands.

2. **Confirm.** Present what you detected per axis and ask the user to correct
   anything. Resolve at minimum: tracker type + ticket-id pattern + status names;
   base branch + branch pattern; framework + fix agent + the command map; commit
   convention + which pre-push gates CI runs.

3. **Write `docs/agents/`.** Create the four files from the bundled `templates/`,
   substituting the confirmed values into the frontmatter (and trimming the
   "Adapting" sections to what's true for this repo):
   - `docs/agents/issue-tracker.md`
   - `docs/agents/vcs.md`
   - `docs/agents/stack.md`
   - `docs/agents/quality-gates.md`

4. **Write the pointer block.** Add (or update) an `## Agent skills` section in
   `CLAUDE.md` (or `AGENTS.md` if that's what the repo uses) so the config is
   discoverable:

   ```markdown
   ## Agent skills

   Workflow skills read their configuration from `docs/agents/`:
   - `issue-tracker.md` — how to fetch/update/comment on tickets
   - `vcs.md` — base branch, branch naming, PR target
   - `stack.md` — framework, fix agent, run/test/build commands
   - `quality-gates.md` — commit rules and pre-push checks

   To re-run setup: `/setup-project-skills`.
   ```

5. **Report.** Summarize the four files and confirm the skills are ready. If a tracker
   is `none`, note that start-issue/qa-local/finalize-feature will skip ticket steps.

## Notes
- Idempotent: if `docs/agents/*.md` already exist, read them, show the current values,
  and update in place rather than clobbering.
- Keep each file minimal and true to the repo — delete schema options that don't apply
  instead of leaving dead config.
