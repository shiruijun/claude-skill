---
name: jb-pm-init
description: |
  产品需求初始化。收集需求类型、飞书编号、飞书表格链接，验证ID格式，
  创建 ai-doc/ 目录结构和 state.json。执行完后调用 /jb-pm-pipeline 进入主流程。
triggers:
  - /jb-pm-init
  - 需求初始化
---

# 经贝需求初始化（JB PM Init）

## 功能

- 确认需求类型（FEAT/OPT/BUG/TECH）
- 确认飞书需求编号
- 收集飞书多维表格链接（可选）
- **收集飞书文档链接并读取内容作为输入（可选）**
- 验证需求ID格式
- 创建 `ai-doc/迭代/` 目录结构
- 创建 `.jb-pm-pipeline/` 状态文件（`active.json` + `${TICKET}.json`）

## 需求ID格式

`{类型前缀}-{飞书编号}`

| 类型 | 前缀 | 说明 |
|------|------|------|
| 新功能 | FEAT | 全新功能 |
| 优化 | OPT | 现有功能优化 |
| Bug修复 | BUG | 缺陷修复 |
| 技术债 | TECH | 重构/技术改进 |

示例：`FEAT-D1234`、`BUG-2025-056`

---

## Step 1: 入口判断

### 1.1 检查现有状态

```bash
if [ -f .jb-pm-pipeline/active.json ]; then
  ACTIVE_TICKET=$(cat .jb-pm-pipeline/active.json | python -c "import sys,json; print(json.load(sys.stdin).get('ticketId',''))")
  if [ -n "$ACTIVE_TICKET" ] && [ -f ".jb-pm-pipeline/${ACTIVE_TICKET}.json" ]; then
    cat ".jb-pm-pipeline/${ACTIVE_TICKET}.json"
  else
    echo "NO_STATE"
  fi
else
  echo "NO_STATE"
fi
```

如果状态文件存在且 `status != completed`，询问是否覆盖或继续。

### 1.2 判断输入类型

```bash
INPUT="{用户输入内容}"

# 是否为完整需求ID
if echo "$INPUT" | grep -qE '^(FEAT|OPT|BUG|TECH)-[A-Z0-9-]+$'; then
  echo "TYPE: existing_ticket"
  echo "TICKET: $INPUT"
# 是否为纯飞书编号（无类型前缀）
elif echo "$INPUT" | grep -qE '^[A-Z0-9-]+$'; then
  echo "TYPE: bare_number"
  echo "NUMBER: $INPUT"
else
  echo "TYPE: new_requirement"
  echo "DESC: $INPUT"
fi
```

---

## Step 2: 已有需求处理

`TYPE=existing_ticket`：ID 已完整，只需确认。

AskUserQuestion：

> 需求ID：**{TICKET}**
> 确认使用此ID？

- A) 确认
- B) 重新输入

---

## Step 3: 新需求处理

### 3.1 `TYPE=new_requirement` 或 `TYPE=bare_number`

AskUserQuestion 选择需求类型：

> 需求：{INPUT}
> 请选择类型：

- FEAT — 新功能
- OPT — 优化
- BUG — Bug 修复
- TECH — 技术债/重构

### 3.2 等待飞书编号

如果 `TYPE=bare_number`：编号已提供，跳过此步。

如果 `TYPE=new_requirement`：标记等待状态。

```bash
mkdir -p .jb-pm-pipeline
cat > .jb-pm-pipeline/PENDING.json << EOF
{
  "status": "waiting-number",
  "pendingType": "{选中的类型}",
  "pendingDesc": "{INPUT}"
}
EOF
cat > .jb-pm-pipeline/active.json << EOF
{
  "ticketId": "PENDING"
}
EOF
```

输出：

```
类型已确认：{TYPE}

请直接回复飞书编号（如 D1234），
然后再次调用 /jb-pm-pipeline {编号} 继续。
```

STOP。等待用户回复编号。

### 3.3 继续等待流程

当 `TYPE=resume_waiting`（检测到 PENDING.json 中 status == waiting-number）时：

```bash
TYPE=$(cat .jb-pm-pipeline/PENDING.json | grep -o '"pendingType": "[^"]*"' | cut -d'"' -f4)
NUMBER="{用户输入}"
TICKET="${TYPE}-${NUMBER}"
```

---

## Step 4: 收集飞书文档/表格链接（可选）

AskUserQuestion：

> 是否需要关联飞书文档或表格？

- A) 粘贴飞书文档链接（将作为需求输入，自动读取内容）
- B) 粘贴飞书多维表格链接（仅关联，不读取内容）
- C) 跳过

### 4.1 飞书文档链接

如果选 A：

1. AskUserQuestion 让用户粘贴飞书文档链接
2. 保存到 `LARK_DOC_URL` 变量
3. **判断链接类型，分路径处理**：

#### 链接类型判断

