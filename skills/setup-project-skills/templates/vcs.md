---
# docs/agents/vcs.md — branching model the skills follow.
base_branch: develop          # branch features start from and PRs target
branch_pattern: 'feature/<id>'  # <id> is replaced by the ticket id (or a slug)
pr_target: develop            # branch PRs are opened against
remote: origin
rebase_on_base: true          # rebase feature branch on base before pushing
---

# Version control

- New work branches off **`base_branch`** after pulling latest.
- Branch names follow **`branch_pattern`**, substituting `<id>` with the ticket id
  (e.g. `feature/PC-1234`). If there is no ticket, use a short kebab-case slug.
- PRs are opened against **`pr_target`** via `gh pr create`.
- When `rebase_on_base: true`, finalize updates `base_branch`, then rebases the
  feature branch on it before pushing (never merge-commits into the feature branch).

## Adapting
- Trunk-based repos: set `base_branch: main`, `pr_target: main`.
- Some teams prefix by type (`feat/`, `fix/`) — encode that in `branch_pattern`.
