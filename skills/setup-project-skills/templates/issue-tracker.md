---
# docs/agents/issue-tracker.md — how skills talk to this repo's issue tracker.
# Generic skills (start-issue, qa-local, finalize-feature) read these keys.
type: linear            # linear | github | jira | none
ticket_id_pattern: 'PC-\d+'   # regex that matches a ticket id in args/branch names
ticket_id_example: PC-1234
statuses:
  in_progress: In Progress    # name to set when work starts
  ready_for_qa: Ready to Test # name to set when a PR is up (or '' to skip)
version_label: true     # add a release-version label on finalize (true|false)
---

# Issue tracker

**Type:** Linear (accessed via the Linear MCP tools — `mcp__*linear*`).

## Fetch a ticket
Given a ticket id matching `ticket_id_pattern`, use the Linear MCP `get_issue`
to confirm it exists and read its title and current status.

## Set status
Use the Linear MCP `save_issue` (or the status-update tool) to move the ticket
to the `statuses` value above. Match the workflow-state name case-insensitively;
if the exact name is missing, list the team's states and pick the closest.

## Comment (QA instructions)
Post QA test steps as a Linear comment via the MCP `save_comment` tool. Before
writing, check existing comments so you don't duplicate an instruction block.

## Version label (finalize only)
When `version_label: true`, read the app version (e.g. `package.json#version`)
and add it as a label on the ticket if not already present.

---
## Adapting this file for other trackers

- **github** — replace MCP calls with `gh`: `gh issue view <id>`,
  `gh issue edit --add-label`, `gh issue comment`. `ticket_id_pattern: '#?\d+'`.
  Status is usually a label or project column rather than a workflow state.
- **jira** — use the Jira MCP/CLI; `ticket_id_pattern: '[A-Z]+-\d+'`; statuses are
  transitions ("In Progress", "In Review").
- **none** — set `type: none`. Skills then skip all tracker steps and derive intent
  from the branch name / commit message only.
