---
base_branch: main
branch_pattern: '<id>-<slug>'
pr_target: main
remote: origin
rebase_on_base: true
pr_tool: gh
pr_template: ''
---

# Version control

- Trunk-based: everything branches off `main` and targets `main`.
- Branches are named `42-fix-token-refresh` (issue number, then a kebab-case slug).
  With no issue, use the slug alone.
- PRs open with `gh pr create`. There is no PR template — write a body describing the
  change, the reasoning, and how to verify it.
