---
base_branch: develop
branch_pattern: 'feature/<id>'
pr_target: develop
remote: origin
rebase_on_base: true
pr_tool: gh
pr_template: '.github/pull_request_template.md'
---

# Version control

- Work branches off `develop` after pulling latest.
- Branches are named `feature/PC-1234`.
- PRs open against `develop` with `gh pr create`.
- Finalize rebases the feature branch on `develop` before pushing — never a merge
  commit into the feature branch.
