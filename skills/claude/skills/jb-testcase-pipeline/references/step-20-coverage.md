# Step 2: 覆盖率计算 + 评审确认

## 检查

如果 `phases.coverageCalculated == true`：

跳过本步骤，直接进入 Step 3。

## 执行

### 2.1 提取 PRD 功能点清单

从状态文件读取 `prdFeatures`（Step 0 已提取并写入）：

```bash
# prdFeatures 格式：
# [
#   {"id": "F1", "title": "功能点名称", "covered": false, "testCases": []},
#   {"id": "F2", "title": "功能点名称", "covered": false, "testCases": []},
#   ...
# ]

# 统计功能点数量
TOTAL_FEATURES=$(cat "$TICKET_STATE_FILE" | python -c "import sys,json; print(len(json.load(sys.stdin).get('prdFeatures',[])))")
```

### 2.2 结构化 checklist 对比（替代 Agent 自评）

**不再启动独立的覆盖率 Agent。改为脚本化逐条比对。**

```bash
# 从 cases.md 提取所有"关联需求"字段
# 每条用例的 "关联需求" 字段包含其覆盖的 PRD 功能点描述

CASES_FILE="$BASE_DIR/test/case/cases.md"

# 提取所有用例的关联需求
COVERED_KEYWORDS=$(grep -oP '(?<=关联需求\*\* \| ).*?(?= \|)' "$CASES_FILE" 2>/dev/null | sort -u)

# 逐个功能点比对
for feature in prdFeatures; do
  # 检查该功能点的标题是否出现在任一用例的关联需求中
  if echo "$COVERED_KEYWORDS" | grep -qi "$feature.title"; then
    feature.covered = true
    # 找到引用该功能点的用例编号
    MATCHED_CASES=$(grep -B5 "$feature.title" "$CASES_FILE" | grep -oP 'TC-[A-Z]+-\d+' | sort -u)
    feature.testCases = [$MATCHED_CASES]
  else
    feature.covered = false
  fi
done

# 统计覆盖率
COVERED_COUNT=$(prdFeatures 中 covered==true 的数量)
PERCENTAGE=$((COVERED_COUNT * 100 / TOTAL_FEATURES))
```

### 2.3 门禁判定

| 覆盖率 | 判定 | 处理 |
|--------|------|------|
| ≥ 90% | 优秀 | 直接通过，显示统计 |
| 80%-89% | 合格 | 通过，建议补充 |
| 60%-79% | 不合格 | 自动补充缺失用例 |
| < 60% | 严重不足 | 重新生成 |

#### A) 门禁通过（≥ 80%）

AskUserQuestion：

> **门禁通过** — 需求覆盖率 {percentage}%
>
> 覆盖率统计：
> - PRD 功能点总数：{total} 个
> - 已覆盖功能点：{covered} 个
> - 未覆盖功能点：{uncovered} 个
>
> 未覆盖功能点清单：
> {列出所有未覆盖的功能点}
>
> 请选择：
> - **A)** 接受，进入测试数据生成
> - **B)** 补充缺失用例（自动）

#### B) 门禁不合格（60%-79%）

自动触发补充：

> **门禁不合格** — 需求覆盖率 {percentage}%（低于 80%）
>
> 自动补充以下未覆盖功能点的测试用例：
> - {功能点 1}
> - {功能点 2}
> - ...
>
> 正在生成补充用例...

启动补充 Agent（并行 BE+FE+API，然后串行 BB），在 prompt 中附加：

> **必须补充以下未覆盖功能点的测试用例：**
> {uncoveredFeatures 列表}
>
> 已有用例编号从 TC-XX-{existing_max} 开始接续。

#### C) 门禁严重不足（< 60%）

> **门禁严重不足** — 需求覆盖率 {percentage}%
>
> 建议重新生成完整测试用例。
>
> 请选择：
> - **A)** 重新生成（回到 Step 1）
> - **B)** 仅补充缺失功能点

## 更新状态

```bash
# 更新 prdFeatures 中的 covered 状态
# 更新覆盖率信息
cat > "$TICKET_STATE_FILE" << EOF
{
  "prdFeatures": [...],
  "coverage": {
    "gate": "pass/fail/pending",
    "totalFeatures": $TOTAL,
    "coveredFeatures": $COVERED,
    "percentage": $PERCENTAGE
  },
  "phases": {
    "coverageCalculated": true,
    "coveragechecked": true
  }
}
EOF
```

## 输出

```
✅ 覆盖率计算完成

📊 覆盖率报告：
- 总功能点：{total} 个
- 已覆盖：{covered} 个
- 覆盖率：{percentage}%
- 门禁状态：{通过/失败}

{如门禁失败，显示未覆盖功能点清单}
```

进入 Step 3。
