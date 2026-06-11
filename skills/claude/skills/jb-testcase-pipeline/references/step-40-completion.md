# Step 4: 完成输出

## 检查

如果 `status == "completed"`：

进入"已完成"分支（见下方）。

## 执行

### 4.1 更新状态文件

```bash
cat > "$TICKET_STATE_FILE" << EOF
{
  "version": "2.0.0",
  "status": "completed",
  "ticketId": "$TICKET_ID",
  "featureName": "$FEATURE_NAME",
  "baseDir": "$BASE_DIR",
  "workspace": "$WORKSPACE",
  "inputLevel": "$INPUT_LEVEL",
  "mode": "$MODE",
  "phases": {
    "inputCheck": true,
    "generating": true,
    "generated": true,
    "coverageCalculated": true,
    "coveragechecked": true,
    "testdataGenerated": true
  },
  "stats": {
    "backendUnit": $BACKEND_COUNT,
    "frontendUnit": $FRONTEND_COUNT,
    "apiIntegration": $API_COUNT,
    "blackbox": $BLACKBOX_COUNT,
    "total": $TOTAL
  },
  "coverage": {
    "gate": "pass",
    "totalFeatures": $TOTAL_FEATURES,
    "coveredFeatures": $COVERED_FEATURES,
    "percentage": $PERCENTAGE
  },
  "completedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
```

### 4.1.1 追加历史记录

每次生成完成后，自动追加一条记录到 `.jb-testcase-pipeline/history.md`：

```bash
HISTORY_FILE=".jb-testcase-pipeline/history.md"

# 如果 history.md 不存在，创建并写入表头
if [ ! -f "$HISTORY_FILE" ]; then
  cat > "$HISTORY_FILE" << 'EOF'
# jb-testcase-pipeline 执行历史

| 日期 | 需求编号 | 需求名称 | 迭代 | 模式 | 用例数 | 覆盖率 | 状态 |
|------|----------|----------|------|------|--------|--------|------|
EOF
fi

# 追加本次记录
echo "| $(date +%Y-%m-%d) | $TICKET_ID | $FEATURE_NAME | $VERSION | $MODE | $TOTAL | ${PERCENTAGE}% | completed |" >> "$HISTORY_FILE"
```

**查看历史：** 用户输入"查看历史"或"用例记录"时，读取并展示 `.jb-testcase-pipeline/history.md`。

### 4.2 输出完成报告

**全量模式：**

```
✅ 测试用例生成完成

📁 产出文件：
   {baseDir}/test/case/
   ├── cases.md          # 测试用例说明书
   └── testdata.md       # 测试数据文档

📊 用例统计：
   - 后端单元测试：{n} 条
   - 前端单元测试：{n} 条
   - API 集成测试：{n} 条
   - 黑盒测试：{n} 条
   - 合计：{n} 条

📈 覆盖率报告：
   - PRD 功能点总数：{n} 个
   - 已覆盖功能点：{n} 个
   - 需求覆盖率：{n}%
   - 门禁状态：通过

⏭️  下一步：
   - 开发团队基于 cases.md 进行编码实现
   - 可调用 /jb-dev-pipeline 进入开发阶段
   - 编码完成后，基于 cases.md 执行测试验证
   - 测试数据参考 testdata.md 准备环境
   - 修改用例：调用 /jb-testcase-pipeline（同一 ticket）
   - 执行黑盒测试：调用 /jb-testcase-pipeline --scope blackbox
```

**增量模式：**

```
✅ 测试用例补充完成

📁 产出文件：
   {baseDir}/test/case/
   ├── cases.md          # 测试用例说明书（已更新）
   └── testdata.md       # 测试数据文档（已更新）

📊 本次新增：
   - 新增功能点：{n} 个
   - 新增用例：{n} 条

📊 累计统计：
   - 后端单元测试：{n} 条
   - 前端单元测试：{n} 条
   - API 集成测试：{n} 条
   - 黑盒测试：{n} 条
   - 总计：{n} 条

📈 覆盖率报告：
   - PRD 功能点总数：{n} 个
   - 已覆盖功能点：{n} 个
   - 需求覆盖率：{n}%
   - 门禁状态：通过
```

### 4.3 询问是否生成 E2E 测试脚本

完成报告输出后，必须使用 AskUserQuestion 询问用户：

> 测试用例已生成完毕。是否需要生成 E2E 自动化测试脚本（Playwright）？
>
> - **A)** 生成 E2E 测试脚本（推荐：功能测试、页面交互类需求）
> - **B)** 跳过，仅保留测试用例文档
> - **C)** 生成测试代码骨架（--with-codegen 模式）

选择 A 时，进入 Step 5（E2E 测试生成）。
选择 B 时，流程结束。
选择 C 时，执行 --with-codegen 代码骨架生成。

## 已完成状态处理

如果用户再次输入同一 ticket（status == "completed"）：

AskUserQuestion：

> 检测到已有完成的测试用例：`{ticketId} {featureName}`
>
> 完成时间：{completedAt}
> 用例数量：{total} 条
> 覆盖率：{percentage}%
>
> 请选择：
> - **A)** 查看已完成的测试用例
> - **B)** 重新生成（覆盖旧版本）
> - **C)** 补充用例（在现有基础上增加）— 调用增量模式
> - **D)** 修改用例 — 调用 /jb-testcase-pipeline 重新执行

## 可选：生成测试代码骨架

如果用户选择 `--with-codegen` 参数：

```
Agent({
  subagent_type: "general-purpose",
  prompt: "基于测试用例，生成对应的测试代码骨架。

【测试用例】
{cases.md 全文}

【任务】
为每个测试用例生成对应的测试代码骨架，使用对应的测试框架。

【输出格式】
- 后端：JUnit 5 + Mockito
- 前端：Vitest + @vue/test-utils
- API：Playwright 或 SuperTest

【约束】
- 只生成测试方法签名和注释，不填充具体实现
- 保持与用例编号的对应关系
- 输出为可直接运行的代码文件"
})
```

将生成的代码保存到：
- 后端：`{baseDir}/src/test/java/.../{ClassName}Test.java`
- 前端：`{baseDir}/src/__tests__/{ComponentName}.spec.ts`
- API：`{baseDir}/tests/api/{endpoint}.spec.ts`
