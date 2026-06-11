# Step 0: 输入解析与状态初始化

## 0.0 检测工作区路径

**重要：** 工作区路径因用户环境而异，必须动态检测，禁止硬编码路径。

```bash
# 检测策略（按优先级）：
# 1. 检查当前工作目录是否包含 ai-doc/迭代
# 2. 检查环境变量 WORKSPACE（如设置了）
# 3. 从当前目录向上查找包含 ai-doc/迭代 的目录
# 4. 询问用户提供工作区路径

detect_workspace() {
  # 策略1: 检查当前工作目录
  if [ -d "ai-doc/迭代" ]; then
    pwd
    return 0
  fi

  # 策略2: 检查环境变量
  if [ -n "$WORKSPACE" ] && [ -d "$WORKSPACE/ai-doc/迭代" ]; then
    echo "$WORKSPACE"
    return 0
  fi

  # 策略3: 向上查找包含 ai-doc/迭代 的目录
  current_dir=$(pwd)
  while [ "$current_dir" != "/" ] && [ "$current_dir" != "C:/" ]; do
    if [ -d "$current_dir/ai-doc/迭代" ]; then
      echo "$current_dir"
      return 0
    fi
    current_dir=$(dirname "$current_dir")
  done

  # 未找到，返回空
  echo ""
  return 1
}

# 执行检测
WORKSPACE=$(detect_workspace)

if [ -z "$WORKSPACE" ]; then
  echo "未找到工作区目录（包含 ai-doc/迭代 的目录）"
  echo "请提供您的工作区路径，例如: D:/work"
  # AskUserQuestion 让用户提供工作区路径
  # USER_WORKSPACE = 用户输入
  WORKSPACE="$USER_WORKSPACE"
fi

echo "检测到工作区: $WORKSPACE"
```

## 0.1 解析用户输入

```
INPUT = 用户输入内容

判断输入类型：
1. 迭代版本号（如 v6.8.8、v7.0.0）→ 搜索 {WORKSPACE}/ai-doc/迭代/{version}/ 目录，列出功能供选择
2. 目录路径 → BASE_DIR = INPUT
3. 飞书编号（如 D1234、FEAT-D1234）→ 搜索 {WORKSPACE}/ai-doc/迭代/ 目录
4. 仅数字 → 尝试从 jb-pm-pipeline / jb-td-pipeline 推断前缀
```

### 迭代版本搜索逻辑

```bash
# 输入: v6.8.8 或 v7.0.0
ITERATION_DIR="$WORKSPACE/ai-doc/迭代/$VERSION"

if [ -d "$ITERATION_DIR" ]; then
  # 列出所有功能目录
  FEATURES=($(ls -d "$ITERATION_DIR"/*/ 2>/dev/null))
  FEATURE_COUNT=${#FEATURES[@]}

  if [ $FEATURE_COUNT -eq 0 ]; then
    echo "ERROR: 迭代 $VERSION 下没有功能目录"
    STOP
  fi

  # 显示功能列表供用户选择
  echo "迭代 $VERSION 包含以下功能："
  for i in "${!FEATURES[@]}"; do
    DIR_NAME=$(basename "${FEATURES[$i]}")
    echo "  $((i+1)). $DIR_NAME"
  done

  # AskUserQuestion 让用户选择功能
  # 选择后 BASE_DIR = 选中的功能目录
else
  echo "ERROR: 迭代目录不存在: $ITERATION_DIR"
  STOP
fi
```

### 目录搜索逻辑

```bash
# 尝试多种命名模式
SAFE_TICKET=$(echo "$TICKET" | tr '[:upper:]' '[:lower:]')

# 模式1: feat-{id}-*
BASE_DIR=$(find "$WORKSPACE/ai-doc/迭代" -maxdepth 2 -type d -name "feat-${SAFE_TICKET}-*" 2>/dev/null | head -1)

# 模式2: {type}-{id}-*
if [ -z "$BASE_DIR" ]; then
  BASE_DIR=$(find "$WORKSPACE/ai-doc/迭代" -maxdepth 2 -type d -name "*-${SAFE_TICKET}-*" 2>/dev/null | head -1)
fi

# 模式3: 包含 id 的目录
if [ -z "$BASE_DIR" ]; then
  BASE_DIR=$(find "$WORKSPACE/ai-doc/迭代" -maxdepth 2 -type d -name "*${SAFE_TICKET}*" 2>/dev/null | head -1)
fi
```

