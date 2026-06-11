# Step 1b: Hotfix 分支设置（强制）

> **策略**：使用 git worktree 创建隔离的 hotfix 开发环境，严禁直接在 master 或其他分支上修改。
>
> **生产环境铁律**：所有 hotfix 必须通过独立分支提交，禁止直接 push 到 master。

## 检查

如果 `phases.hotfixBranchSetup == true`：

AskUserQuestion（复用/重新执行逻辑同上）。

## 执行

### 2.1 确定基分支与影响版本

```bash
# 基分支固定为 master（生产环境）
BASE_BRANCH="master"

# 获取当前生产 tag
git fetch --tags
CURRENT_TAG=$(git describe --tags --abbrev=0 origin/master 2>/dev/null || echo "unknown")
```

AskUserQuestion：

> Hotfix 分支设置确认：
>
> **基分支**: `master`（当前生产版本: {CURRENT_TAG}）
> **Bug 影响版本**: {从复现报告读取}
>
> **需要 cherry-pick 的其他分支**:
> - [ ] release/{版本A}
> - [ ] release/{版本B}
> - [ ] 无（仅 master）
>
> **分支命名**: `hotfix/{%USERNAME%}/{迭代版本号}/{desc}`
> - 修复人: `%USERNAME%`
> - 迭代版本号: {从生产 tag 提取，如 v1.2.0 → 1.2.0}
> - desc: {BUG_NAME}
>
> - **A)** 确认创建
> - **B)** 修改参数
> - **C)** 跳过（已有 hotfix 分支）

### 2.2 创建 worktree + hotfix 分支

```bash
# 获取远程 master 最新状态（不切换分支）
git fetch origin master

# 提取迭代版本号（从当前生产 tag，如 v1.2.0 → 1.2.0）
ITER_VERSION=$(echo "$CURRENT_TAG" | sed 's/^v//')
FIXER_NAME="${USERNAME:-$(whoami)}"

# 创建 worktree + hotfix 分支（从远程 origin/master 一步完成）
# 分支格式: hotfix/{修复人}/{迭代版本号}/{desc}
BRANCH_NAME="hotfix/${FIXER_NAME}/${ITER_VERSION}/${BUG_NAME}"
WORKTREE_DIR=".worktrees/hotfix-${FIXER_NAME}-${ITER_VERSION}-${BUG_NAME}"

git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" origin/master

# 进入 worktree
cd "$WORKTREE_DIR"
```

### 2.3 运行项目 setup

```bash
# 后端项目
if [ -f "pom.xml" ]; then
    mvn clean install -DskipTests -Dmaven.compile.fork=true \
        -Dmaven.javadoc.skip=true -Dcheckstyle.skip=true -Dpmd.skip=true -Dspotbugs.skip=true
fi

# 前端项目
if [ -f "package.json" ]; then
    npm install
fi
```

### 2.4 验证基准测试通过

```bash
# 后端
mvn test -DfailIfNoTests=false

# 前端
npm run test:unit -- --run
```

确保 hotfix 分支初始状态干净，所有测试通过。

### 2.5 记录多版本修复计划

如果此 Bug 影响多个 release 版本，记录 cherry-pick 计划：

```markdown
## 多版本修复计划

| 目标分支 | 修复方式 | 执行时机 | 状态 |
|---------|---------|---------|------|
| master | hotfix 分支合并 | 修复验证通过后 | 待执行 |
| {release/x.x} | cherry-pick | master 合并后 | 待执行 |
| {release/x.x} | cherry-pick | master 合并后 | 待执行 |

## 部署计划
- [ ] 测试环境验证
- [ ] 预发布环境验证
- [ ] 生产环境灰度发布
- [ ] 生产环境全量发布
```

## 确认

AskUserQuestion：
> Hotfix 分支设置完成：
> - **worktree 路径**: `{WORKTREE_DIR}`
> - **分支名**: `{BRANCH_NAME}`
> - **基准测试**: {通过/失败}
>
> - **A)** 确认，进入根因分析阶段
> - **B)** 重新创建
> - **C)** 需要修改参数

确认后更新 `phases.hotfixBranchSetup = true`。
