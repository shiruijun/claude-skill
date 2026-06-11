# Step 5: 变更报告生成

> **目标**：汇总所有对账结果，生成 `sync-report.md` 作为变更历史记录。

## 检查

如果 `phases.syncReport == true` 且 `sync-report.md` 已存在：

AskUserQuestion：
> `sync-report.md` 已存在，是否重新生成？
> - **A)** 复用现有报告
> - **B)** 重新生成

## 执行

### 5.1 汇总所有偏差

从状态文件 `.jb-finish-sync/${TICKET_ID}.json` 读取 `deviations` 数组，汇总：

- PRD 偏差
- 后端架构/数据库/API 偏差
- 前端架构/组件/API 偏差
- 测试覆盖率统计

### 5.2 生成变更报告

使用 `references/templates/sync-report.md` 模板，填充以下内容：

```
Agent({
  subagent_type: "general-purpose",
  prompt: "基于以下汇总数据，生成变更报告 sync-report.md。\n\n【需求信息】\n- ticketId: {TICKET_ID}\n- 功能名称: {FEATURE_NAME}\n- 版本: {VERSION}\n- 目录: {BASE_DIR}\n\n【PRD 对账结果】\n- 功能点总数：{n}\n- 已实现：{n}\n- 部分实现：{n}\n- 未实现：{n}\n- CRITICAL/HIGH 偏差：{n}\n\n【后端设计偏差】\n{后端偏差详情}\n\n【前端设计偏差】\n{前端偏差详情}\n\n【测试覆盖率】\n{覆盖率统计}\n\n【CRITICAL 偏差详情（需人工确认）】\n{CRITICAL 偏差列表}\n\n请使用模板生成完整的 sync-report.md，确保：\n1. CRITICAL 偏差高亮显示\n2. 技术债有明确的说明\n3. 偏差分级清晰\n4. 包含可操作的改进建议"
})
```

### 5.3 保存报告

使用 Write 工具保存到 `$BASE_DIR/sync-report.md`。

## 确认

Read 工具读取 `sync-report.md`，AskUserQuestion：
> 变更报告已生成。
>
> 报告摘要：
> - CRITICAL 偏差：{n}（需人工确认）
> - HIGH 偏差：{n}
> - MEDIUM 偏差：{n}
> - LOW 偏差：{n}
> - 技术债：{n} 项
>
> 请选择：
> - **A)** 确认，进入完成阶段
> - **B)** 需要修改报告

确认后更新 `phases.syncReport = true`。
