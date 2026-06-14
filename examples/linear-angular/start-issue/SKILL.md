---
name: start-issue
description: Update develop branch, create a feature branch for a Linear ticket, and set the ticket as in progress
---

1. Parse the ticket number from $ARGUMENTS (e.g. "PC-1234")
2. Fetch the Linear ticket to confirm it exists and get its title
3. Checkout develop branch and pull latest changes
4. Create a new branch "feature/$ARGUMENTS" from develop
5. Set the Linear ticket status to "In Progress"
6. Confirm the branch is ready and the ticket has been updated
