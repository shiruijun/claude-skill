# Step 0: 状态读取与初始化

> **平台兼容性**：以下脚本以 bash 语法为主，依赖 `python` 处理 JSON。Windows 用户请确保在 Git Bash 或 WSL 环境中执行，或改用等效的 PowerShell/Python 命令。

## 0.1 读取活跃 Ticket

```bash
if [ -f .jb-pm-pipeline/active.json ]; then
  ACTIVE_TICKET=$(cat .jb-pm-pipeline/active.json | python -c "import sys,json; print(json.load(sys.stdin).get('ticketId',''))")
  if [ -n "$ACTIVE_TICKET" ] && [ -f ".jb-pm-pipeline/${ACTIVE_TICKET}.json" ]; then
    cat ".jb-pm-pipeline/${ACTIVE_TICKET}.json"
  else
    echo "NO_STATE"
  fi
else
  TICKET_FILE=$(ls .jb-pm-pipeline/*.json 2>/dev/null | grep -v '/active.json$' | head -1)
  if [ -n "$TICKET_FILE" ]; then
    cat "$TICKET_FILE"
  else
    echo "NO_STATE"
  fi
fi
```

## 0.2 状态分支处理

### A) `NO_STATE`

首次使用。自动调用 `/jb-pm-init`：

```js
Skill({ skill: "jb-pm-init", args: "{用户输入内容}" })
```

调用完成后状态变为 `waiting-ticket-number`。输出：

```
类型已确认：{TYPE}

请直接回复飞书编号（如 D1234），
然后再次调用 /jb-pm-pipeline {编号} 继续。
```

> **流程终止** — 等待用户回复编号后重新触发 `/jb-pm-pipeline`。

### B) `waiting-ticket-number`

用户已回复飞书编号：
- 纯编号（如 `D1234`）→ 自动拼接为 `{pendingType}-{编号}`
- 完整ID（如 `FEAT-D1234`）→ 直接使用

```bash
ACTIVE_TICKET=$(cat .jb-pm-pipeline/active.json | python -c "import sys,json; print(json.load(sys.stdin).get('ticketId',''))")
PENDING_TYPE=$(cat ".jb-pm-pipeline/${ACTIVE_TICKET}.json" | python -c "import sys,json; print(json.load(sys.stdin).get('pendingType',''))")
PENDING_DESC=$(cat ".jb-pm-pipeline/${ACTIVE_TICKET}.json" | python -c "import sys,json; print(json.load(sys.stdin).get('pendingDesc',''))")

INPUT="{用户输入内容}"
if echo "$INPUT" | grep -qE '^(FEAT|OPT|BUG|TECH)-[A-Z0-9-]+$'; then
  TICKET="$INPUT"
else
  TICKET="${PENDING_TYPE}-${INPUT}"
fi

if ! echo "$TICKET" | grep -qE '^(FEAT|OPT|BUG|TECH)-[A-Z0-9-]+$'; then
  echo "ERROR: 格式错误。要求 FEAT-/OPT-/BUG-/TECH- 开头，如 D1234 或 FEAT-D1234"
  exit 1
fi
```

AskUserQuestion 确认版本号：
> 迭代版本号？（如 v2.3.0）
> - v2.4.0
> - v2.3.1
> - 其他（自定义输入）

> **变量注入说明**：`VERSION`（用户选择的版本号）和 `FEATURE_NAME`（Claude 根据 `$PENDING_DESC` 自动精简）由 Claude 在执行时注入，非 bash 环境变量。

自动生成需求简称（无需用户确认）：

| 原始描述 | 生成的 FEATURE_NAME |
|---------|-------------------|
| 我要在进销存系统中仓库页面新增导出功能 | 仓库页面导出功能 |
| 需要在审批流程中添加转交功能 | 审批流程转交功能 |
| 给报表页面新增打印按钮 | 报表页面打印按钮 |

---

### B.1 复杂度推断

基于需求类型和描述，自动推断复杂度：

**推断规则**：

| 维度 | 信号 | 推断结果 |
|------|------|---------|
| 类型 | BUG / TECH | **简单** (light) |
| 类型 | OPT | **中等** (standard) |
| 类型 | FEAT + 描述 < 30 字 | **中等** (standard) |
| 类型 | FEAT + 描述 ≥ 30 字 | **中等或复杂** (standard/full，需进一步判断) |
| 关键词 | 修复、按钮、字段、文案、报错 | **简单** |
| 关键词 | 新增、优化、流程、模块、筛选 | **中等** |
| 关键词 | 系统、平台、重构、架构、全链路 | **复杂** |

AskUserQuestion 展示推断结果并确认：

> 📊 复杂度推断：**{complexity}**
> 理由：{推断理由}
> 
> 对应流程：{steps}
> - 简单：Problem Statement → User Story → PRD
> - 中等：JTBD → Discovery → Persona → User Story Map → Prioritization → Epic → PRD
> - 复杂：完整 10 步产品发现流程
> 
> 确认吗？
> - A) 确认，开始执行
> - B) 改为简单
> - C) 改为中等
> - D) 改为复杂

确认后 `COMPLEXITY` 变量确定，进入创建状态文件流程。

---

创建目录并保存状态（使用 python 跨平台生成 JSON）：

