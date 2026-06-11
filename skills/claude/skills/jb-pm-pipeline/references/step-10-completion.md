# Step 10: 完成（Completion）

## 10.1 生成 README.md

使用 Write 工具创建 `$BASE_DIR/README.md`：

```markdown
# {ticketId} {featureName}

| 阶段 | 文档 | 状态 |
|------|------|------|
| 明确雇佣目标 | [problem-statement.md](./problem-statement.md) | ✅ |
| 发现流程 | [discovery-report.md](./discovery-report.md) | ✅ |
| 用户理解 | [persona.md](./persona.md) / [journey-map.md](./journey-map.md) | ✅ |
| 机会与方案 | [opportunity-solution-tree.md](./opportunity-solution-tree.md) | ✅ |
| 反向验证 | [press-release.md](./press-release.md) | ✅ |
| 用户故事映射 | [user-story-map.md](./user-story-map.md) | ✅ |
| 优先级排序 | [prioritization.md](./prioritization.md) | ✅ |
| 故事拆分 | [epics.md](./epics.md) | ✅ |
| PRD 产出 | [prd.md](./prd.md) | ✅ |
| 原型页面 | [prototype/](./prototype/) | {✅/➖} |
```

## 10.2 更新状态

使用 python 修改现有状态文件（保留原有字段，仅更新 status 和 completedAt）：

```bash
ACTIVE_TICKET=$(cat .jb-pm-pipeline/active.json | python -c "import sys,json; print(json.load(sys.stdin).get('ticketId',''))")

python -c "
import json, datetime

with open('.jb-pm-pipeline/$ACTIVE_TICKET.json', 'r', encoding='utf-8') as f:
    state = json.load(f)

state['status'] = 'completed'
state['completedAt'] = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

with open('.jb-pm-pipeline/$ACTIVE_TICKET.json', 'w', encoding='utf-8') as f:
    json.dump(state, f, ensure_ascii=False, indent=2)

print('状态已更新为 completed')
"
```

## 10.3 输出完成报告

```
✅ 产品发现流水线完成

📄 {baseDir}/problem-statement.md
📄 {baseDir}/discovery-report.md
📄 {baseDir}/persona.md
📄 {baseDir}/journey-map.md
📄 {baseDir}/opportunity-solution-tree.md
📄 {baseDir}/press-release.md
📄 {baseDir}/user-story-map.md
📄 {baseDir}/prioritization.md
📄 {baseDir}/epics.md
📄 {baseDir}/prd.md
📄 {baseDir}/prototype/     # 如有生成
📄 {baseDir}/README.md

下一步：开发团队基于 prd.md 和 epics.md 进入技术方案设计与开发。
如有原型，UI/前端可参考 prototype/ 目录中的静态页面。
```