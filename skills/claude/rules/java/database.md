---
paths:
  - "**/*.java"
  - "**/*.sql"
---
# Java 数据库规范

> 本文件扩展自 [common/coding-style.md](../common/coding-style.md)，适用于 **MyBatis-Plus + MySQL 8.0** 项目。

## 命名规范

### 表命名

```
t_yl_{domain}_{biz}
```

| 含义 | 示例 |
|------|------|
| 通用前缀 | `t_yl_` |
| 领域 | `amb`（审批）、`crm`（客户）、`mdm`（主数据）、`budget`（预算） |
| 业务 | `order`（订单）、`invoice`（发票）、`contract`（合同） |

**完整示例：**
```
t_yl_amb_approval      -- 审批表
t_yl_crm_customer      -- 客户表
t_yl_mdm_goods         -- 商品表
t_yl_budget_plan       -- 预算计划表
```

### 字段命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 主键 | `id` | `id BIGINT` |
| 外键 | `{table}_id` | `company_id`, `order_id` |
| 创建时间 | `create_time` | `DATETIME` |
| 更新时间 | `update_time` | `DATETIME` |
| 逻辑删除 | `deleted` | `TINYINT DEFAULT 0` |
| 租户隔离 | `company_id` | `BIGINT` |
| 金额 | `{name}_amount` | `decimal(18,2)` |
| 状态 | `{name}_status` | `VARCHAR(20)` |

### 索引命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 主键 | `pk_{table}` | `pk_t_yl_order` |
| 唯一索引 | `uk_{table}_{column}` | `uk_t_yl_user_phone` |
| 普通索引 | `idx_{table}_{column}` | `idx_t_yl_order_company` |

## 字段规范

### 主键

```sql
-- 禁止使用自增主键，使用分布式 ID
id BIGINT NOT NULL COMMENT '主键ID' PRIMARY KEY,
-- 或使用雪花算法 ID
@TableId(type = IdType.ASSIGN_ID)
```

### 审计字段

```sql
-- 必须包含的审计字段
create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
creator_id VARCHAR(64) COMMENT '创建人ID',
creator_name VARCHAR(100) COMMENT '创建人姓名',
updater_id VARCHAR(64) COMMENT '更新人ID',
updater_name VARCHAR(100) COMMENT '更新人姓名',
deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除标记',
```

### 金额字段

```sql
-- 金额必须使用 DECIMAL，禁止使用 DOUBLE/FLOAT
amount DECIMAL(18,2) NOT NULL COMMENT '金额',

-- 税率、百分比使用更高精度
tax_rate DECIMAL(18,6) NOT NULL COMMENT '税率',
percentage DECIMAL(18,6) NOT NULL COMMENT '百分比',
```

### 字符集

```sql
-- 统一使用 utf8mb4
CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
```

## 表结构规范

### 必须字段

每个业务表必须有：

```sql
CREATE TABLE t_yl_xxx (
    id BIGINT NOT NULL COMMENT '主键',
    company_id BIGINT NOT NULL COMMENT '租户ID',

    -- 审计字段
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    creator_id VARCHAR(64) COMMENT '创建人ID',
    creator_name VARCHAR(100) COMMENT '创建人姓名',
    updater_id VARCHAR(64) COMMENT '更新人ID',
    updater_name VARCHAR(100) COMMENT '更新人姓名',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',

    -- 业务字段...

    PRIMARY KEY (id),
    KEY idx_t_yl_xxx_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='XXX表';
```

### 外键规范

```sql
-- 禁止使用外键约束（在应用层保证数据一致性）
-- 但必须有普通索引保证关联查询性能
KEY idx_t_yl_order_company (company_id),
KEY idx_t_yl_order_customer (customer_id)
```

## 索引规范

### 索引创建原则

```sql
-- 1. WHERE 条件字段添加索引
WHERE company_id = ?       → idx_xxx_company
WHERE status = ? AND type = ? → idx_xxx_status_type

-- 2. ORDER BY 字段添加索引（与 WHERE 条件联合）
WHERE company_id = ? ORDER BY create_time DESC
→ idx_xxx_company_create (company_id, create_time DESC)

-- 3. 避免在索引列上使用函数
-- 错误
WHERE YEAR(create_time) = 2024
-- 正确
WHERE create_time >= '2024-01-01' AND create_time < '2025-01-01'
```

### 联合索引设计

```sql
-- 最左前缀原则
INDEX idx_xxx_company_status (company_id, status, create_time DESC)

-- 查询会命中索引
WHERE company_id = ?                          -- ✅ 命中
WHERE company_id = ? AND status = ?            -- ✅ 命中
WHERE company_id = ? AND status = ? AND create_time > ?  -- ✅ 命中

-- 查询不会命中索引
WHERE status = ?                              -- ❌ 不命中
WHERE create_time > ?                         -- ❌ 不命中
```

