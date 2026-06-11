# Step 9.5: 原型页面生成（Prototype Generation）

## 9.5.1 检查是否已完成

如果 `phases.prototypeGeneration == true` 且 `$BASE_DIR/prototype/` 目录存在：

AskUserQuestion：
> prototype/ 目录已存在，复用还是重新生成？
> - A) 复用现有原型
> - B) 重新生成

## 9.5.2 判断是否跳过

**自动跳过条件**（满足任一即跳过）：
- 需求类型为 `BUG` 或 `TECH`（无前端界面需求）
- PRD 第 6 节"界面与交互"为空、仅含"无"或不存在
- 用户选择"跳过原型生成"

**跳过处理**：更新 `phases.prototypeGeneration = true`，直接进入 Step 10。

## 9.5.3 询问用户

在 Step 9 的 PRD 确认之后，AskUserQuestion：

> PRD 已确认。是否需要生成低保真产品原型页面？
> - A) 生成原型页面（基于 PRD 的界面与交互要求）
> - B) 跳过（进入完成步骤）

选 B → 跳过处理。

## 9.5.4 准备输入

1. 读取 `$BASE_DIR/prd.md`，提取以下信息：

| 字段 | 来源 | 用途 |
|------|------|------|
| 功能名称 | `featureName` | 页面标题 |
| 版本号 | `versionCode` | 原型版本标注 |
| 界面与交互 | prd.md 第 6 节 | 核心设计输入 |
| 用户故事 | prd.md 第 5 节（筛选含 UI 的） | 交互流程参考 |
| 背景与目标 | prd.md 第 1 节 | 风格方向参考 |

2. 读取原型模板文件：
```bash
cat ~/.claude/skills/jb-pm-pipeline/references/templates/prototype-base.html
```
将模板内容作为 `${prototypeBaseHtml}` 传入 `/frontend-design` 的 prompt。

## 9.5.5 调用 /frontend-design

```js
Skill({
  skill: "frontend-design",
  args: `请基于以下经贝管家 PC 端原型基础模板，生成新功能的低保真产品原型页面。

## 基础模板（保留完整结构，只替换内容区）
${prototypeBaseHtml}

## 基本信息
- 功能名称：${featureName}
- 版本：${versionCode}
- 需求ID：${ticketId}

## PRD 中的界面与交互要求
${prdSection6}

## 涉及前端交互的用户故事
${prdSection5_UI_Stories}

## 外部需求文档参考
${EXTERNAL_DOC}

## 设计要求
1. **保持模板框架不变**：侧边栏菜单、顶部导航、整体布局、CSS 变量和组件类名必须与模板完全一致
2. **只替换内容区**：仅修改 <!-- CONTENT_START --> 到 <!-- CONTENT_END --> 之间的区域，实现 PRD 中的界面与交互
3. **菜单高亮**：当前功能所属的菜单项必须标记为 active 状态（通过添加 class="active" 或调用 setActiveMenu()）
4. **页面标题和标签**：调用 setPageInfo(title, desc) 设置页面标题、描述和标签页标题
5. **大菜单定位**：调用 switchSite(siteId) 切换顶部大菜单（sjzx=数据中心、cwzx=财务中心、fkyys=费控报销、setting=管理后台），自动展开对应左侧菜单分组
6. **Element UI 风格**：沿用模板中定义的 el-button、el-input、el-select、el-table、el-tag、el-pagination、el-card、el-steps、modal 等组件类名
7. **包含关键交互状态**：默认、hover、聚焦、错误、禁用状态
7. **多页面原型**：如需多页面，每个页面都基于同一模板，只改变内容区和 active 菜单项
8. **使用占位数据（mock data）**：数据与 PRD 中的示例一致
9. **所有资源本地内联**：不使用外部 CDN
10. **单文件优先**：页面复杂时拆分为多个 HTML 文件，共用同一套样式
11. **输出目录**：${baseDir}/prototype/`
})
```

## 9.5.6 确认与迭代

1. 使用 Read 工具检查生成的原型文件
2. AskUserQuestion：
   > 原型页面已生成，是否满意？
   > - A) 满意，确认完成
   > - B) 需要调整（描述修改意见）
   > - C) 跳过原型（不保存）
   > - D) 满意，并生成前端代码（调用 jb-pc-page-pipeline 生成 Vue 页面）

3. 选 B → 根据反馈调用 `/frontend-design` 重新生成（最多 2 轮迭代）
4. 选 C → 删除 prototype/ 目录，更新 `phases.prototypeGeneration = true`，进入 Step 10
5. 选 A → 更新 `phases.prototypeGeneration = true`，进入 Step 10
6. 选 D → 更新 `phases.prototypeGeneration = true`，进入 [Step 9.6](step-09-frontend.md) 前端页面实现

## 9.5.7 输出目录结构

```
$BASE_DIR/
├── prd.md
├── prototype/
│   ├── index.html          # 主页面/入口
│   ├── page-*.html         # 子页面（按需）
│   ├── style.css           # 共享样式（如多文件）
│   └── README.md           # 原型说明（页面清单、交互说明）
└── ...
```

## 9.5.8 状态更新

确认完成后：

```bash
ACTIVE_TICKET=$(cat .jb-pm-pipeline/active.json | python -c "import sys,json; print(json.load(sys.stdin).get('ticketId',''))")

python -c "
import json
with open('.jb-pm-pipeline/$ACTIVE_TICKET.json', 'r', encoding='utf-8') as f:
    state = json.load(f)
state['phases']['prototypeGeneration'] = True
with open('.jb-pm-pipeline/$ACTIVE_TICKET.json', 'w', encoding='utf-8') as f:
    json.dump(state, f, ensure_ascii=False, indent=2)
print('prototypeGeneration = true')
"
```
