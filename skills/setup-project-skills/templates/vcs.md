---
# docs/agents/vcs.md — branching model the skills follow.
# Every value is an EXAMPLE. Replace with what is true for your repo.
base_branch: main             # branch features start from
branch_pattern: '<id>'        # <id> is replaced by the ticket id or a kebab-case slug
                              #   e.g. 'feature/<id>', 'feat/<id>', '<user>/<id>'
pr_target: main               # branch PRs are opened against (often == base_branch)
remote: origin
rebase_on_base: true          # rebase feature branch on base before pushing (false = merge)
pr_tool: gh                   # gh | glab | manual — how a PR/MR gets opened
pr_template: ''               # path to a PR body template, e.g. '.github/pull_request_template.md'
---

# Version control

- New work branches off **`base_branch`** after pulling latest.
- Branch names follow **`branch_pattern`**, substituting `<id>` with the ticket id, or
  a short kebab-case slug when there is no ticket.
- PRs open against **`pr_target`** using `pr_tool`. If `pr_tool: manual`, push and
  print the compare URL instead of creating the PR.
- When `rebase_on_base: true`, finalize updates `base_branch`, then rebases the feature
  branch on it before pushing — never merge-commits into the feature branch. Set it to
  `false` on teams that prefer merge commits or that protect shared branches.

## Worked examples

<details><summary>Git-flow-ish (develop base, typed prefixes)</summary>

```yaml
base_branch: develop
branch_pattern: 'feature/<id>'
pr_target: develop
rebase_on_base: true
pr_tool: gh
```
</details>

<details><summary>Trunk-based</summary>

```yaml
base_branch: main
branch_pattern: '<id>-<slug>'
pr_target: main
rebase_on_base: true
```
</details>

<details><summary>GitLab</summary>

```yaml
base_branch: main
branch_pattern: '<id>-<slug>'
pr_target: main
pr_tool: glab
```
</details>
