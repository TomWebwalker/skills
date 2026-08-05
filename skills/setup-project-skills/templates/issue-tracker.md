---
# docs/agents/issue-tracker.md — how skills talk to this repo's issue tracker.
# Every value is an EXAMPLE. Replace with what is true for your repo.
type: none              # linear | github | jira | gitlab | azure-devops | none
access: ''              # how the agent reaches it: 'mcp' | 'cli' | 'none'
ticket_id_pattern: ''   # regex matching a ticket id in args/branch names, e.g. '[A-Z]+-\d+'
ticket_id_example: ''   # e.g. ABC-123 or #42
statuses:
  in_progress: ''       # status to set when work starts ('' to skip)
  ready_for_qa: ''      # status to set when a PR is up ('' to skip)
version_label: false    # add a release-version label on finalize (true|false)
version_source: ''      # where the version comes from, e.g. 'package.json#version',
                        # 'pyproject.toml#project.version', 'Cargo.toml#package.version',
                        # 'VERSION', or 'git describe --tags --abbrev=0'
---

# Issue tracker

State which tracker this repo uses and how the agent reaches it (MCP tools, a CLI, or
not at all). Then fill in the four procedures below in terms of that tool. Keep them
concrete — the skills follow these steps literally.

## Fetch a ticket

Given an id matching `ticket_id_pattern`, confirm it exists and read its title and
current status.

## Set status

Move the ticket to the named `statuses` value. Match status names
case-insensitively; if the exact name is missing, list the available states and pick
the closest rather than failing.

## Comment (QA instructions)

Post QA steps as a comment. Check existing comments first so you don't duplicate an
instruction block.

## Version label (finalize only)

When `version_label: true`, read the version from `version_source` and add it as a
label if not already present.

## Worked examples

<details><summary>Linear via MCP</summary>

```yaml
type: linear
access: mcp
ticket_id_pattern: '[A-Z]+-\d+'
ticket_id_example: ABC-123
statuses: { in_progress: 'In Progress', ready_for_qa: 'Ready to Test' }
version_label: true
version_source: 'package.json#version'
```

Fetch with the Linear MCP `get_issue`; set status with `save_issue`; comment with
`save_comment`.
</details>

<details><summary>GitHub Issues via gh</summary>

```yaml
type: github
access: cli
ticket_id_pattern: '#?\d+'
ticket_id_example: '#42'
statuses: { in_progress: 'status:in-progress', ready_for_qa: 'status:ready-for-qa' }
version_label: false
```

`gh issue view <id>` to fetch, `gh issue edit <id> --add-label` for status (GitHub
has no workflow states — status is a label or a project column), `gh issue comment`
to comment.
</details>

<details><summary>Jira</summary>

```yaml
type: jira
access: cli
ticket_id_pattern: '[A-Z]+-\d+'
statuses: { in_progress: 'In Progress', ready_for_qa: 'In Review' }
```

Statuses are workflow *transitions*, not free-text — list available transitions and
pick by name.
</details>

<details><summary>No tracker</summary>

```yaml
type: none
```

Skills skip every ticket step and derive intent from the branch name and commit
messages. QA instructions are presented in chat instead of posted.
</details>
