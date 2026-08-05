---
type: linear
access: mcp
ticket_id_pattern: '[A-Z]+-\d+'
ticket_id_example: PC-1234
statuses:
  in_progress: In Progress
  ready_for_qa: Ready to Test
version_label: true
version_source: 'package.json#version'
---

# Issue tracker

**Linear**, reached through the Linear MCP tools.

## Fetch a ticket
`get_issue` with the id to confirm it exists and read title + current status.

## Set status
`save_issue` to move the ticket to the configured workflow state. Match the state
name case-insensitively; if it's missing, list the team's states and pick the closest.

## Comment (QA instructions)
`save_comment`. Check existing comments first so an instruction block isn't posted twice.

## Version label
Read `version` from `package.json` and add it as a label if not already present.