## 0.2 分级校验前置文件

### Minimal 级别（必须）

```bash
MINIMAL_FILES=(
  "$BASE_DIR/prd.md"
)

# API 或组件设计至少有一个
if [ -f "$BASE_DIR/design/backend/api.md" ] || [ -f "$BASE_DIR/design/frontend/components.md" ]; then
  HAS_DESIGN=true
else
  echo "ERROR: 缺少设计文档（api.md 或 components.md）"
  STOP
fi
```

### Full 级别（推荐，不强制）

```bash
FULL_FILES=(
  "$BASE_DIR/design/backend/architecture.md"
  "$BASE_DIR/design/backend/database.md"
  "$BASE_DIR/design/backend/api.md"
  "$BASE_DIR/design/frontend/architecture.md"
  "$BASE_DIR/design/frontend/components.md"
  "$BASE_DIR/design/frontend/api-integration.md"
  "$BASE_DIR/plans/plan.md"
)

# 统计可用文件
AVAILABLE=0
MISSING=()
for f in "${FULL_FILES[@]}"; do
  if [ -f "$f" ]; then
    AVAILABLE=$((AVAILABLE + 1))
  else
    MISSING+=("$f")
  fi
done

# 设置级别
if [ $AVAILABLE -eq ${#FULL_FILES[@]} ]; then
  INPUT_LEVEL="full"
else
  INPUT_LEVEL="minimal"
  echo "提示: 部分文件缺失，将以 minimal 级别运行"
  echo "缺失文件: ${MISSING[*]}"
fi
```

## 0.3 增量检测

**检查是否已存在测试用例，决定增量模式还是全量模式。**

```bash
CASES_FILE="$BASE_DIR/test/case/cases.md"

if [ -f "$CASES_FILE" ]; then
  # 已有用例，进入增量模式
  MODE="incremental"

  # 读取已有用例，提取已覆盖的功能点
  # 从 cases.md 中提取所有 "关联需求" 字段
  EXISTING_FEATURES=$(grep -oP '(?<=关联需求\*\* \| ).*?(?= \|)' "$CASES_FILE" | sort -u)

  # 读取已有用例编号，确定起始编号
  LAST_BE=$(grep -oP 'TC-BE-\K\d+' "$CASES_FILE" | sort -n | tail -1)
  LAST_FE=$(grep -oP 'TC-FE-\K\d+' "$CASES_FILE" | sort -n | tail -1)
  LAST_API=$(grep -oP 'TC-API-\K\d+' "$CASES_FILE" | sort -n | tail -1)
  LAST_BB=$(grep -oP 'TC-BB-\K\d+' "$CASES_FILE" | sort -n | tail -1)

  echo "检测到已有测试用例，进入增量模式"
  echo "已有用例编号：BE→$LAST_BE, FE→$LAST_FE, API→$LAST_API, BB→$LAST_BB"
else
  MODE="full"
  LAST_BE=0; LAST_FE=0; LAST_API=0; LAST_BB=0
  echo "未检测到已有用例，全量生成"
fi
```

## 0.4 解析 PRD 功能点清单

从 `prd.md` 中提取所有功能点，用于后续覆盖率计算和增量检测：

```bash
# 使用 Read 工具读取 prd.md 全文
# 提取章节标题作为功能点
# 格式：{"id": "F1", "title": "功能点名称", "covered": false, "testCases": []}

# 提取规则：
# 1. 以 "## " 或 "### " 开头的章节标题
# 2. 包含 "功能"、"需求"、"用户故事" 关键词的段落
# 3. 编号列表（1. 2. 3. 或 - ）

# 使用 Grep 提取：
# 提取章节标题
grep -E "^#{2,3} " "$BASE_DIR/prd.md" | head -50

# 提取功能点描述
grep -E "^(功能|需求|用户故事|作为)" "$BASE_DIR/prd.md" | head -50
```

