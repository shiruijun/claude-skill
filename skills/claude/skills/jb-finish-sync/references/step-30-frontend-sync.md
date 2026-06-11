# Step 3: 前端设计同步

> **目标**：对比前端技术设计文档（architecture.md、components.md、api-integration.md）与实际代码，确保文档反映真实实现。

## 检查

如果 `phases.frontendSync == true` 且设计文档已覆盖更新过：

AskUserQuestion：
> 前端设计已同步过，复用还是重新对账？
> - **A)** 复用
> - **B)** 重新对账

## 执行

### 3.1 分析代码变更范围

启动 Agent 分析前端代码变更：

```
Agent({
  subagent_type: "code-reviewer",
  prompt: "作为前端代码审查专家，分析以下前端设计文档与实际代码的偏差。\n\n【设计文档 - 前端架构】\n{design/frontend/architecture.md 全文}\n\n【设计文档 - 组件设计】\n{design/frontend/components.md 全文}\n\n【设计文档 - API 集成】\n{design/frontend/api-integration.md 全文}\n\n【后端 API 设计（参考）】\n{design/backend/api.md 摘要}\n\n【代码变更记录】\n{CHANGELOG-impl.md 全文}\n\n【项目前端规范】\n- jingbei-h5：Vue 3 + Vite + TypeScript + Vant 4 + Pinia\n- xiaogj-youli-platform-web：Vue 2.7 + Vite + Element UI + Vuex\n- xiaogj-youli-manage-frontend：Vue 3 + Vite + TypeScript + Ant Design Vue\n- xiaogj-youli-inventory-frontend：Vue 3 + Vite + TypeScript + Less + Arco Design Vue\n\n要求：\n\n**架构对账（architecture.md）：**\n1. 检查页面结构是否与设计一致\n2. 检查路由设计是否正确实现\n3. 检查状态管理（Store）结构是否正确\n4. 检查组件拆分是否合理\n5. 标注偏差\n\n**组件对账（components.md）：**\n1. 对比设计的组件与实际实现\n2. 检查 Props/Emits/Slots 是否与设计一致\n3. 检查组件路径和命名是否规范\n4. 标注偏差\n\n**API 集成对账（api-integration.md）：**\n1. 检查 API 模块映射是否正确\n2. 检查请求封装是否规范（FetchService）\n3. 检查 Token 管理和错误处理是否正确\n4. 检查 Loading 状态和数据缓存策略\n5. 标注偏差\n\n输出格式：\n\n## 架构偏差\n| 偏差项 | 设计 | 实际 | 级别 | 说明 |\n|--------|------|------|------|------|\n\n## 组件偏差\n| 组件 | 偏差项 | 设计 | 实际 | 级别 |\n|------|--------|------|------|------|\n\n## API 集成偏差\n| API 模块 | 偏差项 | 设计 | 实际 | 级别 |\n|---------|--------|------|------|------|\n\n## 偏差汇总\n| 级别 | 数量 |\n|------|------|\n| CRITICAL | n |\n| HIGH | n |\n| MEDIUM | n |\n| LOW | n |\n"
})
```

### 3.2 更新设计文档

对 `design/frontend/architecture.md`、`design/frontend/components.md`、`design/frontend/api-integration.md` 进行覆盖更新，以实际代码为准。

使用 Agent 生成更新后的文档内容，然后使用 Edit 工具覆盖更新。

### 3.3 记录偏差

```bash
# 将前端偏差追加到状态文件的 deviations 数组
```

## 确认

AskUserQuestion：
> 前端设计同步完成。
> - 架构偏差：CRITICAL {n} / HIGH {n} / MEDIUM {n} / LOW {n}
> - 组件偏差：CRITICAL {n} / HIGH {n} / MEDIUM {n} / LOW {n}
> - API 集成偏差：CRITICAL {n} / HIGH {n} / MEDIUM {n} / LOW {n}
>
> 请选择：
> - **A)** 确认，进入测试用例同步
> - **B)** 查看详细偏差报告

确认后更新 `phases.frontendSync = true`。
