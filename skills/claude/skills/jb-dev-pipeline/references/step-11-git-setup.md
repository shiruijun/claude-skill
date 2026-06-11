# Step 1b: Git Worktree 设置

> **策略**：使用 git worktree 创建隔离开发环境，严禁 `git checkout -b` 切换分支开发。

## 检查

如果 `phases.gitSetup == true`：

AskUserQuestion（复用/重新执行逻辑同上）。

## 执行

调用 `superpowers:using-git-worktrees` skill 设置隔离工作区。

流程：
1. 确定目标仓库（根据任务涉及的服务）
2. **询问基分支**（AskUserQuestion）：
   > 从哪个基分支创建 feature 分支？
   > - **A)** `master`（默认）
   > - **B)** 其他（输入分支名）
   
   记录用户选择的基分支为 `BASE_BRANCH`（默认 `master`）。
3. 进入仓库根目录，拉取基分支最新代码：
   ```bash
   git checkout $BASE_BRANCH
   git pull origin $BASE_BRANCH
   ```
4. 检查 `.worktrees/` 或 `worktrees/` 目录
5. 验证目录被 `.gitignore` 忽略（如未忽略则自动添加并提交）
6. 创建 worktree + feature 分支（从基分支一步完成）：
   ```bash
   git worktree add -b feat/{ticketId} .worktrees/feat-{ticketId}-{FEATURE_NAME} $BASE_BRANCH
   ```
7. 进入 worktree：
   ```bash
   cd .worktrees/feat-{ticketId}-{FEATURE_NAME}
   ```
8. 自动运行项目 setup：
   - 检测到 `pom.xml` → `mvn install -DskipTests`
   - 检测到 `package.json` → `npm install`
9. 验证基准测试通过（确保 worktree 初始状态干净）
10. 报告 worktree 路径和测试状态

## 确认

AskUserQuestion：
> Git worktree / feature 分支设置完成，确认？
> - **A)** 确认，进入 TDD 阶段
> - **B)** 需要修改
> - **C)** 重新执行

确认后更新 `phases.gitSetup = true`。