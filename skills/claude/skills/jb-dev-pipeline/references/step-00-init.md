# Step 0: 输入解析与状态初始化

## 0.1 检查活跃需求状态

```bash
if [ -f .jb-dev-pipeline/active.json ]; then
  ACTIVE_TICKET=$(cat .jb-dev-pipeline/active.json | python -c "import sys,json; print(json.load(sys.stdin).get('ticketId',''))")
  if [ -n "$ACTIVE_TICKET" ] && [ -f ".jb-dev-pipeline/${ACTIVE_TICKET}.json" ]; then
    cat ".jb-dev-pipeline/${ACTIVE_TICKET}.json"
  else
    echo "NO_STATE"
  fi
else
  echo "NO_STATE"
fi
```

## 0.2 解析用户输入

```bash
INPUT="{用户输入内容}"

# 判断是否为目录路径
if [ -d "$INPUT" ]; then
  BASE_DIR="$INPUT"
else
  # 作为飞书编号处理
  if ! echo "$INPUT" | grep -qE '^(FEAT|OPT|BUG|TECH)-[A-Z0-9-]+$'; then
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
  echo "  1. jb-pm-pipeline 和 jb-td-pipeline 已完成"
  echo "  2. 输入的编号正确（如 D1234 或 FEAT-D1234）"
  echo "  3. 或直接提供文件夹路径"
  STOP
fi

# 验证 TD 流水线已完成
if [ ! -f "$BASE_DIR/plans/plan.md" ]; then
  echo "ERROR: 找不到 $BASE_DIR/plans/plan.md。请确认 jb-td-pipeline 已完成。"
  STOP
fi

# 读取信息
TICKET_ID=$(echo "$BASE_DIR" | sed 's/.*\/[^-]*-\([^/]*\)-.*/\1/' | tr '[:lower:]' '[:upper:]')
FEATURE_NAME=$(basename "$BASE_DIR" | sed 's/^[^-]*-[^-]*-//')
```

## 0.3 状态分支处理

```bash
STATE_FILE=".jb-dev-pipeline/${TICKET_ID}.json"

if [ -f "$STATE_FILE" ]; then
  STATUS=$(cat "$STATE_FILE" | python -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
else
  STATUS="NO_STATE"
fi
```

**NO_STATE**：创建新状态文件

```bash
mkdir -p "$BASE_DIR/test"
mkdir -p "$BASE_DIR/review"
mkdir -p "$BASE_DIR/plans"
mkdir -p .jb-dev-pipeline

cat > "$STATE_FILE" << EOF
{
  "version": "1.0.0",
  "status": "initialized",
  "ticketId": "$TICKET_ID",
  "featureName": "$FEATURE_NAME",
  "baseDir": "$BASE_DIR",
  "phases": {
    "planRefinement": false,
    "gitSetup": false,
    "tdd": false,
    "implementation": false,
    "codeReview": false,
    "securityReview": false,
    "buildVerify": false,
    "finish": false
  }
}
EOF

cat > .jb-dev-pipeline/active.json << EOF
{"ticketId": "$TICKET_ID"}
EOF
```

**initialized**：设为活跃需求，正常进入 pipeline

**completed**：AskUserQuestion：

> 需求 `{ticketId} {featureName}` 的编码交付已完成。
>
> - **A)** 开始新的编码交付（输入新 ticket 编号）
> - **B)** 查看已完成报告
> - **C)** 继续当前交付（如有遗漏，回到 initialized 状态）

## 0.4 读取参数

从该需求的专属状态文件读取：`ticketId`、`featureName`、`baseDir`

使用 Read 工具读取：
- `$BASE_DIR/plans/plan.md` — 宏观实施计划
- `$BASE_DIR/design/backend/architecture.md` — 后端架构
- `$BASE_DIR/design/backend/api.md` — API 设计
- `$BASE_DIR/design/frontend/architecture.md` — 前端架构
- `$BASE_DIR/prd.md` — PRD（参考）