```bash
SAFE_TICKET=$(echo "$TICKET" | tr '[:upper:]' '[:lower:]')
SAFE_DESC=$(echo "$FEATURE_NAME" | sed 's/[^a-zA-Z0-9\u4e00-\u9fa5]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
BASE_DIR="ai-doc/迭代/$VERSION/$SAFE_TICKET-$SAFE_DESC"

mkdir -p "$BASE_DIR"
mkdir -p .jb-pm-pipeline

python -c "
import json, os, getpass, datetime

complexity = '$COMPLEXITY'

if complexity == 'light':
    phases = {
        'problemStatement': False,
        'userStoryMapping': False,
        'prioritization': False,
        'epicBreakdown': False,
        'prdDevelopment': False
    }
elif complexity == 'standard':
    phases = {
        'jtbdProblemStatement': False,
        'discoveryProcess': False,
        'customerUnderstanding': False,
        'userStoryMapping': False,
        'prioritization': False,
        'epicBreakdown': False,
        'prdDevelopment': False
    }
else:  # full
    phases = {
        'jtbdProblemStatement': False,
        'discoveryProcess': False,
        'customerUnderstanding': False,
        'opportunitySolution': False,
        'pressRelease': False,
        'userStoryMapping': False,
        'prioritization': False,
        'epicBreakdown': False,
        'prdDevelopment': False,
        'prototypeGeneration': False
    }

state = {
    'version': '1.0.0',
    'status': 'initialized',
    'ticketId': '$TICKET',
    'versionCode': '$VERSION',
    'featureName': '$FEATURE_NAME',
    'complexity': complexity,
    'author': getpass.getuser(),
    'createdAt': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
    'baseDir': '$BASE_DIR',
    'larkDocUrl': '$LARK_DOC_URL',
    'hasExternalDoc': bool('$LARK_DOC_URL'),
    'phases': phases
}

with open('.jb-pm-pipeline/$TICKET.json', 'w', encoding='utf-8') as f:
    json.dump(state, f, ensure_ascii=False, indent=2)

with open('.jb-pm-pipeline/active.json', 'w', encoding='utf-8') as f:
    json.dump({'ticketId': '$TICKET'}, f, ensure_ascii=False, indent=2)

print('初始化完成:', '$BASE_DIR')
"
```

### C) `completed`

上一个需求已完成。AskUserQuestion：
> 检测到已有完成的需求：`{ticketId} {featureName}`
> 是否开始新需求？
> - A) 开始新需求
> - B) 查看已完成文档
> - C) 继续当前需求（如有遗漏）

- **选 A**：保留原 ticket 文件，回到 A) 流程自动调用 `/jb-pm-init`
- **选 B**：Read 工具读取 `$BASE_DIR/README.md`，然后再次询问
- **选 C**：更新对应 ticket 状态文件 `status = initialized` + 更新 active.json，继续 pipeline

### D) `initialized`

正常进入 pipeline 流程。先解析用户输入得到 TICKET：
- 存在 `.jb-pm-pipeline/${TICKET}.json` → 更新 active.json 指向该 ticket
- 不存在 → 视为新需求，创建新状态文件 + 更新 active.json

## 0.3 读取参数

从 active.json 获取当前 ticket，再读取对应 ticket 状态文件：
- `ticketId` — 需求ID
- `versionCode` — 迭代版本
- `featureName` — 功能名称
- `author` — 创建者（自动获取系统用户名）
- `createdAt` — 创建时间（初始化时自动生成）
- `baseDir` — 文档目录
- `larkDocUrl` — 飞书文档链接（如有）
- `hasExternalDoc` — 是否有外部需求文档
- `additionalContext` — 用户补充信息（Step 1 收集）
- `phases` — 各阶段完成状态

## 0.4 加载上下文信息

### A) 外部需求文档

如果 `hasExternalDoc == true` 且 `$BASE_DIR/raw-requirement.md` 存在：

```bash
python -c "
with open('$BASE_DIR/raw-requirement.md', 'r', encoding='utf-8') as f:
    content = f.read()
print('EXTERNAL_DOC_LOADED')
print(content)
"
```

将读取到的内容保存到变量 `EXTERNAL_DOC` 中。

### B) 用户补充信息

从 ticket 状态文件读取 `additionalContext`，保存到变量 `ADDITIONAL_CONTEXT` 中。如果存在，同时读取 `$BASE_DIR/additional-context.md`。

### C) 统一上下文注入规则

后续各 Step 的 skill 调用时，**自动将上述内容作为附加上下文注入**，优先级：

```
EXTERNAL_DOC（外部需求文档）
ADDITIONAL_CONTEXT（用户补充信息）
```

> **注入模板**：在每个 Step 调用子 skill 时，在 args 末尾追加：
> ```
> \n\n---
> 📎 **外部需求文档参考**（来自 {larkDocUrl}）：
> {EXTERNAL_DOC 前 2000 字}
>
> 📎 **用户补充信息**：
> {ADDITIONAL_CONTEXT 前 1500 字}
> ```
>
> 如果任一文档超过字数限制，优先取前 N 字，并在末尾注明"（内容较长，以上为前 N 字）"。
>
> 如果 `ADDITIONAL_CONTEXT` 为空，则只注入 `EXTERNAL_DOC`。
