# Step 2b: 后端详细设计（并行）

> **策略**：基于已确认的架构设计，并行产出 database 和 api。

## 检查

如果 `phases.backendDetail == true` 且 `design/backend/database.md` 和 `design/backend/api.md` 均存在：

AskUserQuestion：
> 后端详细设计已存在，复用还是重新执行？
> - **A)** 复用
> - **B)** 重新执行

## 执行

并行启动两个 agent：

**Agent 1 — 数据库设计：**

```
Agent({
  subagent_type: "architect",
  prompt: "基于以下后端架构设计，进行数据库设计：\n\nPRD：\n{prd.md 全文}\n\n后端架构：\n{design/backend/architecture.md 全文}\n\n代码现状摘要（由 CodeGraph 预分析产出）：\n{design/codegraph-summary.md 全文}\n\n数据库规范：\n- 表前缀：`t_yl_{domain}_{biz}`\n- 主键：`bigint id`，分布式 ID\n- 审计字段：`create_time`、`update_time`、`deleted`（默认 0）\n- 多租户：`company_id`\n- 金额：`decimal(18,2)`；税率：`decimal(18,6)`\n- 索引命名：`pk_*`、`uk_*`、`idx_*`\n\n只产出 database.md，包含表清单、表结构、ER 图、索引清单、数据迁移脚本。"
})
```

**Agent 2 — API 设计：**

```
Agent({
  subagent_type: "architect",
  prompt: "基于以下后端架构设计，进行 API 接口设计：\n\nPRD：\n{prd.md 全文}\n\n后端架构：\n{design/backend/architecture.md 全文}\n\n代码现状摘要（由 CodeGraph 预分析产出）：\n{design/codegraph-summary.md 全文}\n\n代码规范：\n- 遵循阿里巴巴 Java 开发手册（泰山版）\n- Dto/Vo/Bo 使用 Lombok\n- 校验错误信息必须为中文\n\n只产出 api.md，包含接口清单、接口详情（路径、权限、请求/响应 DTO、错误码）、分页规范、批量操作规范。"
})
```

## 产出

- 使用 [templates/backend-database.md](templates/backend-database.md) 模板，写入 `$BASE_DIR/design/backend/database.md`
- 使用 [templates/backend-api.md](templates/backend-api.md) 模板，写入 `$BASE_DIR/design/backend/api.md`

## 确认

Read 工具读取两份文件，AskUserQuestion：
> 后端详细设计已生成（database + api），确认？
> - **A)** 确认，进入前端设计
> - **B)** 需要修改
> - **C)** 重新执行

确认后更新 `phases.backendDetail = true`。