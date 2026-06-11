# Step 0: 读取状态与初始化

## 0.1 检查状态文件

```bash
if [ -f .jb-pm/state.json ]; then
  cat .jb-pm/state.json
else
  echo "NO_STATE"
fi
```

## 0.2 状态分支处理

读取 `status` 字段，按状态分流：

### A) `NO_STATE`

首次使用。自动调用 `/jb-pm-init` 进行需求类型选择：
```
Skill({
  skill: "jb-pm-init",
  args: "{用户输入内容}"
})
```

调用完成后，状态变为 `waiting-ticket-number`。输出：
```
类型已确认：{TYPE}

请直接回复飞书编号（如 D1234），
然后再次调用 /jb-gm-pipeline {编号} 继续。
```

STOP。

### B) `waiting-ticket-number`

用户已回复飞书编号。参数 `{用户输入内容}` 应为：
- 纯编号（如 `D1234`）→ 自动拼接为 `{pendingType}-{编号}`
- 完整ID（如 `FEAT-D1234`）→ 直接使用

**完成初始化：**

```bash
# 读取等待状态
PENDING_TYPE=$(cat .jb-pm/state.json | python -c "import sys,json; print(json.load(sys.stdin).get('pendingType',''))")
PENDING_DESC=$(cat .jb-pm/state.json | python -c "import sys,json; print(json.load(sys.stdin).get('pendingDesc',''))")

# 判断输入类型
INPUT="{用户输入内容}"
if echo "$INPUT" | grep -qE '^(FEAT|OPT|BUG|TECH)-[A-Z0-9-]+$'; then
  TICKET="$INPUT"
else
  TICKET="${PENDING_TYPE}-${INPUT}"
fi

# 校验
if ! echo "$TICKET" | grep -qE '^(FEAT|OPT|BUG|TECH)-[A-Z0-9-]+$'; then
  echo "ERROR: 格式错误。要求 FEAT-/OPT-/BUG-/TECH- 开头，如 D1234 或 FEAT-D1234"
  STOP
fi
```

AskUserQuestion 确认版本号：

> 迭代版本号？（如 v2.3.0）

### 自动生成需求简称

目录命名格式：`{ticket-id}-{核心功能描述}`

**命名规则：**
- 去掉前缀词："我要在"、"需要在"、"希望在"、"给"、"为"
- 去掉修饰词："系统中"、"里"、"新增"、"添加"
- 保留核心名词和动词

由 Claude 根据 `$PENDING_DESC` 自动精简生成 `FEATURE_NAME`，无需用户确认。

**命名示例：**
- `我要在进销存系统中仓库页面新增导出功能` → `仓库页面导出功能`
- `需要在审批流程中添加转交功能` → `审批流程转交功能`
- `给报表页面新增打印按钮` → `报表页面打印按钮`

```bash
FEATURE_NAME="{自动生成的精简名称}"
```

创建目录并保存状态：

```bash
SAFE_TICKET=$(echo "$TICKET" | tr '[:upper:]' '[:lower:]')
SAFE_DESC=$(echo "$FEATURE_NAME" | sed 's/[^a-zA-Z0-9\u4e00-\u9fa5]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
BASE_DIR="ai-doc/迭代/$VERSION/$SAFE_TICKET-$SAFE_DESC"

mkdir -p "$BASE_DIR"
mkdir -p "$BASE_DIR/plans"
mkdir -p .jb-pm

cat > .jb-pm/state.json << EOF
{
  "version": "1.0.0",
  "status": "initialized",
  "ticketId": "$TICKET",
  "versionCode": "$VERSION",
  "featureName": "$FEATURE_NAME",
  "baseDir": "$BASE_DIR",
  "larkUrl": "",
  "phases": {
    "officeHours": false,
    "ceoReview": false,
    "designReview": false,
    "engReview": false,
    "autoplan": false,
    "implementation": false,
    "codeReview": false,
    "qaVerification": false,
    "ship": false,
    "deploy": false,
    "documentRelease": false
  }
}
EOF
```

然后继续 0.3 读取参数。

### C) `completed`

上一个需求已完成。AskUserQuestion：

> 检测到已有完成的需求：`{ticketId} {featureName}`
> 是否开始新需求？

- A) 开始新需求（覆盖当前状态）
- B) 查看已完成文档
- C) 继续当前需求（如有遗漏）

**选 A**：删除 state.json，回到 A) 流程自动调用 `/jb-pm-init`。

**选 B**：用 Read 工具读取 `$BASE_DIR/README.md` 展示给用户，然后再次询问。

**选 C**：更新 `status = initialized`，继续 pipeline。

### D) `initialized`

正常进入 pipeline 流程。

## 0.3 读取参数

从 state.json 读取：
- `ticketId` — 需求ID（如 FEAT-D1234）
- `versionCode` — 迭代版本
- `featureName` — 功能名称
- `baseDir` — 文档目录
- `phases` — 各阶段完成状态
- `larkUrl` — 飞书表格链接（如有）
