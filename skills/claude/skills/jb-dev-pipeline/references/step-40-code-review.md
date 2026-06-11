# Step 4: 代码审查（Code Review — 强制）

> **策略**：使用 code-reviewer agent 对完整变更进行审查，按 CRITICAL / HIGH / MEDIUM / LOW 分级。发现 CRITICAL 或 HIGH 必须修复后才能进入下一阶段。
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
  prompt: "对以下代码变更进行完整代码审查：\n\n变更记录：\n{CHANGELOG-impl.md 全文}\n\n技术设计：\n{design/backend/architecture.md}\n{design/frontend/architecture.md}\n\n项目规范：\n- 阿里巴巴 Java 开发手册\n- ~/.claude/rules/common/coding-style.md\n- ~/.claude/rules/common/code-review.md\n\n操作：\n1. 运行 git diff 查看完整变更\n2. 对照设计文档，确认实现是否符合设计\n3. 逐条检查代码质量清单\n\n审查标准：\n- [ ] 代码可读且命名良好\n- [ ] 函数聚焦（<50 行）\n- [ ] 文件内聚（<800 行）\n- [ ] 无深层嵌套（>4 层）\n- [ ] 错误显式处理\n- [ ] 无硬编码密钥或凭据\n- [ ] 无 console.log 或调试语句\n- [ ] 新功能有测试\n- [ ] 测试覆盖率满足 80% 最低要求\n- [ ] 遵循不可变性原则（优先创建新对象）\n- [ ] 无魔法数字（使用具名常量）\n- [ ] 注释解释'为什么'而非'是什么'\n\n输出格式：\n1. 摘要表格（CRITICAL/HIGH/MEDIUM/LOW 数量）\n2. 每个问题的：级别、位置、问题描述、修复建议\n3. 总体结论：通过 / 需修复"
})
```

## 产出

使用 [templates/code-review-report.md](templates/code-review-report.md) 模板，写入 `$BASE_DIR/review/code-review-report.md`。

## 问题修复循环

如果审查发现 **CRITICAL** 或 **HIGH** 问题：

1. 调用 implementer subagent 修复具体问题
2. 重新运行 `code-reviewer` agent 审查修复后的代码
3. 循环直到所有 CRITICAL / HIGH 问题关闭

> **注意**：MEDIUM / LOW 问题建议修复，但不阻塞流程。记录到报告中即可。

## 确认

Read 工具读取 `code-review-report.md`，AskUserQuestion：
> 代码审查完成，确认？
> - **A)** 确认，进入安全审查
> - **B)** 修复 MEDIUM/LOW 问题后再继续
> - **C)** 重新审查

确认后更新 `phases.codeReview = true`。