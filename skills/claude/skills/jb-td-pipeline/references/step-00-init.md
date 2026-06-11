# Step 0: 输入解析与状态初始化

## 0.1 检查状态文件

```bash
if [ -f .jb-td-pipeline/active.json ]; then
  ACTIVE_TICKET=$(cat .jb-td-pipeline/active.json | python -c "import sys,json; print(json.load(sys.stdin).get('ticketId',''))")
  if [ -n "$ACTIVE_TICKET" ] && [ -f ".jb-td-pipeline/${ACTIVE_TICKET}.json" ]; then
    cat ".jb-td-pipeline/${ACTIVE_TICKET}.json"
  else
    echo "NO_STATE"
  fi
else
  echo "NO_STATE"
fi
```

## 0.2 状态分支处理

### A) NO_STATE / waiting-input

首次使用或等待输入。解析用户输入：

```bash
INPUT="{用户输入内容}"

# 判断是否为目录路径
if [ -d "$INPUT" ]; then
  BASE_DIR="$INPUT"
else
  # 作为飞书编号处理
  if ! echo "$INPUT" | grep -qE '^(FEAT|OPT|BUG|TECH)-[A-Z0-9-]+$'; then
    # 尝试从 jb-pm-pipeline 状态推断前缀
    if [ -f .jb-pm-pipeline/active.json ]; then
      PENDING_TYPE=$(cat .jb-pm-pipeline/active.json | python -c "import sys,json; print(json.load(sys.stdin).get('pendingType','FEAT'))")
      TICKET="${PENDING_TYPE}-${INPUT}"
    else
      TICKET="FEAT-${INPUT}"
    fi
  else
    TICKET="$INPUT"
  fi

  # 在 ai-doc/迭代/ 下搜索匹配的目录
  SAFE_TICKET=$(echo "$TICKET" | tr '[:upper:]' '[:lower:]')
  BASE_DIR=$(find ai-doc/迭代 -maxdepth 2 -type d -name "${SAFE_TICKET}-*" 2>/dev/null | head -1)
fi

# 验证
if [ -z "$BASE_DIR" ]; then
  echo "ERROR: 找不到对应目录。请确认："
  echo "  1. jb-pm-pipeline 已完成"
  echo "  2. 输入的编号正确（如 D1234 或 FEAT-D1234）"
  echo "  3. 或直接提供文件夹路径"
  STOP
fi

PRD_PATH="$BASE_DIR/prd.md"
if [ ! -f "$PRD_PATH" ]; then
  echo "ERROR: 找不到 $PRD_PATH。请确认 jb-pm-pipeline 已完成。"
  STOP
fi

# 读取 PRD 获取 ticketId 和 featureName
TICKET_ID=$(echo "$BASE_DIR" | sed 's/.*\/[^-]*-\([^/]*\)-.*/\1/' | tr '[:lower:]' '[:upper:]')
FEATURE_NAME=$(basename "$BASE_DIR" | sed 's/^[^-]*-[^-]*-//')
```

检查 ticket 状态文件：

```bash
TICKET_STATE_FILE=".jb-td-pipeline/${TICKET_ID}.json"

if [ -f "$TICKET_STATE_FILE" ]; then
  TICKET_STATUS=$(cat "$TICKET_STATE_FILE" | python -c "import sys,json; print(json.load(sys.stdin).get('status','initialized'))")
else
  TICKET_STATUS="NO_STATE"
fi
```

**NO_STATE**：创建新状态文件 + 更新 active.json

```bash
mkdir -p "$BASE_DIR/design/backend"
mkdir -p "$BASE_DIR/design/frontend"
mkdir -p "$BASE_DIR/plans"
mkdir -p .jb-td-pipeline

cat > "$TICKET_STATE_FILE" << EOF
{
  "version": "1.0.0",
  "status": "initialized",
  "ticketId": "$TICKET_ID",
  "featureName": "$FEATURE_NAME",
  "baseDir": "$BASE_DIR",
  "prdPath": "$PRD_PATH",
  "phases": {
    "codegraph": false,
    "brainstorm": false,
    "backendArch": false,
    "backendDetail": false,
    "frontendArch": false,
    "frontendDetail": false,
    "engReview": false,
    "implementationPlan": false
  }
}
EOF

cat > .jb-td-pipeline/active.json << EOF
{"ticketId": "$TICKET_ID"}
EOF
```

**initialized**：更新 active.json，正常进入 pipeline

**completed**：AskUserQuestion：

> 检测到已有完成的技术设计：`{ticketId} {featureName}`
> 请选择：
> - **A)** 开始新的技术设计（保留旧状态，直接输入新 ticket）
> - **B)** 查看已完成文档
> - **C)** 继续当前设计（如有遗漏）

## 0.3 读取参数

从 `.jb-td-pipeline/${ACTIVE_TICKET}.json` 读取：
- `ticketId` — 需求 ID
- `featureName` — 功能名称
- `baseDir` — 文档根目录
- `prdPath` — PRD 文件路径
- `phases` — 各阶段完成状态

使用 Read 工具读取 `prdPath` 指向的 `prd.md`。
