# Step 2a: 后端架构设计（串行）

## 检查

如果 `phases.backendArch == true` 且 `design/backend/architecture.md` 存在：

AskUserQuestion：
> `design/backend/architecture.md` 已存在，复用还是重新执行？
> - **A)** 复用
> - **B)** 重新执行

## 执行

调用 `architect` agent：

```
Agent({
  subagent_type: "architect",
  prompt: "基于以下 PRD 和技术头脑风暴，进行后端架构设计：\n\nPRD：\n{prd.md 全文}\n\n头脑风暴：\n{brainstorm.md 全文}\n\n代码现状摘要（由 CodeGraph 预分析产出）：\n{design/codegraph-summary.md 全文}\n\n技术栈：Java 8 + Spring Boot 2.2.9 + Spring Cloud Hoxton.SR7 + Spring Cloud Alibaba 2.2.3 + MyBatis-Plus 3.4.1 + PageHelper + MySQL + Redis（Redisson 3.11.5）+ Nacos + Caffeine\n\n要求：\n1. 服务拆分与模块划分\n2. 数据流设计\n3. 核心类设计（Controller / Service / Mapper / Entity / DTO 边界）\n4. 依赖关系\n5. 关键配置\n\n只产出 architecture.md，不产出 database 和 api 细节。"
})
```

## 产出

使用 [templates/backend-architecture.md](templates/backend-architecture.md) 模板，写入 `$BASE_DIR/design/backend/architecture.md`。

## 确认

Read 工具读取 `design/backend/architecture.md`，AskUserQuestion：
> 后端架构设计确认？
> - **A)** 确认，进入后端详细设计
> - **B)** 需要修改
> - **C)** 重新执行

确认后更新 `phases.backendArch = true`。