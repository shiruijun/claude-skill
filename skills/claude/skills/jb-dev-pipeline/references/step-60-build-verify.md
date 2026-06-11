# Step 6: 构建验证（Build Verification — 强制）

> **策略**：编译 + 单元测试 + 覆盖率验证。全部通过才能进入收尾阶段。
>
> **这是强制阶段，不可跳过。**

## 检查

如果 `phases.buildVerify == true`：

AskUserQuestion（复用/重新执行逻辑同上）。

## 执行

### 后端构建

```bash
# 编译
mvn clean package -T 1C -Dmaven.test.skip=true -Dmaven.compile.fork=true \
    -Dmaven.javadoc.skip=true -Dcheckstyle.skip=true -Dpmd.skip=true -Dspotbugs.skip=true

# 运行测试
mvn test

# 生成覆盖率报告
mvn test jacoco:report
```

### 前端构建

```bash
# 安装依赖
npm install

# 编译
npm run build

# 运行单元测试
npm run test:unit

# 生成覆盖率
npm run test:coverage
```

### 失败处理

如果构建或测试失败：

1. 调用 `build-error-resolver` agent 分析错误
2. 修复问题
3. 重新构建验证
4. 循环直到通过

```
Agent({
  subagent_type: "build-error-resolver",
  prompt: "构建/测试失败，请分析并修复：\n\n错误日志：\n{构建错误输出}\n\n变更文件：\n{CHANGELOG-impl.md}\n\n技术栈：Java 8 / Spring Boot 2.2.9 / Vue 3 / Vite"
})
```

## 产出

使用 [templates/test-report.md](templates/test-report.md) 模板，写入 `$BASE_DIR/test/test-report.md`。

## 确认

AskUserQuestion：
> 构建验证完成，确认？
> - **A)** 确认，进入收尾阶段
> - **B)** 修复问题后再继续
> - **C)** 重新执行

确认后更新 `phases.buildVerify = true`。
