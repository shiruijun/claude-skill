# Step 0.5: 代码预分析（CodeGraph）

> **策略**：一次性分析项目代码现状，产出摘要供后续所有步骤复用。

## 检查

如果 `phases.codegraph == true` 且 `design/codegraph-summary.md` 存在：

AskUserQuestion：
> `design/codegraph-summary.md` 已存在，复用还是重新执行？
> - **A)** 复用
> - **B)** 重新执行

## 执行

基于 PRD 识别涉及的服务/模块，调用 CodeGraph 进行全面代码分析：

```
# 1. 项目结构扫描
分析当前仓库的目录结构、服务清单、模块划分

# 2. 依赖关系分析
生成模块间依赖图、类依赖图、关键调用链

# 3. 已有 API 清单
扫描当前服务已暴露的 Controller / Feign 接口

# 4. 已有数据库表
扫描当前数据库已有表、字段、索引

# 5. 关键类识别
识别当前模块的核心类：Controller / Service / Mapper / Entity / DTO

# 6. 变更影响范围
基于 PRD 需求，分析可能受影响的代码区域
```

## 产出

使用 [templates/codegraph-summary.md](templates/codegraph-summary.md) 模板，写入 `$BASE_DIR/design/codegraph-summary.md`。

## 确认

Read 工具读取 `design/codegraph-summary.md`，AskUserQuestion：
> 代码预分析完成，确认？
> - **A)** 确认，进入头脑风暴
> - **B)** 需要修改
> - **C)** 重新执行

确认后更新 `phases.codegraph = true`。