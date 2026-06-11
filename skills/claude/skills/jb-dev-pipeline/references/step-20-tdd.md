# Step 2: 测试先行（TDD — 强制）

> **策略**：对每个后端业务任务先写测试（RED），再写实现（GREEN），最后重构（IMPROVE）。前端组件任务视复杂度补充测试。
>
> **这是强制阶段，不可跳过。**

## 检查

如果 `phases.tdd == true` 且 `$BASE_DIR/test/tdd-report.md` 存在：

AskUserQuestion（复用/重新执行逻辑同上）。

## 执行

**调用 `tdd-guide` agent：**

```
Agent({
  subagent_type: "tdd-guide",
  prompt: "基于以下技术设计，为后端任务进行测试驱动开发：\n\nPRD：\n{prd.md 全文}\n\n后端架构：\n{design/backend/architecture.md 全文}\n\nAPI 设计：\n{design/backend/api.md 全文}\n\n可执行任务：\n{plans/tasks.md 中的后端任务列表}\n\n要求：\n1. 先为每个 Controller 方法编写单元测试（RED）\n2. 运行测试 — 应该失败\n3. 编写最小实现使测试通过（GREEN）\n4. 运行测试 — 应该通过\n5. 重构代码（IMPROVE）\n6. 验证测试覆盖率 >= 80%\n\n技术栈：Java 8 + Spring Boot 2.2.9 + MyBatis-Plus 3.4.1 + JUnit 4/5\n\n约束：\n- 使用 Arrange-Act-Assert 结构\n- 测试命名使用描述性名称：'returns empty array when no markets match query'\n- Mock 外部依赖（Service / Mapper / Redis）\n- 覆盖正常流程、边界条件、异常场景\n\n产出：测试代码 + TDD 报告"
})
```

## 产出

使用 [templates/tdd-report.md](templates/tdd-report.md) 模板，写入 `$BASE_DIR/test/tdd-report.md`。

## 确认

Read 工具读取 `tdd-report.md`，AskUserQuestion：
> TDD 报告确认？
> - **A)** 确认，进入编码实现阶段
> - **B)** 需要补充测试
> - **C)** 重新执行

确认后更新 `phases.tdd = true`。