```bash
if echo "$LARK_DOC_URL" | grep -qE '/wiki/[A-Za-z0-9_-]+'; then
  echo "TYPE: wiki"
elif echo "$LARK_DOC_URL" | grep -qE '/docx/[A-Za-z0-9_-]+'; then
  echo "TYPE: docx"
else
  echo "TYPE: unknown"
fi
```

#### 路径 A：Wiki 知识库页面

wiki 链接（如 `https://xxx.feishu.cn/wiki/TOKEN`）的 token 是 wiki **节点 token**，不是文档 token。需要先获取底层的文档 token（obj_token）：

```bash
# 提取 wiki token
WIKI_TOKEN=$(echo "$LARK_DOC_URL" | sed -n 's|.*/wiki/\([A-Za-z0-9_-]*\).*|&1|p')

# 调用 wiki API 获取节点信息（含 obj_token）
lark-cli wiki spaces get_node --params '{"token":"'$WIKI_TOKEN'"}' --format json
```

从返回的 JSON 中读取 `data.node.obj_token`，得到实际的文档 token `OBJ_TOKEN`。

然后调用 `lark-doc` 读取文档内容：

```js
Skill({
  skill: "lark-doc",
  args: "读取飞书文档内容，文档 token 为 {OBJ_TOKEN}，保存到本地文件。"
})
```

#### 路径 B：Docx 文档

docx 链接（如 `https://xxx.feishu.cn/docx/TOKEN`）直接调用 `lark-doc`：

```js
Skill({
  skill: "lark-doc",
  args: "读取飞书文档内容：{LARK_DOC_URL}，保存到本地文件。"
})
```

#### 保存文档内容

无论哪种路径，读取到的内容都使用 Write 工具保存到 `$BASE_DIR/raw-requirement.md`。

如果读取失败（链接无效、无权限、token 解析失败），输出错误提示，不设置 `larkDocUrl` 字段。

### 4.2 飞书多维表格链接

如果选 B：

1. AskUserQuestion 让用户粘贴飞书多维表格链接
2. 保存到 state.json 的 `larkUrl` 字段

### 4.3 跳过

如果选 C，不设置任何链接字段。

---

## Step 5: 校验并创建

### 5.1 校验ID格式

```bash
if ! echo "$TICKET" | grep -qE '^(FEAT|OPT|BUG|TECH)-[A-Z0-9-]+$'; then
  echo "ERROR: 格式错误。要求 FEAT-/OPT-/BUG-/TECH- 开头"
  exit 1
fi
```

### 5.2 AskUserQuestion 确认版本号

> 迭代版本号？（如 v2.3.0）

选项：
- v2.4.0
- v2.3.1
- 其他（自定义输入）

### 5.3 创建目录

```bash
SAFE_TICKET=$(echo "$TICKET" | tr '[:upper:]' '[:lower:]')
SAFE_DESC=$(echo "$DESC" | sed 's/[^a-zA-Z0-9\u4e00-\u9fa5]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
BASE_DIR="ai-doc/迭代/$VERSION/$SAFE_TICKET-$SAFE_DESC"

mkdir -p "$BASE_DIR"
mkdir -p "$BASE_DIR/plans"
mkdir -p .jb-pm-pipeline
```

### 5.4 读取飞书文档内容（如提供了 larkDocUrl）

如果用户提供了 `LARK_DOC_URL`：

```js
Skill({
  skill: "lark-doc",
  args: "读取飞书文档：{LARK_DOC_URL}"
})
```

将读取到的文档内容使用 Write 工具保存到 `$BASE_DIR/raw-requirement.md`。

### 5.5 保存状态

```bash
cat > .jb-pm-pipeline/${TICKET}.json << EOF
{
  "version": "1.0.0",
  "status": "initialized",
  "ticketId": "$TICKET",
  "versionCode": "$VERSION",
  "featureName": "$DESC",
  "baseDir": "$BASE_DIR",
  "larkUrl": "$LARK_URL",
  "larkDocUrl": "$LARK_DOC_URL",
  "hasExternalDoc": "$HAS_EXTERNAL_DOC",
  "phases": {
    "jtbdProblemStatement": false,
    "discoveryProcess": false,
    "customerUnderstanding": false,
    "opportunitySolution": false,
    "pressRelease": false,
    "userStoryMapping": false,
    "prioritization": false,
    "epicBreakdown": false,
    "prdDevelopment": false,
    "prototypeGeneration": false
  }
}
EOF
cat > .jb-pm-pipeline/active.json << EOF
{
  "ticketId": "$TICKET"
}
EOF
```

> `HAS_EXTERNAL_DOC` 为 `"true"` 当且仅当成功读取并保存了 `raw-requirement.md`，否则 `"false"`。

---

## Step 6: 完成提示

输出：

```
✅ 需求初始化完成

需求ID: {TICKET}
目录: {BASE_DIR}

下一步：
→ 调用 /jb-pm-pipeline 进入产品流程
→ 产出 spec.md / ceo-review.md / design-review.md / eng-review.md
```
