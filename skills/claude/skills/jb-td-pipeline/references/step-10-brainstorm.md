# Step 1: 技术头脑风暴

## 检查

如果 `phases.brainstorm == true` 且 `design/brainstorm.md` 存在：

AskUserQuestion：
> `design/brainstorm.md` 已存在，复用还是重新执行？
> - **A)** 复用
> - **B)** 重新执行

## 执行

调用 `Agent` 进行技术方案分析，遵循 `superpowers:brainstorming` 方法论：

```
Agent({
  subagent_type: "general-purpose",
  prompt: "基于以下 PRD 进行技术方案头脑风暴分析。严格遵循 brainstorming 方法论：\n\nPRD：\n{prd.md 全文}\n\n项目技术栈：\n- 后端：Java 8 + Spring Boot 2.2.9 + Spring Cloud Hoxton.SR7 + Spring Cloud Alibaba 2.2.3 + MyBatis-Plus 3.4.1 + MySQL + Redis + Nacos\n- 前端（PC 老）：Vue 2.7 + Vite + Element UI\n- 前端（PC 新）：Vue 3 + Vite + TypeScript + Ant Design Vue / Arco Design Vue\n- 前端（H5）：Vue 3 + Vite + TypeScript + Vant 4\n\n代码现状摘要（由 CodeGraph 预分析产出）：\n{design/codegraph-summary.md 全文}\n\n要求：\n1. 探索项目上下文：基于 CodeGraph 摘要和 PRD，确认涉及的服务/模块/类\n2. 提出 2-3 种不同的技术方案，分析各自的优劣和权衡\n3. 推荐最优方案并说明理由\n4. 遵循 YAGNI 原则——只考虑当前 PRD 范围内的需求，不做预判性设计\n5. 设计保持隔离和清晰：模块边界明确，接口定义清晰\n6. 识别可复用的现有代码\n7. 识别潜在风险和注意事项\n\n重要约束：\n- 不要调用任何实现 skill\n- 不要写代码或搭建项目\n- 不要调用 writing-plans\n- 最终产出一份技术头脑风暴文档"
})
```

## 产出

使用 [templates/brainstorm.md](templates/brainstorm.md) 模板，写入 `$BASE_DIR/design/brainstorm.md`。

## 确认

Read 工具读取 `design/brainstorm.md`，AskUserQuestion：
> 确认 `design/brainstorm.md`？
> - **A)** 确认，进入下一步
> - **B)** 需要修改
> - **C)** 重新执行

确认后更新 `phases.brainstorm = true`。