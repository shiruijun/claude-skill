# Step 5: 代码审查（Code Review — 强制）

> **策略**：Bug 修复的代码审查要更严格，因为修复可能引入新的回归问题。
>
> **这是强制阶段，不可跳过。**

## 检查

如果 `phases.codeReview == true` 且 `$BASE_DIR/review/code-review-report.md` 存在：

AskUserQuestion（复用/重新执行逻辑同上）。

## 执行

**调用 `code-reviewer` agent：**

```
Agent({
  subagent_type: "code-reviewer",
  prompt: "对以下 Bug 修复进行代码审查：

Bug 根因分析：
{analysis/root-cause-analysis.md 全文}

修复方案：
{analysis/fix-design.md 全文}

变更文件：
{CHANGELOG-fix.md}

审查重点：
1. 修复是否针对根因，而非症状？
2. 修复是否最小化？有无过度修改？
3. 是否有回归风险？
4. 边界条件是否处理？
5. 并发/时序问题是否考虑？
6. 测试是否充分覆盖修复场景？
7. 错误处理是否完善？
8. 是否符合编码规范？

技术栈：Java 8 + Spring Boot 2.2.9 / Vue 3 / Vite

产出：代码审查报告"
})
```

### Bug 修复特有审查项

| 审查项 | 说明 |
|--------|------|
| 根因修复确认 | 修复是否在根因处，而非绕开问题 |
| 最小修改原则 | 是否只做必要修改，无顺便优化 |
| 回归风险 | 修改是否可能破坏其他功能 |
| 边界条件 | 修复是否处理了所有边界情况 |
| 并发安全 | 修复在并发场景下是否正确 |
| 测试覆盖 | 是否有测试能防止此 Bug 再次发生 |
| 日志/监控 | 是否添加了适当的日志以便未来排查 |

### 严重级别

| 级别 | 含义 | 行动 |
|------|------|------|
| **CRITICAL** | 修复引入新 Bug 或安全风险 | **阻止** - 必须修复 |
| **HIGH** | 修复不完整或回归风险 | **警告** - 应该修复 |
| **MEDIUM** | 可维护性问题 | **信息** - 考虑修复 |
| **LOW** | 风格或次要建议 | **注意** - 可选 |

### 失败处理

如果发现 CRITICAL 或 HIGH 问题：
1. 记录问题
2. 修复问题
3. 重新审查
4. 循环直到通过

## 产出

使用 [templates/code-review-report.md](templates/code-review-report.md) 模板，写入 `$BASE_DIR/review/code-review-report.md`。

## 确认

Read 工具读取 `code-review-report.md`，AskUserQuestion：
> 代码审查完成，确认？
> - **A)** 确认，进入回归测试阶段
> - **B)** 修复问题后再继续
> - **C)** 重新审查

确认后更新 `phases.codeReview = true`。