---
paths:
  - "**/*.java"
---
# Java 异常处理规范

> 本文件扩展自 [common/coding-style.md](../common/coding-style.md)，适用于 **Spring Boot 2.2.9 + MyBatis-Plus** 项目。

## 异常分类

### 业务异常（YouliBusinessException）

```java
// 用于业务校验失败、违反业务规则的情况
throw new YouliBusinessException("订单不存在，id=" + id);
throw new YouliBusinessException("无权操作此数据");
throw new YouliBusinessException("库存不足，当前库存：" + stock);
```

**使用场景：**
- 参数校验失败
- 业务规则校验
- 数据不存在
- 权限不足
- 状态不正确

### 系统异常（RuntimeException）

```java
// 用于程序错误、第三方服务调用失败
throw new RuntimeException("数据库连接失败");
throw new RuntimeException("第三方接口超时");
```

**使用场景：**
- 外部服务调用失败
- 系统配置错误
- 未知程序错误

## 统一异常处理

### 全局异常处理器

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 业务异常处理
     */
    @ExceptionHandler(YouliBusinessException.class)
    public CommonResult<Void> handleBusinessException(YouliBusinessException e) {
        log.warn("业务异常：[{}]", e.getMsg());
        return CommonResult.failed(e.getCode(), e.getMsg());
    }

    /**
     * 参数校验异常处理
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public CommonResult<Void> handleValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("，"));
        log.warn("参数校验异常：[{}]", message);
        return CommonResult.failed(400, message);
    }

    /**
     * 未知异常处理
     */
    @ExceptionHandler(Exception.class)
    public CommonResult<Void> handleException(Exception e) {
        log.error("系统异常：", e);
        return CommonResult.failed("系统异常，请稍后重试");
    }
}
```

## YouliBusinessException 规范

### 异常定义

```java
public class YouliBusinessException extends RuntimeException {

    private int code = 500;
    private String msg;

    public YouliBusinessException(String msg) {
        super(msg);
        this.msg = msg;
    }

    public YouliBusinessException(int code, String msg) {
        super(msg);
        this.code = code;
        this.msg = msg;
    }

    public YouliBusinessException(String msg, Throwable cause) {
        super(msg, cause);
        this.msg = msg;
    }

    public int getCode() {
        return code;
    }

    @Override
    public String getMsg() {
        return msg;
    }
}
```

### 异常抛出规范

```java
// ✅ 正确 — 明确错误信息，包含上下文
if (order == null) {
    throw new YouliBusinessException("订单不存在，id=" + id);
}

// ✅ 正确 — 使用枚举定义错误码
throw new YouliBusinessException(OrderError.ORDER_NOT_FOUND);

// ❌ 错误 — 过于简略
throw new YouliBusinessException("订单不存在");

// ❌ 错误 — 不应该抛出检查异常
throw new IOException("文件读取失败");  // 应包装为 RuntimeException
```

### 异常码规范

```java
// 错误码定义（按模块划分）
public enum ErrorCode {

    // 通用错误码 1xxx
    SYSTEM_ERROR(1000, "系统异常"),
    PARAM_ERROR(1001, "参数错误"),
    DATA_NOT_FOUND(1002, "数据不存在"),

    // 订单模块 2xxx
    ORDER_NOT_FOUND(2001, "订单不存在"),
    ORDER_STATUS_ERROR(2002, "订单状态不正确"),
    ORDER_AMOUNT_ERROR(2003, "订单金额不匹配"),

    // 审批模块 3xxx
    APPROVAL_NOT_FOUND(3001, "审批不存在"),
    APPROVAL_REJECTED(3002, "审批已驳回"),

    ;
}
```

## Controller 层异常处理

### 标准模式

```java
@RestController
@RequestMapping("/api/etl/ecom/specialOrder")
@Api(tags = "电商特殊单管理")
public class EcomSpecialOrderController extends BaseController {

    @Resource
    private EcomSpecialOrderService ecomSpecialOrderService;

