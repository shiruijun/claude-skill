# Step 3: 测试数据生成

## 检查

如果 `phases.testdataGenerated == true`：

跳过本步骤，直接进入 Step 4。

## 执行

启动测试数据生成 Agent：

```
Agent({
  subagent_type: "general-purpose",
  prompt: "你是测试数据工程师。基于测试用例，生成测试所需的测试数据。

【任务】
1. 分析测试用例中的「输入数据」字段
2. 生成 Mock 数据、Seed 数据、边界值数据
3. 输出结构化的测试数据文档

【输入】
{cases.md 全文}

【输出格式】

## 测试数据

### Mock 数据

用于单元测试的 Mock 对象和返回值。

| 数据类型 | 用途 | 数据内容 |
|----------|------|----------|
| 用户对象 | 登录测试 | `{ "id": "1001", "name": "测试用户", "role": "admin" }` |
| 订单对象 | 支付测试 | `{ "orderId": "ORD001", "amount": 99.99, "status": "pending" }` |
| ... | ... | ... |

### Seed 数据

用于集成测试的数据库初始数据。

```sql
-- 用户表
INSERT INTO sys_user (id, username, phone, status) VALUES
(1001, 'test_user_1', '13800000001', 1),
(1002, 'test_user_2', '13800000002', 0);

-- 订单表
INSERT INTO biz_order (id, user_id, amount, status) VALUES
('ORD001', 1001, 99.99, 'pending'),
('ORD002', 1001, 199.99, 'paid');
```

### 边界值数据

| 字段 | 类型 | 最小值 | 正常值 | 最大值 | 空值 | 异常值 |
|------|------|--------|--------|--------|------|--------|
| 手机号 | String | "" | "13800138000" | "138001380001" | null | "abc" |
| 金额 | Decimal | 0.01 | 100.00 | 999999.99 | null | -1 |
| 页码 | Integer | 1 | 1 | 10000 | null | 0 |

### 测试环境配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| API_BASE_URL | http://localhost:8080 | 本地测试 |
| DB_HOST | localhost | 测试数据库 |
| REDIS_HOST | localhost | 测试缓存 |

【约束】
- 数据格式必须与实际 API 接口一致
- 敏感字段使用脱敏数据
- 包含正常和异常两种场景的数据
- **Seed 数据 SQL 必须使用后端实体类 @TableName 注解中的实际表名**（如 t_yl_amb_form 而非 amoeba_form）
- 字段名必须与实体类 @TableField 注解或 Java 字段名（camelCase → snake_case）一致
- **表名必须来自 Step 1 中 @TableName 注解的验证结果**，如果 Step 1 未找到 @TableName，必须先搜索后端代码确认
- 输出为 Markdown 格式"
})
```

## 产出

1. 将 Agent 输出保存为 `$BASE_DIR/test/case/testdata.md`
2. 同时更新 `cases.md` 末尾追加测试数据引用

## 更新状态

```bash
cat > "$TICKET_STATE_FILE" << EOF
{
  "phases": {
    "testdataGenerated": true
  }
}
EOF
```

## 输出

```
✅ 测试数据已生成

📄 测试数据文档：{baseDir}/test/case/testdata.md

数据统计：
- Mock 对象：{n} 个
- Seed 数据：{n} 条
- 边界值：{n} 组
- 环境配置：{n} 项

下一步：进入 Step 4 完成输出
```

进入 Step 4。
