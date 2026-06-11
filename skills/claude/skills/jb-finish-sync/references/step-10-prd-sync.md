# Step 1: PRD 现状对账

> **目标**：检查 PRD 中声明的功能点是否在代码中实现，更新 prd.md 中的功能点状态。

## 检查

如果 `phases.prdSync == true` 且 `prd.md` 已有 `## 实现状态` 章节：

AskUserQuestion：
> `prd.md` 已同步过，复用还是重新对账？
> - **A)** 复用
> - **B)** 重新对账

## 执行

### 1.1 提取 PRD 功能点清单

启动 Agent 分析 PRD，提取所有功能点：

```
Agent({
  subagent_type: "general-purpose",
  prompt: "从以下 PRD 文档中提取所有功能点/需求条目清单。\n\n要求：\n1. 提取每个独立的功能点（Feature）作为一行\n2. 每个功能点包含：编号、名称、描述、验收标准\n3. 格式：\n   - FP-001: {功能名称} — {一句话描述} — 验收标准：{验收标准}\n4. 忽略非功能需求（性能、安全、兼容性等），只关注业务功能点\n\nPRD 文档：\n{prd.md 全文}\n\n输出：完整的功能点清单列表，只输出列表，不要其他内容。"
})
```

### 1.2 扫描代码实现

基于 CHANGELOG-impl.md 识别本次代码变更涉及的文件，然后检查每个功能点是否有对应实现：

```
Agent({
  subagent_type: "general-purpose",
  prompt: "基于以下代码变更记录和功能点清单，分析每个功能点是否在代码中有对应实现。\n\n功能点清单：\n{功能点清单}\n\n代码变更文件列表（CHANGELOG-impl.md）：\n{CHANGELOG-impl.md 全文}\n\n后端代码（关键文件）：\n{design/backend/architecture.md 摘要}\n{design/backend/api.md 摘要}\n\n前端代码（关键文件）：\n{design/frontend/architecture.md 摘要}\n{design/frontend/components.md 摘要}\n\n要求：\n1. 对每个功能点，判断：\n   - ✅ 已实现（代码中有明确的业务逻辑对应）\n   - ⚠️ 部分实现（代码中有但不完整或与设计有偏差）\n   - ❌ 未实现（代码中无对应业务逻辑）\n   - N/A 不适用（本次开发不涉及）\n2. 对每个\"已实现\"或\"部分实现\"的功能点，标注对应的代码文件/类/方法\n3. 识别 CRITICAL/HIGH 级别的偏差（实现与设计严重不符）\n\n输出格式：\n## 功能点对账结果\n| 功能点 | 状态 | 对应代码 | 偏差级别 | 说明 |\n|--------|------|---------|---------|------|\n\n## 偏差清单（仅 CRITICAL/HIGH）\n| 功能点 | 偏差描述 | 建议处理 |\n|--------|---------|---------|\n"
})
```

### 1.3 更新 prd.md

在 `prd.md` 末尾追加 `## 实现状态` 章节（不修改原有内容）：

```markdown
## 实现状态

> 以下内容由 jb-finish-sync 自动生成，基于 {DATE} 的代码对账结果。

### 功能点实现情况

| 功能点 | 状态 | 实现说明 | 对应代码 |
|--------|------|---------|---------|
| FP-001 | ✅ 已实现 | ... | ... |
| FP-002 | ⚠️ 部分实现 | ... | ... |
| FP-003 | ❌ 未实现 | ... | ... |

### 验收标准达成情况

| 验收标准 | 达成状态 | 说明 |
|---------|---------|------|
| ... | ✅/❌ | ... |

### 已知偏差

> 以下偏差已被记录，需要人工评审确认。

- **[CRITICAL]** {偏差描述}
- **[HIGH]** {偏差描述}
```

### 1.4 记录偏差到状态文件

```bash
# 将对账发现的偏差追加到状态文件
TICKET_STATE_FILE=".jb-finish-sync/${TICKET_ID}.json"

# 读取现有 deviations
EXISTING_DEVIATIONS=$(cat "$TICKET_STATE_FILE" | python -c "import sys,json; print(json.load(sys.stdin).get('deviations',[]))")

# 追加新偏差
NEW_DEVIATIONS='[{...}]'  # 从 Agent 输出提取

cat > "$TICKET_STATE_FILE" << EOF
{
  ...,
  "deviations": $EXISTING_DEVIATIONS + $NEW_DEVIATIONS
}
EOF
```

## 确认

AskUserQuestion：
> PRD 对账完成。
> - 功能点总数：{n}
> - 已实现：{n} | 部分实现：{n} | 未实现：{n}
> - CRITICAL/HIGH 偏差：{n}
>
> 请选择：
> - **A)** 确认，进入后端设计同步
> - **B)** 查看详细对账结果

确认后更新 `phases.prdSync = true`。
