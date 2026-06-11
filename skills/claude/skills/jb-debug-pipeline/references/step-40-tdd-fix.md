# Step 4: TDD 修复（Test-First Fix — 强制）

> **策略**：先编写能复现 Bug 的测试（RED），然后修复使测试通过（GREEN），最后重构（IMPROVE）。
> 
> **这是强制阶段，不可跳过。**

## 检查

如果 `phases.tddFix == true` 且 `$BASE_DIR/test/tdd-report.md` 存在：

AskUserQuestion（复用/重新执行逻辑同上）。

## 执行

### 4.1 编写失败测试（RED）

**调用 `tdd-guide` agent：**

```
Agent({
  subagent_type: "tdd-guide",
  prompt: "基于以下 Bug 修复方案，编写能复现 Bug 的测试：

Bug 根因分析：
{analysis/root-cause-analysis.md 全文}

修复方案：
{analysis/fix-design.md 全文}

要求：
1. 先编写一个能复现当前 Bug 的测试（应该失败）
2. 运行测试 — 必须失败（确认复现了问题）
3. 按照修复方案编写最小修复（GREEN）
4. 运行测试 — 应该通过
5. 重构代码（IMPROVE）
6. 验证测试覆盖率 >= 80%

技术栈：Java 8 + Spring Boot 2.2.9 + MyBatis-Plus 3.4.1 + JUnit 4/5

约束：
- 使用 Arrange-Act-Assert 结构
- 测试命名描述行为：'throws exception when input is null'
- Mock 外部依赖
- 覆盖正常流程、边界条件、异常场景
- 包含回归测试：确保修复不会破坏原有功能

产出：测试代码 + TDD 报告"
})
```

### 4.2 修复实现（GREEN）

按照 Step 3 的修复方案，编写最小修复：

- **一次只改一个地方**
- **不做"顺便优化"**
- **不做捆绑重构**
- **修复根因，不是症状**

### 4.3 验证测试通过

```bash
# 后端
mvn test -Dtest={测试类名}

# 前端
npm run test:unit -- --grep "{测试名}"
```

### 4.4 重构（IMPROVE）

- 保持修复最小化
- 只重构与修复直接相关的代码
- 不改无关代码

### 4.5 覆盖率验证

```bash
# 后端
mvn test jacoco:report

# 检查覆盖率
# 行覆盖率 >= 80%
```

## 产出

使用 [templates/tdd-report.md](templates/tdd-report.md) 模板，写入 `$BASE_DIR/test/tdd-report.md`。

同时更新 `CHANGELOG-fix.md`：

```markdown
# 修复变更日志

## {bugId} - {bugName}

### 修复内容
- {修复项 1}
- {修复项 2}

### 修改文件
- {文件 1}
- {文件 2}

### 测试
- {新增/修改的测试}

### 备注
- {特殊说明}
```

## 确认

Read 工具读取 `tdd-report.md`，AskUserQuestion：
> TDD 修复报告确认？
> - **A)** 确认，进入代码审查阶段
> - **B)** 需要补充测试
> - **C)** 重新执行

确认后更新 `phases.tddFix = true`。
