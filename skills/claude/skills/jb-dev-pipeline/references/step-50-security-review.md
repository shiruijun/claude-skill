# Step 5: 安全审查（Security Review — 强制）

> **策略**：使用 security-reviewer agent 对变更进行安全审查。发现 CRITICAL 或 HIGH 安全问题必须修复后才能进入下一阶段。
>
> **这是强制阶段，不可跳过。**

## 检查

如果 `phases.securityReview == true` 且 `$BASE_DIR/review/security-review-report.md` 存在：

AskUserQuestion（复用/重新执行逻辑同上）。

## 执行

**调用 `security-reviewer` agent：**

```
Agent({
  subagent_type: "security-reviewer",
  prompt: "对以下代码变更进行安全审查：\n\n变更记录：\n{CHANGELOG-impl.md 全文}\n\n技术设计：\n{design/backend/architecture.md}\n{design/frontend/architecture.md}\n\n项目安全规范：\n- ~/.claude/rules/common/security.md\n- ~/.claude/rules/web/security.md\n\n操作：\n1. 运行 git diff 查看完整变更\n2. 逐条检查安全检查清单\n\n安全检查清单：\n- [ ] 无硬编码密钥（API 密钥、密码、令牌、数据库连接密码）\n- [ ] 所有用户输入已验证（@Valid、@NotNull、自定义校验）\n- [ ] SQL 注入防护（参数化查询 / MyBatis #{}）\n- [ ] XSS 防护（转义用户输入 / 不使用 innerHTML）\n- [ ] CSRF 保护已启用\n- [ ] 认证/授权已验证（@PreAuthorize / 接口权限）\n- [ ] 错误消息不泄露敏感数据（不暴露 SQL / 堆栈）\n- [ ] 文件上传接口校验文件类型和大小\n- [ ] 敏感信息不打印到日志或 console\n- [ ] 所有端点启用速率限制（如适用）\n\n输出格式：\n1. 摘要表格（CRITICAL/HIGH/MEDIUM/LOW 数量）\n2. 每个问题的：级别、位置、问题描述、安全风险、修复建议\n3. 总体结论：通过 / 需修复"
})
```

## 产出

使用 [templates/security-review-report.md](templates/security-review-report.md) 模板，写入 `$BASE_DIR/review/security-review-report.md`。

## 问题修复循环

如果审查发现 **CRITICAL** 或 **HIGH** 安全问题：

1. **立即停止**，不可进入下一阶段
2. 调用 implementer subagent 修复安全问题
3. 重新运行 `security-reviewer` agent 审查
4. 循环直到所有 CRITICAL / HIGH 安全问题关闭

> **安全红线**：发现安全漏洞时，必须先修复再提交，不可绕过。

## 确认

Read 工具读取 `security-review-report.md`，AskUserQuestion：
> 安全审查完成，确认？
> - **A)** 确认，进入构建验证
> - **B)** 修复安全问题后再继续
> - **C)** 重新审查

确认后更新 `phases.securityReview = true`。