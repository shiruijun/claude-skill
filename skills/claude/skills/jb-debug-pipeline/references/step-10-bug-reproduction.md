# Step 1: 生产环境 Bug 复现（Reproduction — 强制）

> **策略**：在生产版本代码上稳定复现 Bug。无法复现的 Bug 无法验证修复是否有效。
>
> **这是强制阶段，不可跳过。**

## 检查

如果 `phases.bugReproduction == true` 且 `$BASE_DIR/reproduce/bug-reproduction-report.md` 存在：

AskUserQuestion：
> Bug 复现报告已存在，是否复用？
> - **A)** 复用，进入 hotfix 分支设置阶段
> - **B)** 需要补充复现信息
> - **C)** 重新执行复现

## 执行

### 1.1 收集生产 Bug 信息

从用户或文档中获取以下信息：

```markdown
## Bug 基本信息
- **Bug 编号**: {bugId}
- **标题**: {标题}
- **报告人**: {报告人}
- **报告时间**: {时间}
- **严重级别**: P0/P1/P2
- **影响范围**: {影响模块/功能}

## 生产环境信息
- **服务/模块**: {具体服务名}
- **生产版本**: {Git tag 或 commit hash}
- **首次发现时间**: {时间}
- **影响用户数/订单数**: {数量}

## 复现步骤
1. {步骤 1}
2. {步骤 2}
3. {步骤 3}

## 预期结果
{预期行为}

## 实际结果
{实际错误行为}

## 错误信息/截图
{错误日志、堆栈跟踪、截图等}

## 相关代码/接口
{涉及的接口、类、方法等}

## 临时规避方案
{如有临时规避措施，记录于此}
```

### 1.2 环境准备（生产版本）

```bash
# 切换到生产版本对应的 master 分支
git checkout master
git pull origin master

# 确认生产版本 commit
git log --oneline -1

# 确认服务可启动
# 后端
mvn clean package -T 1C -Dmaven.test.skip=true -Dmaven.compile.fork=true \
    -Dmaven.javadoc.skip=true -Dcheckstyle.skip=true -Dpmd.skip=true -Dspotbugs.skip=true

# 前端
npm install
npm run dev
```

### 1.3 复现验证

按照复现步骤执行，记录结果：

- [ ] 能否稳定复现？
- [ ] 复现成功率是多少？（每次/偶发/特定条件）
- [ ] 复现需要的数据/状态是什么？
- [ ] 最小复现路径是什么？（能否简化步骤）
- [ ] 是否与特定用户/数据/时间相关？

**如果无法复现：**

1. 检查数据库数据是否与生产一致
2. 检查是否是数据相关的问题（特定数据触发）
3. 检查是否是并发/时序相关的问题
4. 检查是否是特定配置触发
5. 与报告人确认复现步骤和环境差异
6. 如果确实无法复现，记录已尝试的所有环境组合，AskUserQuestion：

   > 无法在当前环境复现此 Bug，请选择：
   > - **A)** 继续基于日志和代码进行理论分析
   > - **B)** 等待更详细的生产环境信息
   > - **C)** 标记为不可复现，建议关闭

### 1.4 数据准备（如需要）

如果 Bug 与特定生产数据相关：

```sql
-- 准备复现所需数据（脱敏后的生产数据）
-- 或使用已有的测试数据脚本
```

## 产出

使用 [templates/bug-reproduction-report.md](templates/bug-reproduction-report.md) 模板，写入 `$BASE_DIR/reproduce/bug-reproduction-report.md`。

## 确认

Read 工具读取 `bug-reproduction-report.md`，AskUserQuestion：
> Bug 复现报告确认？
> - **A)** 确认，进入 hotfix 分支设置阶段
> - **B)** 需要补充复现信息
> - **C)** 重新执行

确认后更新 `phases.bugReproduction = true`。
