---
paths:
  - "**/*.java"
---
# Java 日志规范

> 本文件扩展自 [common/coding-style.md](../common/coding-style.md)，适用于 **Spring Boot 2.2.9 + Slf4j + AliYun Logstash Appender** 项目。

## 日志框架

项目使用 **Slf4j** 作为日志门面：

```java
private static final Logger log = LoggerFactory.getLogger(OrderService.class);
```

**禁止使用：**
- ❌ `System.out.println()`
- ❌ `System.err.println()`
- ❌ `printStackTrace()`

## 日志级别

| 级别 | 使用场景 |
|------|---------|
| **DEBUG** | 开发调试信息，生产环境不输出 |
| **INFO** | 业务流程节点、重要状态变更 |
| **WARN** | 业务异常但可恢复（库存不足、无权限） |
| **ERROR** | 系统异常、第三方调用失败、需要排查的问题 |

### 使用示例

```java
// INFO — 业务流程节点
log.info("订单已创建，orderId={}, amount={}", orderId, amount);
log.info("开始处理退款，refundId={}, orderId={}", refundId, orderId);

// WARN — 业务异常
log.warn("库存不足，skuId={}, 申请库存={}, 当前库存={}", skuId, required, current);
log.warn("用户无权访问该资源，userId={}, resourceId={}", userId, resourceId);

// ERROR — 系统异常
log.error("数据库查询异常，sql={}", sql, e);
log.error("第三方接口调用超时，vendor=aliyun, orderId={}", orderId, e);
```

## 日志格式

项目使用 **AliYun Logstash Appender**，日志格式：

```xml
<!-- logback-xiaogj.xml -->
<appender name="ALIYUN" class="com.aliyun.openservices.log.logback.LogstashAppender">
    <endpoint>${ALIYUN_LOG_ENDPOINT}</endpoint>
    <project>${ALIYUN_LOG_PROJECT}</project>
    <logstore>${ALIYUN_LOG_STORE}</logstore>
    <source>${HOSTNAME}</source>
    <topic>application</topic>
    <tag>
        <tag>
            <key>app</key>
            <value>xiaogj-youli-data-etl</value>
        </tag>
    </tag>
    <layout class="ch.qos.logback.classic.PatternLayout">
        <pattern>{"time":"%d{yyyy-MM-dd HH:mm:ss.SSS}","level":"%level","logger":"%logger{36}","thread":"%thread","traceId":"%X{traceId:-}","message":"%msg","exception":"%exception{20}"}</pattern>
    </layout>
</appender>
```

## 占位符规范

**必须使用占位符 `{}`，禁止字符串拼接：**

```java
// ✅ 正确 — 占位符
log.info("订单创建成功，orderId={}, amount={}", orderId, amount);

// ❌ 错误 — 字符串拼接（即使 INFO 级别也会执行拼接）
log.info("订单创建成功，orderId=" + orderId + ", amount=" + amount);

// ❌ 错误 — 复杂对象拼接（触发 toString）
log.info("订单信息：{}", order);  // 如果是延迟计算，可能产生大对象序列化
```

### 复杂对象日志

```java
// ✅ 正确 — 只记录需要的字段
log.info("订单创建，orderId={}, customer={}, amount={}",
         order.getId(), order.getCustomerName(), order.getAmount());

// ✅ 正确 — DEBUG 级别记录完整对象
if (log.isDebugEnabled()) {
    log.debug("订单详情：{}", JSON.toJSONString(order));
}
```

## 敏感信息保护

**禁止在日志中记录以下信息：**

| 敏感类型 | 示例 | 脱敏方式 |
|---------|------|---------|
| 密码 | `password`、`pwd` | 脱敏或删除 |
| 手机号 | `mobile`、`phone` | `138****5678` |
| 身份证 | `idCard`、`idNumber` | `610***********1234` |
| 银行卡 | `bankCard` | `**** **** **** 1234` |
| Token | `token`、`Authorization` | 删除或脱敏 |
| 金额 | 涉及隐私的金额 | 脱敏处理 |

### 脱敏工具

```java
public class SensitiveUtils {

    /**
     * 手机号脱敏
     */
    public static String maskPhone(String phone) {
        if (phone == null || phone.length() < 11) {
            return phone;
        }
        return phone.substring(0, 3) + "****" + phone.substring(7);
    }

    /**
     * 身份证脱敏
     */
    public static String maskIdCard(String idCard) {
        if (idCard == null || idCard.length() < 8) {
            return idCard;
        }
        return idCard.substring(0, 6) + "********" + idCard.substring(14);
    }

    /**
     * 银行卡脱敏
     */
    public static String maskBankCard(String cardNo) {
        if (cardNo == null || cardNo.length() < 8) {
            return cardNo;
        }
        return "**** **** **** " + cardNo.substring(cardNo.length() - 4);
    }
}

// 使用示例
log.info("用户登录成功，userId={}, phone={}", userId, SensitiveUtils.maskPhone(mobile));
```

## 分模块日志

