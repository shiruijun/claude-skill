# Step 0: 输入解析与状态初始化

## 0.1 检查状态文件

```bash
if [ -f .jb-finish-sync/active.json ]; then
  ACTIVE_TICKET=$(cat .jb-finish-sync/active.json | python -c "import sys,json; print(json.load(sys.stdin).get('ticketId',''))")
  if [ -n "$ACTIVE_TICKET" ] && [ -f ".jb-finish-sync/${ACTIVE_TICKET}.json" ]; then
    cat ".jb-finish-sync/${ACTIVE_TICKET}.json"
  else
    echo "NO_STATE"
  fi
else
  echo "NO_STATE"
fi
```

## 0.2 状态分支处理

### A) NO_STATE

解析用户输入，查找对应的 jb-dev-pipeline 完成状态：

```bash
INPUT="{用户输入内容}"

# 判断是否为目录路径
if [ -d "$INPUT" ]; then
  BASE_DIR="$INPUT"
else
  # 作为飞书编号处理
  if ! echo "$INPUT" | grep -qE '^(FEAT|OPT|BUG|TECH)-[A-Z0-9-]+$'; then
    # 尝试从 jb-dev-pipeline 状态推断前缀
    if [ -f .jb-dev-pipeline/active.json ]; then
      TICKET=$(cat .jb-dev-pipeline/active.json | python -c "import sys,json; print(json.load(sys.stdin).get('ticketId',''))")
    elif [ -f .jb-pm-pipeline/active.json ]; then
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
  BASE_DIR=$(find ai-doc/迭代 -maxdepth 3 -type d -name "${SAFE_TICKET}-*" 2>/dev/null | head -1)
fi
```

### B) 检查 jb-dev-pipeline 是否已完成

```bash
# 读取 jb-dev-pipeline 状态
if [ -f ".jb-dev-pipeline/${TICKET}.json" ]; then
  DEV_STATUS=$(cat ".jb-dev-pipeline/${TICKET}.json" | python -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
  if [ "$DEV_STATUS" != "completed" ]; then
    echo "ERROR: jb-dev-pipeline 尚未完成 (status=$DEV_STATUS)"
    echo "请先完成 jb-dev-pipeline 再执行同步。"
    STOP
  fi
else
  echo "ERROR: 找不到 jb-dev-pipeline 状态文件: .jb-dev-pipeline/${TICKET}.json"
  echo "请确认 jb-dev-pipeline 已执行完成。"
  STOP
fi
```

### C) 验证必要的前置文件

```bash
# 验证目录存在
if [ -z "$BASE_DIR" ]; then
  echo "ERROR: 找不到对应目录。请确认 ticket 编号正确。"
  STOP
fi

# 验证必要文件存在
REQUIRED_FILES=(
  "$BASE_DIR/prd.md"
  "$BASE_DIR/design/backend/architecture.md"
  "$BASE_DIR/design/backend/database.md"
  "$BASE_DIR/design/backend/api.md"
  "$BASE_DIR/design/frontend/architecture.md"
  "$BASE_DIR/design/frontend/components.md"
  "$BASE_DIR/design/frontend/api-integration.md"
  "$BASE_DIR/plans/plan.md"
  "$BASE_DIR/CHANGELOG-impl.md"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "WARNING: 缺少前置文件: $f"
    echo "部分同步功能可能受限，但可以继续执行。"
  fi
done
```

### D) 读取参数

```bash
TICKET_ID=$(basename "$BASE_DIR" | sed 's/^[^-]*-[^-]*-//' | tr '[:lower:]' '[:upper:]')
FEATURE_NAME=$(basename "$BASE_DIR" | sed 's/^[^-]*-[^-]*-[^-]*-//')

# 从目录路径推断版本
VERSION=$(echo "$BASE_DIR" | sed 's|.*/迭代/||' | cut -d'/' -f1)

# 读取 jb-dev-pipeline 的完成报告
DEV_COMPLETION_FILE="$BASE_DIR/README-impl.md"
if [ -f "$DEV_COMPLETION_FILE" ]; then
  DEV_COMPLETION_CONTENT=$(cat "$DEV_COMPLETION_FILE")
fi
```

### E) 创建状态文件

```bash
TICKET_STATE_FILE=".jb-finish-sync/${TICKET_ID}.json"
mkdir -p .jb-finish-sync

cat > "$TICKET_STATE_FILE" << EOF
{
  "version": "1.0.0",
  "status": "initialized",
  "ticketId": "$TICKET_ID",
  "featureName": "$FEATURE_NAME",
  "baseDir": "$BASE_DIR",
  "version": "$VERSION",
  "devCompletionFile": "$DEV_COMPLETION_FILE",
  "phases": {
    "inputCheck": true,
    "prdSync": false,
    "backendSync": false,
    "frontendSync": false,
    "testcaseSync": false,
    "syncReport": false
  },
  "deviations": []
}
EOF

cat > .jb-finish-sync/active.json << EOF
{"ticketId": "$TICKET_ID"}
EOF
```

## 0.3 读取所有输入文档

使用 Read 工具读取以下文件备用：

```
$BASE_DIR/prd.md
$BASE_DIR/design/backend/architecture.md
$BASE_DIR/design/backend/database.md
$BASE_DIR/design/backend/api.md
$BASE_DIR/design/frontend/architecture.md
$BASE_DIR/design/frontend/components.md
$BASE_DIR/design/frontend/api-integration.md
$BASE_DIR/plans/plan.md
$BASE_DIR/CHANGELOG-impl.md
$BASE_DIR/test/case/cases.md (如果存在)
$BASE_DIR/review/code-review-report.md (如果存在)
$BASE_DIR/review/security-review-report.md (如果存在)
```

## 0.4 输出初始信息

```
✅ 同步流水线初始化完成

需求ID: {TICKET_ID}
功能名称: {FEATURE_NAME}
目录: {BASE_DIR}
版本: {VERSION}

jb-dev-pipeline 状态: completed ✅

下一步：
→ 开始 PRD 现状对账
```

进入 Step 1。
