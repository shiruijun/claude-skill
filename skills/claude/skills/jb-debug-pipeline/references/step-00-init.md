# Step 0: 输入解析与状态初始化

## 0.1 检查活跃 Bug 状态

```bash
if [ -f .jb-debug-pipeline/active.json ]; then
  ACTIVE_BUG=$(cat .jb-debug-pipeline/active.json | python -c "import sys,json; print(json.load(sys.stdin).get('bugId',''))")
  if [ -n "$ACTIVE_BUG" ] && [ -f ".jb-debug-pipeline/${ACTIVE_BUG}.json" ]; then
    cat ".jb-debug-pipeline/${ACTIVE_BUG}.json"
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
  # 作为飞书编号或 Bug ID 处理
  if ! echo "$INPUT" | grep -qE '^(BUG|FEAT|OPT|TECH)-[A-Z0-9-]+$'; then
    if [ -f .jb-pm-pipeline/active.json ]; then
      PENDING_TYPE=$(cat .jb-pm-pipeline/active.json | python -c "import sys,json; print(json.load(sys.stdin).get('pendingType','BUG'))")
      BUG_ID="${PENDING_TYPE}-${INPUT}"
    else
      BUG_ID="BUG-${INPUT}"
    fi
  else
    BUG_ID="$INPUT"
  fi

  # 在 ai-doc/bugfix/ 下搜索匹配的目录
  SAFE_BUG_ID=$(echo "$BUG_ID" | tr '[:upper:]' '[:lower:]')
  BASE_DIR=$(find ai-doc/bugfix -maxdepth 2 -type d -name "${SAFE_BUG_ID}-*" 2>/dev/null | head -1)
fi

# 验证
if [ -z "$BASE_DIR" ]; then
  echo "ERROR: 找不到对应目录。请确认："
  echo "  1. 输入的 Bug 编号正确（如 B1234 或 BUG-B1234）"
  echo "  2. 或直接提供文件夹路径"
  echo "  3. 如果目录不存在，将自动创建"
  
  # 自动创建目录
  if [ -n "$BUG_ID" ]; then
    SAFE_BUG_ID=$(echo "$BUG_ID" | tr '[:upper:]' '[:lower:]')
    BASE_DIR="ai-doc/bugfix/${SAFE_BUG_ID}-$(date +%Y%m%d)"
    mkdir -p "$BASE_DIR"
    echo "已自动创建目录: $BASE_DIR"
  else
    STOP
  fi
fi

# 读取信息
BUG_ID=$(echo "$BASE_DIR" | sed 's/.*\/[^-]*-\([^/]*\)-.*/\1/' | tr '[:lower:]' '[:upper:]')
BUG_NAME=$(basename "$BASE_DIR" | sed 's/^[^-]*-[^-]*-//')
```

## 0.3 状态分支处理

```bash
STATE_FILE=".jb-debug-pipeline/${BUG_ID}.json"

if [ -f "$STATE_FILE" ]; then
  STATUS=$(cat "$STATE_FILE" | python -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
else
  STATUS="NO_STATE"
fi
```

**NO_STATE**：创建新状态文件

```bash
mkdir -p "$BASE_DIR/reproduce"
mkdir -p "$BASE_DIR/analysis"
mkdir -p "$BASE_DIR/test"
mkdir -p "$BASE_DIR/review"
mkdir -p "$BASE_DIR/deploy"
mkdir -p "$BASE_DIR/plans"
mkdir -p .jb-debug-pipeline

cat > "$STATE_FILE" << EOF
{
  "version": "1.0.0",
  "status": "initialized",
  "bugId": "$BUG_ID",
  "bugName": "$BUG_NAME",
  "baseDir": "$BASE_DIR",
  "phases": {
    "bugReproduction": false,
    "hotfixBranchSetup": false,
    "rootCauseAnalysis": false,
    "fixDesign": false,
    "tddFix": false,
    "codeReview": false,
    "regressionTest": false,
    "finish": false
  }
}
EOF

cat > .jb-debug-pipeline/active.json << EOF
{"bugId": "$BUG_ID"}
EOF
```

**initialized**：设为活跃 Bug，正常进入 pipeline

**completed**：AskUserQuestion：

> Bug `{bugId} {bugName}` 的修复已完成。
>
> - **A)** 开始新的 Bug 修复（输入新 Bug 编号）
> - **B)** 查看已完成报告
> - **C)** 继续当前修复（如有遗漏，回到 initialized 状态）

## 0.4 读取参数

从该 Bug 的专属状态文件读取：`bugId`、`bugName`、`baseDir`

使用 Read 工具读取（如存在）：
- `$BASE_DIR/bug-info.md` — Bug 描述、复现步骤、截图等
- `$BASE_DIR/reproduce/bug-reproduction-report.md` — 复现报告
- `$BASE_DIR/analysis/root-cause-analysis.md` — 根因分析报告
