---
paths:
  - "**/*.java"
---
# Java 性能规范

> 本文件扩展自 [common/performance.md](../common/performance.md)，适用于 **Java 8 + Spring Boot 2.2.9 + MyBatis-Plus + Redis + Nacos** 项目。

## 数据库查询优化

### MyBatis-Plus 查询优化

**避免 N+1 查询：**

```java
// 错误 — N+1 查询
List<Order> orders = orderMapper.selectList(wrapper);
orders.forEach(order -> {
    order.setItems(itemMapper.selectByOrderId(order.getId())); // 循环查询
});

// 正确 — 批量查询或 JOIN
List<Order> orders = orderMapper.selectOrderWithItems(wrapper);
```

**使用索引覆盖：**

```java
// 确保查询条件有索引
wrapper.eq(EcomSpecialOrderDo::getCompanyId, companyId)  // company_id 建索引
       .orderByDesc(EcomSpecialOrderDo::getCreateTime);   // create_time 建索引
```

**分页优化：**

```java
// 正确分页
Page<EcomSpecialOrderDo> page = new Page<>(pageNum, pageSize);  // pageSize 不超过 100
IPage<EcomSpecialOrderDo> result = mapper.selectPage(page, wrapper);

// 大数据量分页优化（超过 10 万）
// 使用游标分页替代 OFFSET
wrapper.last("LIMIT 1000 OFFSET " + (pageNum - 1) * pageSize);
```

**只查询需要的字段：**

```java
// 使用 LambdaQueryWrapper 指定列
wrapper.select(EcomSpecialOrderDo::getId, EcomSpecialOrderDo::getName, EcomSpecialOrderDo::getAmount);

// XML 中只写必要字段
<select id="selectSimpleList" resultType="EcomSpecialOrderDo">
    SELECT id, name, amount FROM t_yl_ecom_special_order WHERE company_id = #{companyId}
</select>
```

### SQL 规范

- 禁止 `SELECT *`，明确列出需要的字段
- 避免在 WHERE 条件中对字段使用函数
- 使用合适的索引列作为查询条件

## 缓存策略

### 多级缓存架构

```
请求 → Caffeine（本地缓存） → Redis（分布式缓存） → 数据库
```

### Caffeine 本地缓存

适用于**少量数据、低频变更**的场景：

```java
// 配置缓存
@Configuration
public class CacheConfig {
    @Bean
    public Cache<String, Object> caffeineCache() {
        return Caffeine.newBuilder()
                .maximumSize(1000)           // 最大条目数
                .expireAfterWrite(10, TimeUnit.MINUTES)  // 写入后过期
                .recordStats()               // 记录统计
                .build();
    }
}

// 使用缓存
@Cacheable(value = "dict", key = "#code")
public DictVo getDictByCode(String code) {
    return dictMapper.selectByCode(code);
}
```

### Redis 分布式缓存

适用于**跨节点共享、数据高频变更**的场景：

```java
// 缓存查询结果
public UserVo getUserById(Long userId) {
    String cacheKey = "user:" + userId;

    // 1. 先查 Redis
    UserVo cached = redisTemplate.opsForValue().get(cacheKey);
    if (cached != null) {
        return cached;
    }

    // 2. 缓存未命中，查数据库
    User user = userMapper.selectById(userId);
    UserVo vo = convertToVo(user);

    // 3. 写入缓存，设置过期时间
    redisTemplate.opsForValue().set(cacheKey, vo, 30, TimeUnit.MINUTES);

    return vo;
}
```

### 缓存更新策略

```java
// 更新时删除缓存（Cache Aside）
@CacheEvict(value = "user", key = "#userId")
public void updateUser(Long userId, UserForm form) {
    userMapper.updateById(entity);
}

// 或延迟双删
public void updateUser(Long userId, UserForm form) {
    // 1. 先删缓存
    redisTemplate.delete("user:" + userId);

    // 2. 更新数据库
    userMapper.updateById(entity);

    // 3. 延迟删缓存（异步）
    CompletableFuture.delayedExecutor(500, TimeUnit.MILLISECONDS)
            .execute(() -> redisTemplate.delete("user:" + userId));
}
```

### 缓存禁止场景

- ❌ 禁止缓存全表数据
- ❌ 禁止缓存频繁更新的数据（如库存）
- ❌ 禁止不设置过期时间的缓存

## 并发处理

### 线程池配置