## 数据库变更规范

### 禁止行为

- ❌ 禁止直接修改生产数据库表结构
- ❌ 禁止在 SQL 中使用 `DROP COLUMN`
- ❌ 禁止删除带有数据的表
- ❌ 禁止使用 `SELECT *` 查询

### 变更流程

```sql
-- 1. 新增字段（必须加注释）
ALTER TABLE t_yl_xxx ADD COLUMN new_field VARCHAR(100) COMMENT '新字段' AFTER existing_field;

-- 2. 新增索引
ALTER TABLE t_yl_xxx ADD INDEX idx_t_yl_xxx_new (new_field);

-- 3. 变更字段（先加后删）
-- Step 1: 添加新字段
ALTER TABLE t_yl_xxx ADD COLUMN new_name VARCHAR(100) COMMENT '名称';
-- Step 2: 数据迁移（必须包含 update_time 和 updater_id）
UPDATE t_yl_xxx
SET new_name = old_name,
    update_time = NOW(),
    updater_id = 'system',
    updater_name = '系统迁移'
WHERE deleted = 0;
-- Step 3: 验证数据
-- Step 4: 删除旧字段
ALTER TABLE t_yl_xxx DROP COLUMN old_name;
```

### 数据更新规范

**所有 UPDATE 操作必须同时更新审计字段：**

```sql
-- ✅ 正确 — 包含 update_time 和 updater_id
UPDATE t_yl_xxx
SET name = '新名称',
    update_time = NOW(),
    updater_id = 'admin',
    updater_name = '管理员'
WHERE id = 1 AND deleted = 0;

-- ❌ 错误 — 未更新审计字段
UPDATE t_yl_xxx SET name = '新名称' WHERE id = 1;
```

**Java 代码中的更新操作：**

```java
// ✅ 正确 — 更新时设置审计字段
public void updateOrder(OrderDo order, Long updaterId, String updaterName) {
    order.setUpdateTime(LocalDateTime.now());
    order.setUpdaterId(updaterId.toString());
    order.setUpdaterName(updaterName);
    orderMapper.updateById(order);
}

// ❌ 错误 — 未设置审计字段
public void updateOrder(OrderDo order) {
    orderMapper.updateById(order);  // update_time 未更新
}
```

### DDL 变更记录

所有数据库变更必须记录在 SQL 文件中：

```sql
-- ai-doc/iterations/v{version}/sql/{date}_alter_t_yl_xxx.sql

-- =============================================
-- 变更说明：添加新字段支持XXX功能
-- 变更日期：2026-05-08
-- 变更人：{username}
-- 回滚方案：执行逆向 ALTER 语句
-- =============================================

ALTER TABLE t_yl_xxx ADD COLUMN new_field VARCHAR(100) COMMENT '新字段';
```

## MyBatis-Plus 映射规范

### 实体类注解

```java
@TableName("t_yl_ecom_special_order")  // 表名
public class EcomSpecialOrderDo {

    @TableId(type = IdType.ASSIGN_ID)   // 分布式 ID
    private Long id;

    @TableField("company_id")            // 字段映射
    private Long companyId;

    @TableField(exist = false)          // 非数据库字段
    private String extraField;

    @TableField("deleted")              // 逻辑删除字段，手动添加条件
    private Integer deleted;
}
```

## 逻辑删除规范

### 概述

项目**不使用 `@TableLogic` 注解**，逻辑删除由**应用层手动处理**。

| 方案 | 实现方式 |
|------|---------|
| `@TableLogic` | MyBatis-Plus 自动处理（项目未启用） |
| **手动处理** | 应用层在查询/删除时手动添加条件 |

### 删除操作

**物理删除（禁止）：**
```java
// ❌ 禁止 — 物理删除
mapper.deleteById(id);
mapper.delete(wrapper);  // 会物理删除
```

**逻辑删除（正确）：**
```java
// ✅ 正确 — 更新 deleted 字段
public void deleteById(Long id) {
    OrderDo order = new OrderDo();
    order.setId(id);
    order.setDeleted(1);
    order.setUpdateTime(LocalDateTime.now());
    orderMapper.updateById(order);
}

// ✅ 正确 — 带租户条件的删除
public void deleteById(Long id, Long companyId) {
    LambdaUpdateWrapper<OrderDo> wrapper = new LambdaUpdateWrapper<>();
    wrapper.eq(OrderDo::getId, id)
           .eq(OrderDo::getCompanyId, companyId)
           .set(OrderDo::getDeleted, 1)
           .set(OrderDo::getUpdateTime, LocalDateTime.now());
    orderMapper.update(null, wrapper);
}
```