    @PostMapping("/import")
    @ApiOperation("导入特殊单")
    @YouliBusLog(api = "/api/etl/ecom/specialOrder/import", ...)
    public CommonResult<Long> importSpecialOrder(@RequestParam("file") MultipartFile file) {
        try {
            UserDetailVo currentUser = getCurrentUser();
            return CommonResult.succeed(ecomSpecialOrderService.importSpecialOrder(file, currentUser));
        } catch (YouliBusinessException e) {
            return CommonResult.failed(e.getMsg());
        } catch (Exception e) {
            log.error("导入异常，fileName={}", file.getOriginalFilename(), e);
            return CommonResult.failed("导入失败，请检查文件格式");
        }
    }
}
```

### 不需要在 Controller 捕获的异常

```java
// 全局异常处理器会自动处理，不需要 try-catch
@PostMapping("/save")
public CommonResult<Void> save(@RequestBody @Valid OrderForm form) {
    // YouliBusinessException 会被 GlobalExceptionHandler 捕获
    return CommonResult.succeed(orderService.save(form));
}
```

## Service 层异常处理

### 事务与异常

```java
@Service
public class OrderServiceImpl implements OrderService {

    @Transactional(rollbackFor = Exception.class)
    @Override
    public void processOrder(Long orderId) {
        // 业务异常 — 应抛出，让事务回滚
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new YouliBusinessException("订单不存在");
        }

        // 更新操作
        order.setStatus("PROCESSING");
        orderMapper.updateById(order);

        // 如果这里抛出 RuntimeException，事务会回滚
    }
}
```

### 异常转换

```java
@Service
public class ExternalServiceImpl implements ExternalService {

    @Resource
    private ThirdPartyClient thirdPartyClient;

    @Override
    public ThirdPartyResult callThirdParty(Long id) {
        try {
            return thirdPartyClient.invoke(id);
        } catch (Exception e) {
            // 转换为业务异常
            log.error("第三方调用失败，id={}", id, e);
            throw new YouliBusinessException("调用第三方服务失败，请稍后重试");
        }
    }
}
```

## 禁止的行为

- ❌ 禁止捕获异常后不处理（吞掉异常）
  ```java
  // 错误
  try {
      doSomething();
  } catch (Exception e) {
      // 什么都不做
  }

  // 正确
  try {
      doSomething();
  } catch (Exception e) {
      log.warn("操作失败，原因是：{}", e.getMessage());
      throw new YouliBusinessException("操作失败");
  }
  ```

- ❌ 禁止直接抛出 `Exception`
  ```java
  // 错误
  throw new Exception("错误");

  // 正确
  throw new YouliBusinessException("错误");
  ```

- ❌ 禁止在日志中记录敏感信息
  ```java
  // 错误
  log.error("密码错误，password={}", password);

  // 正确
  log.warn("登录失败，用户名={}", username);
  ```

- ❌ 禁止使用异常控制业务逻辑
  ```java
  // 错误
  try {
      findOrder();
  } catch (YouliBusinessException e) {
      // 不存在则创建
      createOrder();
  }

  // 正确
  Order order = findOrder();
  if (order == null) {
      order = createOrder();
  }
  ```

## 异常日志规范

```java
// INFO — 正常业务流程中的重要节点
log.info("订单已创建，orderId={}", orderId);

// WARN — 业务异常（可恢复）
log.warn("库存不足，skuId={}, 当前库存={}", skuId, stock);

// ERROR — 系统异常（需要排查）
log.error("查询订单异常，orderId={}", orderId, e);

// ERROR — 第三方服务异常
log.error("第三方接口调用失败，vendor=xxx, orderId={}", orderId, e);
```

## 参考

- 阿里巴巴 Java 开发手册：异常处理规约
- Spring Boot 异常处理：https://docs.spring.io/spring-boot/docs/2.2.9.RELEASE/reference/htmlsingle/#boot-features-error-handling
