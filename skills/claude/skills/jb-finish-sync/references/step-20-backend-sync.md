# Step 2: 后端设计同步

> **目标**：对比后端技术设计文档（architecture.md、database.md、api.md）与实际代码，确保文档反映真实实现。

## 检查

如果 `phases.backendSync == true` 且设计文档已覆盖更新过：

AskUserQuestion：
> 后端设计已同步过，复用还是重新对账？
> - **A)** 复用
> - **B)** 重新对账

## 执行

### 2.1 分析代码变更范围

启动 Agent 分析后端代码变更：

```
Agent({
  subagent_type: "code-reviewer",
  prompt: "作为代码审查专家，分析以下后端设计文档与实际代码的偏差。\n\n【设计文档 - 后端架构】\n{design/backend/architecture.md 全文}\n\n【设计文档 - 数据库设计】\n{design/backend/database.md 全文}\n\n【设计文档 - API 设计】\n{design/backend/api.md 全文}\n\n【代码变更记录】\n{CHANGELOG-impl.md 全文}\n\n【项目技术栈】\nJava 8 + Spring Boot 2.2.9 + Spring Cloud Hoxton.SR7 + Spring Cloud Alibaba 2.2.3 + MyBatis-Plus 3.4.1 + MySQL + Redis\n\n要求：\n\n**架构对账（architecture.md）：**\n1. 检查服务/模块拆分是否与设计一致\n2. 检查核心类（Controller/Service/Mapper/Entity/DTO）是否按设计实现\n3. 检查数据流是否与设计一致\n4. 标注偏差：CRITICAL/HIGH/MEDIUM/LOW\n\n**数据库对账（database.md）：**\n1. 对比设计的表结构与实际 Entity 类\n2. 检查字段类型、长度、nullable 是否一致\n3. 检查索引是否按设计创建\n4. 检查多租户字段（company_id）是否正确实现\n5. 标注偏差\n\n**API 对账（api.md）：**\n1. 对比设计的接口与实际 Controller\n2. 检查请求/响应 DTO 字段是否一致\n3. 检查权限标识是否正确\n4. 检查错误码是否完整\n5. 标注偏差\n\n输出格式：\n\n## 架构偏差\n| 偏差项 | 设计 | 实际 | 级别 | 说明 |\n|--------|------|------|------|------|\n\n## 数据库偏差\n| 表名 | 字段/索引 | 设计 | 实际 | 级别 |\n|------|---------|------|------|------|\n\n## API 偏差\n| 接口 | 偏差项 | 设计 | 实际 | 级别 |\n|------|--------|------|------|------|\n\n## 偏差汇总\n| 级别 | 数量 |\n|------|------|\n| CRITICAL | n |\n| HIGH | n |\n| MEDIUM | n |\n| LOW | n |\n"
})
```

### 2.2 更新设计文档

对 `design/backend/architecture.md`、`design/backend/database.md`、`design/backend/api.md` 进行覆盖更新，以实际代码为准：

- **architecture.md**：更新模块划分、核心类、数据流描述，使其反映真实实现
- **database.md**：更新表结构、字段、索引，使其反映真实数据库
- **api.md**：更新接口定义、DTO、错误码，使其反映真实 API

使用 Agent 生成更新后的文档内容，然后使用 Edit 工具覆盖更新。

### 2.3 记录偏差

```bash
# 将后端偏差追加到状态文件的 deviations 数组
```

## 确认

AskUserQuestion：
> 后端设计同步完成。
> - 架构偏差：CRITICAL {n} / HIGH {n} / MEDIUM {n} / LOW {n}
> - 数据库偏差：CRITICAL {n} / HIGH {n} / MEDIUM {n} / LOW {n}
> - API 偏差：CRITICAL {n} / HIGH {n} / MEDIUM {n} / LOW {n}
>
> 请选择：
> - **A)** 确认，进入前端设计同步
> - **B)** 查看详细偏差报告

确认后更新 `phases.backendSync = true`。
