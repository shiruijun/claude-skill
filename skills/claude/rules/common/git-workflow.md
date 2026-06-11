# Git 工作流

## 提交消息格式
```
<类型>: <描述>

<可选正文>
```

类型：feat, fix, refactor, docs, test, chore, perf, ci

注意：通过 ~/.claude/settings.json 全局禁用归属。

## Pull Request 工作流

创建 PR 时：
1. 分析完整提交历史（不仅是最新提交）
2. 使用 `git diff [base-branch]...HEAD` 查看所有更改
3. 起草全面的 PR 摘要
4. 包含带有 TODO 的测试计划
5. 如果是新分支，使用 `-u` 标志推送

> 对于 git 操作之前的完整开发流程（规划、TDD、代码审查），
> 参见 [development-workflow.md](./development-workflow.md)。

## AI Git 操作规范

**禁止 AI 自动执行以下操作：**

- `git push`（推送到远程仓库）
- `git push --force`（强制推送）
- `git reset --hard`（硬重置）
- `git rebase -i`（交互式变基）
- `git cherry-pick`（拣选提交）

**允许 AI 执行的操作：**

- `git status`、`git diff`、`git log`
- `git add`、`git commit`
- `git branch`、`git checkout`
- `git stash`
- `git merge`（仅限本地）

**原则：**

所有涉及远程仓库变更的操作必须由人工确认后执行。
