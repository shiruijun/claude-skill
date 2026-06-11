# Step 7: 完成收尾（Hotfix Tag + Cherry-pick + 部署）

> **策略**：Hotfix 修复验证通过后，执行合并、打 tag、cherry-pick 到其他受影响版本，并记录部署步骤。

## 检查

如果 `phases.finish == true`：

跳过此步骤。

## 执行

### 7.1 提交 hotfix

```bash
# 在 worktree 目录下
# 确保所有修改已提交
git add .
git commit -m "fix: ${BUG_ID} ${BUG_NAME}

根因: {根因简述}
修复: {修复简述}

- {修改文件1}
- {修改文件2}

Closes ${BUG_ID}"
```

### 7.2 推送 hotfix 分支

```bash
git push origin "hotfix/${FIXER_NAME}/${ITER_VERSION}/${BUG_NAME}"
```

### 7.3 创建 Pull Request / Merge Request

**紧急程度判断：**

- **P0 紧急 Bug**（影响核心功能、造成资损）：
  - 可以先合并到 master，后补 review
  - 但必须在 24 小时内完成 retro review

- **P1/P2 Bug**：
  - 标准流程：先 review，后合并

### 7.4 合并到 master 并打 tag

```bash
# 切换到 master
git checkout master
git pull origin master

# 合并 hotfix 分支
git merge --no-ff "hotfix/${FIXER_NAME}/${ITER_VERSION}/${BUG_NAME}"

# 打 patch tag（语义化版本号 + hotfix 标识）
# 假设当前版本是 v1.2.0，hotfix 后变为 v1.2.1
git tag -a "v${VERSION}" -m "Hotfix: ${BUG_ID} ${BUG_NAME}"

git push origin master
git push origin "v${VERSION}"
```

### 7.5 Cherry-pick 到其他受影响版本

```bash
# 记录 hotfix commit hash
HOTFIX_COMMIT=$(git rev-parse HEAD)

# 对每个需要修复的 release 分支
for RELEASE_BRANCH in release/{版本A} release/{版本B}; do
    git checkout "$RELEASE_BRANCH"
    git pull origin "$RELEASE_BRANCH"
    git cherry-pick "$HOTFIX_COMMIT"
    git push origin "$RELEASE_BRANCH"
done
```

### 7.6 部署文档

使用 [templates/hotfix-deployment.md](templates/hotfix-deployment.md) 模板，写入 `$BASE_DIR/deploy/hotfix-deployment.md`。

```markdown
## Hotfix 部署文档

### 版本信息
- **Bug 编号**: {bugId}
- **修复版本**: v{x.x.x}
- **Git Commit**: {commit hash}
- **部署时间**: {时间}

### 变更内容
- {变更简述}

### 影响范围
- {影响的服务/模块}

### 回滚方案
```bash
# 回滚命令
```

### 部署步骤
1. {步骤 1}
2. {步骤 2}

### 验证步骤
1. {验证 1}
2. {验证 2}

### 监控重点
- {需要监控的指标/日志}
```

### 7.7 更新 Bug 状态

- 在 Bug 跟踪系统中更新状态为"已修复"
- 添加修复版本号
- 关联 Git commit 和 tag

### 7.8 通知相关方

- [ ] 通知 QA 验证
- [ ] 通知运维部署
- [ ] 通知产品经理
- [ ] 如为 P0，通知管理层

## 确认

确认后更新 `phases.finish = true`。