```java
@Configuration
public class ThreadPoolConfig {

    @Bean("taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10);           // 核心线程数
        executor.setMaxPoolSize(50);            // 最大线程数
        executor.setQueueCapacity(200);          // 队列容量
        executor.setKeepAliveSeconds(60);       // 空闲线程存活时间
        executor.setThreadNamePrefix("async-"); // 线程名前缀
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
```

### 异步任务

```java
@Async("taskExecutor")
public CompletableFuture<OrderExportVo> exportOrdersAsync(OrderQuery query) {
    // 异步执行，避免阻塞主线程
    List<Order> orders = orderMapper.selectList(wrapper);
    return CompletableFuture.completedFuture(convertToExportVo(orders));
}
```

### 并发控制

```java
// 使用 Redisson 分布式锁
RLock lock = redissonClient.getLock("order:process:" + orderId);
try {
    lock.lock(10, TimeUnit.SECONDS);  // 10秒超时
    // 处理业务逻辑
} finally {
    lock.unlock();
}
```

## API 响应优化

### 避免大对象序列化

```java
// 错误 — 返回完整实体
return CommonResult.succeed(orderMapper.selectById(id));

// 正确 — 只返回必要字段
OrderVo vo = new OrderVo();
vo.setId(order.getId());
vo.setName(order.getName());
// 只设置前端需要的字段
return CommonResult.succeed(vo);
```

### 使用分页

```java
// 大列表必须分页
PageHelper.startPage(pageNum, pageSize);
List<Order> orders = orderMapper.selectPage(wrapper);

// 禁止一次性返回超过 1000 条数据
if (result.size() > 1000) {
    throw new YouliBusinessException("数据量过大，请缩小查询范围");
}
```

### 压缩响应

```java
// 在 Nacos 配置中启用 gzip 压缩
# bootstrap.yml
spring:
  http:
    compression:
      enabled: true
      mime-types: application/json,application/xml,text/html,text/xml,text/plain
      min-response-size: 1024
```

## Spring Boot 性能

### 懒加载优化

```java
// 按需加载关联数据，避免全部加载
@Entity
public class Order {
    @ManyToOne(fetch = FetchType.LAZY)
    private Customer customer;  // 延迟加载
}
```

### 事务优化

```java
// 读方法使用只读事务，减少数据库开销
@Transactional(readOnly = true)
public List<Order> getOrderList(Long companyId) {
    return orderMapper.selectList(wrapper);
}

// 写方法事务范围尽量小
@Transactional(rollbackFor = Exception.class)
public void saveOrder(Order order) {
    orderMapper.insert(order);
    // 不要在这里做无关操作
}
```

### 连接池配置

```yaml
# bootstrap.yml - HikariCP 连接池优化
spring:
  datasource:
    hikari:
      minimum-idle: 10        # 最小空闲连接
      maximum-pool-size: 50    # 最大连接数
      connection-timeout: 30000    # 连接超时 30s
      idle-timeout: 600000         # 空闲超时 10min
      max-lifetime: 1800000       # 最大生命周期 30min
```

## 日志性能

**使用占位符而非字符串拼接：**

```java
// 错误 — 字符串拼接，无论是否打印都会执行
log.info("查询订单，id=" + id + ", companyId=" + companyId);

// 正确 — 占位符，只在 DEBUG/INFO 级别时拼接
log.info("查询订单，id={}, companyId={}", id, companyId);

// DEBUG 级别日志使用 isDebugEnabled() 判断
if (log.isDebugEnabled()) {
    log.debug("完整对象: {}", JSON.toJSONString(obj));
}
```

## 常见性能问题

| 场景 | 问题 | 解决方案 |
|------|------|---------|
| 循环内查数据库 | N+1 查询 | 批量查询或 JOIN |
| 大数据量全表扫描 | 查询慢 | 添加索引、分页 |
| 缓存未命中频繁 | 缓存穿透 | 布隆过滤器或空值缓存 |
| 热点 key 集中 | 缓存雪崩 | 随机过期时间 |
| 锁竞争激烈 | 分布式锁瓶颈 | Redisson 分段锁 |

## 性能检测工具

| 工具 | 用途 |
|------|------|
| Arthas | 在线诊断 Java 应用性能问题 |
| SkyWalking | 分布式追踪 |
| Pinpoint | APM 监控 |
| JProfiler | CPU/Memory 分析 |

## 参考

- MyBatis-Plus 性能优化：https://baomidou.com/pages/24112f/#性能优化
- Spring Boot 性能：https://docs.spring.io/spring-boot/docs/2.2.9.RELEASE/reference/htmlsingle/#boot-features-sql-h2
- Redis 缓存：https://github.com/redisson/redisson/wiki/8.-distributed-locks-and-synchronizers
