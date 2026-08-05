---
base_branch: main
branch_pattern: '<id>'
pr_target: main
remote: origin
rebase_on_base: true
pr_tool: gh
pr_template: ''
---

# Version control

- Trunk-based off `main`.
- No tracker, so `<id>` is always a short kebab-case slug: `retry-backoff`,
  `fix-windows-paths`.
- PRs open against `main` with `gh pr create`.
