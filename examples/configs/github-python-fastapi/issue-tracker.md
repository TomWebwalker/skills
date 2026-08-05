---
type: github
access: cli
ticket_id_pattern: '#?\d+'
ticket_id_example: '#42'
statuses:
  in_progress: 'status:in-progress'
  ready_for_qa: 'status:needs-review'
version_label: false
version_source: ''
---

# Issue tracker

**GitHub Issues**, reached with the `gh` CLI. GitHub has no workflow states, so
status is expressed as a label.

## Fetch a ticket
`gh issue view <id> --json number,title,labels,state`

## Set status
`gh issue edit <id> --add-label "<status>"` and remove the previous status label:
`gh issue edit <id> --remove-label "status:in-progress"`.

## Comment (QA instructions)
`gh issue comment <id> --body-file -`. List existing comments first
(`gh issue view <id> --comments`) so a QA block isn't posted twice.

## Version label
Not used — releases are tagged, not labelled per issue.