**增量模式下标记已覆盖功能点：**

```bash
# 如果 MODE == "incremental"，对比 PRD 功能点与已有用例的关联需求
for feature in prdFeatures; do
  if echo "$EXISTING_FEATURES" | grep -q "$feature.title"; then
    feature.covered = true
  fi
done
```

## 0.5 创建状态文件

```bash
TICKET_STATE_FILE=".jb-testcase-pipeline/${TICKET_ID}.json"
mkdir -p "$BASE_DIR/test/case"
mkdir -p .jb-testcase-pipeline

cat > "$TICKET_STATE_FILE" << EOF
{
  "version": "2.0.0",
  "status": "initialized",
  "ticketId": "$TICKET_ID",
  "featureName": "$FEATURE_NAME",
  "baseDir": "$BASE_DIR",
  "workspace": "$WORKSPACE",
  "inputLevel": "$INPUT_LEVEL",
  "mode": "$MODE",
  "availableFiles": {
    "prd": true,
    "backendApi": $(test -f "$BASE_DIR/design/backend/api.md" && echo true || echo false),
    "backendArchitecture": $(test -f "$BASE_DIR/design/backend/architecture.md" && echo true || echo false),
    "backendDatabase": $(test -f "$BASE_DIR/design/backend/database.md" && echo true || echo false),
    "frontendComponents": $(test -f "$BASE_DIR/design/frontend/components.md" && echo true || echo false),
    "frontendArchitecture": $(test -f "$BASE_DIR/design/frontend/architecture.md" && echo true || echo false),
    "frontendApiIntegration": $(test -f "$BASE_DIR/design/frontend/api-integration.md" && echo true || echo false),
    "plan": $(test -f "$BASE_DIR/plans/plan.md" && echo true || echo false)
  },
  "prdFeatures": [],
  "existingCounters": {
    "be": $LAST_BE,
    "fe": $LAST_FE,
    "api": $LAST_API,
    "bb": $LAST_BB
  },
  "phases": {
    "inputCheck": true,
    "generating": false,
    "generated": false,
    "coverageCalculated": false,
    "coveragechecked": false,
    "testdataGenerated": false
  },
  "stats": {
    "backendUnit": 0,
    "frontendUnit": 0,
    "apiIntegration": 0,
    "blackbox": 0,
    "total": 0
  },
  "coverage": {
    "gate": "pending",
    "totalFeatures": 0,
    "coveredFeatures": 0,
    "percentage": 0
  }
}
EOF
```

## 0.6 读取输入文档

根据 `inputLevel` 决定读取哪些文档：

```bash
# 始终读取
Read "$BASE_DIR/prd.md"

# 根据 availableFiles 读取
if [ "$BACKEND_API" = "true" ]; then
  Read "$BASE_DIR/design/backend/api.md"
fi

if [ "$BACKEND_ARCH" = "true" ]; then
  Read "$BASE_DIR/design/backend/architecture.md"
fi

# ... 以此类推
```

## 0.7 更新状态，进入 Step 1

```bash
# 将提取的功能点列表写入状态文件的 prdFeatures 字段
# 每个功能点格式：{"id": "F1", "title": "xxx", "covered": false, "testCases": []}

# 更新 status
status = "initialized" → 准备进入 generating
phases.inputCheck = true

# 输出摘要
echo "✅ 输入校验完成"
echo "   级别: $INPUT_LEVEL"
echo "   模式: $MODE"
echo "   可用文档: $AVAILABLE / ${#FULL_FILES[@]}"
echo "   PRD 功能点: ${#FEATURES[@]} 个"
if [ "$MODE" = "incremental" ]; then
  echo "   已有用例: BE→$LAST_BE, FE→$LAST_FE, API→$LAST_API, BB→$LAST_BB"
fi
echo ""
echo "下一步: 进入 Step 1 生成测试用例"
```
