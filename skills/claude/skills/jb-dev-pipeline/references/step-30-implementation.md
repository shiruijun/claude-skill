# Step 3: 编码实现

> **策略**：使用 subagent-driven-development 逐任务执行，每个任务经过 implement → spec review → code quality review 三阶段。

## 检查

如果 `phases.implementation == true`：

AskUserQuestion（复用/重新执行逻辑同上）。

## 执行

**使用 `subagent-driven-development` 执行：**

```
Skill({
  skill: "subagent-driven-development",
  args: "基于以下可执行任务清单执行编码：\n\n{plans/tasks.md 全文}\n\nTDD 报告（已完成的测试）：\n{test/tdd-report.md 全文}\n\n技术设计：\n- 后端架构：{design/backend/architecture.md}\n- API 设计：{design/backend/api.md}\n- 前端架构：{design/frontend/architecture.md}\n- 组件设计：{design/frontend/components.md}\n- API 集成：{design/frontend/api-integration.md}\n\n项目规范：\n- 编码规范：~/.claude/rules/common/coding-style.md\n- Java 规范：阿里巴巴 Java 开发手册（泰山版）\n- Web 规范：~/.claude/rules/web/coding-style.md\n- 数据库规范：表前缀 t_yl_{domain}_{biz}，主键 bigint，审计字段 create_time/update_time/deleted\n- 提交规范：feat/fix/refactor/docs/test/chore/perf/ci"
})
```

### 模型选择策略

| 任务特征 | 推荐模型 | 说明 |
|---------|---------|------|
| 1-2 个文件，spec 完整 | Haiku 4.5 | 机械实现，成本低 |
| 多文件协调，有集成问题 | Sonnet 4.6 | 标准编码任务 |
| 需要设计判断或广泛代码理解 | Opus 4.6 | 架构相关任务 |

## 产出

使用 [templates/CHANGELOG-impl.md](templates/CHANGELOG-impl.md) 模板，写入 `$BASE_DIR/CHANGELOG-impl.md`。

## 确认

AskUserQuestion：
> 编码实现完成（含子代理自检），确认？
> - **A)** 确认，进入代码审查
> - **B)** 需要修改
> - **C)** 重新执行

确认后更新 `phases.implementation = true`。