### 查询操作

**所有查询必须添加 deleted 条件：**

```java
// ✅ 正确 — 查询时添加 deleted = 0
public List<OrderDo> getActiveList(Long companyId) {
    LambdaQueryWrapper<OrderDo> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(OrderDo::getCompanyId, companyId)
           .eq(OrderDo::getDeleted, 0)  // ← 必须添加
           .orderByDesc(OrderDo::getCreateTime);
    return orderMapper.selectList(wrapper);
}

// ✅ 正确 — 单条查询也必须添加
public OrderDo getById(Long id, Long companyId) {
    LambdaQueryWrapper<OrderDo> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(OrderDo::getId, id)
           .eq(OrderDo::getCompanyId, companyId)
           .eq(OrderDo::getDeleted, 0);  // ← 必须添加
    return orderMapper.selectOne(wrapper);
}

// ❌ 错误 — 未添加 deleted 条件（会查到已删除数据）
public OrderDo getById(Long id) {
    return orderMapper.selectById(id);  // ❌ 可能返回已删除数据
}
```

### 公共方法抽取

为避免遗漏，建议在 Service 基类或工具类中封装公共方法：

```java
public abstract class BaseService<T> {

    @Resource
    protected BaseMapper<T> baseMapper;

    /**
     * 查询有效数据（自动添加 deleted = 0）
     */
    protected List<T> selectActive(Wrapper<T> wrapper) {
        wrapper.eq("deleted", 0);
        return baseMapper.selectList(wrapper);
    }

    /**
     * 根据 ID 查询有效数据
     */
    protected T selectActiveById(Serializable id) {
        LambdaQueryWrapper<T> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq("id", id).eq("deleted", 0);
        return baseMapper.selectOne(wrapper);
    }

    /**
     * 逻辑删除
     */
    protected boolean deleteActive(Serializable id) {
        LambdaUpdateWrapper<T> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq("id", id).set("deleted", 1);
        return baseMapper.update(null, wrapper) > 0;
    }
}
```

### BaseMapper 扩展

扩展 MyBatis-Plus 的 BaseMapper，添加自动逻辑删除支持：

```java
public interface LogicDeleteMapper<T> extends BaseMapper<T> {

    /**
     * 查询有效数据（deleted = 0）
     */
    default List<T> selectActive(Wrapper<T> wrapper) {
        wrapper.eq("deleted", 0);
        return selectList(wrapper);
    }

    /**
     * 根据 ID 查询有效数据
     */
    default T selectActiveById(Serializable id) {
        LambdaQueryWrapper<T> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq("id", id).eq("deleted", 0);
        return selectOne(wrapper);
    }

    /**
     * 逻辑删除（更新 deleted = 1）
     */
    default int logicDelete(Serializable id) {
        LambdaUpdateWrapper<T> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq("id", id).set("deleted", 1);
        return update(null, wrapper);
    }
}
```

### 枚举定义

建议使用枚举表示删除状态，便于维护：

```java
public enum DeletedStatus {
    ACTIVE(0, "有效"),
    DELETED(1, "已删除");

    private final int code;
    private final String desc;

    DeletedStatus(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }
}

// 实体中使用
@TableField("deleted")
private Integer deleted;

// Service 中使用
wrapper.eq(OrderDo::getDeleted, DeletedStatus.ACTIVE.getCode());
```

### 常见错误

| 错误写法 | 问题 | 正确写法 |
|---------|------|---------|
| `mapper.selectById(id)` | 未排除已删除数据 | 使用 `selectActiveById(id)` |
| `mapper.deleteById(id)` | 物理删除 | 更新 `deleted = 1` |
| 查询时忘记加 `deleted = 0` | 返回已删除数据 | 所有查询都要加 |
| 批量删除用 `deleteBatchIds` | 物理删除 | 循环调用逻辑删除 |

### 禁止的行为

- ❌ 禁止使用 `deleteById()` / `delete(wrapper)` 进行物理删除
- ❌ 禁止在查询时遗漏 `deleted = 0` 条件
- ❌ 禁止在实体类中使用 `@TableLogic`（项目未启用该功能）
- ❌ 禁止实体类字段与数据库字段类型不匹配
- ❌ 禁止忽略 `company_id` 租户隔离

## 参考

- 阿里巴巴 Java 开发手册：数据库规范
- MySQL 8.0 索引设计：https://dev.mysql.com/doc/refman/8.0/en/optimization.html
