# Step 6: 回归测试验证（Regression Test — 强制）

> **策略**：验证修复不仅解决了 Bug，还没有破坏任何原有功能。
>
> **这是强制阶段，不可跳过。**

## 检查

如果 `phases.regressionTest == true` 且 `$BASE_DIR/test/regression-test-report.md` 存在：

AskUserQuestion（复用/重新执行逻辑同上）。

## 执行

### 6.1 编译验证

```bash
# 后端
mvn clean package -T 1C -Dmaven.test.skip=true -Dmaven.compile.fork=true \
    -Dmaven.javadoc.skip=true -Dcheckstyle.skip=true -Dpmd.skip=true -Dspotbugs.skip=true

# 前端
npm run build
```

### 6.2 单元测试

```bash
# 后端 - 运行全部测试
mvn test

# 前端 - 运行全部测试
npm run test:unit
```

**关键要求：**
- [ ] 新增测试通过（复现 Bug 的测试 + 回归测试）
- [ ] 原有测试全部通过（无破坏）
- [ ] 测试覆盖率 >= 80%

### 6.3 集成测试

```bash
# 如有集成测试
mvn test -P integration-test
```

### 6.4 手动验证（如需要）

- [ ] 按照 Step 1 的复现步骤验证 Bug 已修复
- [ ] 验证相关功能不受影响
- [ ] 验证边界条件处理正确

### 6.5 失败处理

如果构建或测试失败：

1. 调用 `build-error-resolver` agent 分析错误
2. 修复问题
3. 重新构建验证
4. 循环直到通过

```
Agent({
  subagent_type: "build-error-resolver",
  prompt: "构建/测试失败，请分析并修复：

错误日志：
{构建错误输出}

变更文件：
{CHANGELOG-fix.md}

技术栈：Java 8 / Spring Boot 2.2.9 / Vue 3 / Vite

注意：这是 Bug 修复的回归测试，需要确保：
1. 修复仍然有效
2. 没有破坏原有功能"
})
```

## 回归测试报告

```markdown
## 回归测试报告

### 测试环境
- **分支**: {分支名}
- **提交**: {commit hash}
- **测试时间**: {时间}

### 编译结果
- [ ] 编译通过

### 单元测试结果
- [ ] 全部通过
- 测试总数: {n}
- 通过: {n}
- 失败: {n}
- 跳过: {n}

### 覆盖率
- 行覆盖率: {n}%
- 分支覆盖率: {n}%

### Bug 修复验证
- [ ] Bug 复现测试通过（修复有效）
- [ ] 手动复现验证通过

### 回归验证
- [ ] 相关功能测试通过
- [ ] 边界条件测试通过

### 结论
- [ ] 通过 - 可以合并
- [ ] 失败 - 需要修复
```

## 产出

使用 [templates/regression-test-report.md](templates/regression-test-report.md) 模板，写入 `$BASE_DIR/test/regression-test-report.md`。

## 确认

AskUserQuestion：
> 回归测试验证完成，确认？
> - **A)** 确认，进入收尾阶段
> - **B)** 修复问题后再继续
> - **C)** 重新执行

确认后更新 `phases.regressionTest = true`。