```java
// Service 层 — 记录业务日志
@Service
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public void createOrder(Order order) {
        log.info("创建订单，orderNo={}, amount={}", order.getOrderNo(), order.getAmount());
        // ...
    }
}

// Controller 层 — 记录请求日志
@RestController
public class OrderController {
    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    @PostMapping("/create")
    public CommonResult<OrderVo> create(@RequestBody @Valid OrderForm form) {
        log.info("收到创建订单请求，orderNo={}", form.getOrderNo());
        // ...
    }
}

// Task 层 — 记录定时任务执行
@Component
public class OrderSyncTask {
    private static final Logger log = LoggerFactory.getLogger(OrderSyncTask.class);

    @XxlJob("orderSyncTask")
    public ReturnT<String> execute() {
        log.info("开始同步订单，time={}", DateUtil.formatDateTime(new Date()));
        try {
            // 同步逻辑
            log.info("订单同步完成，共处理={}条", count);
        } catch (Exception e) {
            log.error("订单同步异常", e);
        }
        return ReturnT.SUCCESS;
    }
}
```

## 请求追踪

### TraceId 记录

```java
// 使用 MDC 记录 TraceId
public class TraceFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String traceId = UUID.randomUUID().toString().replace("-", "");
        MDC.put("traceId", traceId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("traceId");
        }
    }
}

// 日志中自动包含 traceId
log.info("处理请求，traceId={}", MDC.get("traceId"));
```

### 聚合日志查询

```json
{
  "time": "2026-05-08 10:30:00.123",
  "level": "INFO",
  "logger": "com.xiaogj.youli.OrderService",
  "thread": "http-nio-8080-exec-1",
  "traceId": "a1b2c3d4e5f6",
  "message": "订单创建成功，orderId=123456",
  "exception": null
}
```

## 常见日志场景

### 1. 方法入口/出口

```java
// 简单场景 — 只记录入口
log.info("查询订单列表，companyId={}", companyId);

// 复杂场景 — 记录入口和出口
public Order queryOrder(Long orderId) {
    log.info("查询订单，orderId={}", orderId);
    try {
        Order order = orderMapper.selectById(orderId);
        log.info("查询订单完成，orderId={}, found={}", orderId, order != null);
        return order;
    } catch (Exception e) {
        log.error("查询订单异常，orderId={}", orderId, e);
        throw e;
    }
}
```

### 2. 循环处理

```java
// 记录批次信息
log.info("开始处理订单列表，共{}条", orderList.size());

for (int i = 0; i < orderList.size(); i++) {
    Order order = orderList.get(i);

    // 每 100 条记录一次进度日志
    if (i > 0 && i % 100 == 0) {
        log.info("处理进度，current={}, total={}", i, orderList.size());
    }

    try {
        processOrder(order);
    } catch (Exception e) {
        log.warn("处理订单失败，orderId={}, index={}, error={}",
                 order.getId(), i, e.getMessage());
    }
}

log.info("订单列表处理完成，成功={}, 失败={}", successCount, failCount);
```

### 3. 外部调用

```java
// 调用前
log.info("调用第三方接口，vendor=aliyun, action=getToken, requestId={}", requestId);

// 调用后（成功）
log.info("第三方接口调用成功，vendor=aliyun, action=getToken, responseCode={}, cost={}ms",
         response.getCode(), System.currentTimeMillis() - startTime);

// 调用后（失败）
log.warn("第三方接口调用失败，vendor=aliyun, action=getToken, errorCode={}, errorMsg={}",
         error.getCode(), error.getMessage());

// 调用异常
log.error("第三方接口调用异常，vendor=aliyun, action=getToken", e);
```

## 禁止的行为

- ❌ `System.out.println` / `System.err.println`
- ❌ 字符串拼接日志
- ❌ 记录明文密码、Token、完整身份证号
- ❌ 在 INFO 级别记录大对象（使用 DEBUG）
- ❌ 日志中记录完整 SQL（使用 DEBUG）

## Logback 配置参考

```xml
<!-- logback-xiaogj.xml -->
<configuration>
    <property name="LOG_PATTERN"
              value="%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"/>

    <!-- 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- AliYun 日志 -->
    <appender name="ALIYUN" class="com.aliyun.openservices.log.logback.LogstashAppender">
        <endpoint>${ALIYUN_LOG_ENDPOINT}</endpoint>
        <project>${ALIYUN_LOG_PROJECT}</project>
        <logstore>${ALIYUN_LOG_STORE}</logstore>
        <layout class="ch.qos.logback.classic.PatternLayout">
            <pattern>${LOG_PATTERN}</pattern>
        </layout>
    </appender>

    <!-- 开发环境 -->
    <springProfile name="dev">
        <root level="DEBUG">
            <appender-ref ref="CONSOLE"/>
        </root>
    </springProfile>

    <!-- 生产环境 -->
    <springProfile name="prod">
        <root level="INFO">
            <appender-ref ref="ALIYUN"/>
        </root>
    </springProfile>
</configuration>
```

## 参考

- Slf4j 官方：http://www.slf4j.org/
- Logback 官方：https://logback.qos.ch/
- AliYun Logstash Appender：https://github.com/aliyun/aliyun-log-logback-appender
