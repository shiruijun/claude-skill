---
paths:
  - "**/*.java"
---
# Java 编码规范

> 本文件扩展自 [common/coding-style.md](../common/coding-style.md)，适用于 **Java 8 + Spring Boot 2.2.9 + MyBatis-Plus 3.4.1** 项目。

## 格式化

- 使用 **Alibaba Java Coding Guidelines**（阿里巴巴 Java 开发手册）规范
- 缩进：4 空格
- 文件编码：UTF-8
- 作者：`%USERNAME%`，时间戳格式：`yyyy-MM-dd HH:mm:ss`

## 命名约定

| 类型 | 规范 | 示例 |
|------|------|------|
| 类、接口、枚举 | PascalCase | `OrderService`, `OrderStatusEnum` |
| 方法、参数、变量 | camelCase | `findById`, `orderId` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 包名 | 全小写，反向域名 | `com.xiaogj.youli.crm` |

## DTO/VO/RO 命名

```
*Controller  → 接收 RO (Request Object)
*Service      → 处理 DTO (Data Transfer Object)
*Controller  → 返回 VO (View Object)
```

- `Ro` 后缀：请求参数对象
- `Vo` 后缀：响应视图对象
- `Dto` 后缀：数据传输对象

```java
// 请求对象
public class EcomSpecialOrderPageRo { }

// 响应对象
public class EcomSpecialOrderPageVo { }

// 内部数据传输
public class TbSoldGoodsDto { }
```

## 不可变性原则

- 将字段声明为 `final`（尽量）
- 对外返回防御性拷贝：`Collections.unmodifiableList()` 或 Guava `ImmutableList`
- 避免在实体中直接修改，通过 Service 层处理状态变更

```java
// 好 — 防御性拷贝
public List<LineItem> getItems() {
    return Collections.unmodifiableList(this.items);
}

// 好 — 使用 ImmutableList
import com.google.common.collect.ImmutableList;
public List<LineItem> getItems() {
    return ImmutableList.copyOf(this.items);
}
```

## 依赖注入

**字段注入（项目惯例）**：
```java
@Resource
private OrderMapper orderMapper;
```

**Service 层使用构造函数注入（便于测试）**：
```java
@Service
public class EcomSpecialOrderServiceImpl implements EcomSpecialOrderService {

    private final EcomSpecialOrderMapper ecomSpecialOrderMapper;

    public EcomSpecialOrderServiceImpl(EcomSpecialOrderMapper ecomSpecialOrderMapper) {
        this.ecomSpecialOrderMapper = ecomSpecialOrderMapper;
    }
}
```

## MyBatis-Plus 规范

### Mapper 继承 BaseMapper

```java
@Mapper
public interface EcomSpecialOrderMapper extends BaseMapper<EcomSpecialOrderDo> {
}
```

### XML 映射文件位置
```
src/main/resources/mapper/{subdomain}/*.xml
```

### 条件构造器使用

```java
// LambdaQueryWrapper 推荐写法
LambdaQueryWrapper<EcomSpecialOrderDo> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(EcomSpecialOrderDo::getCompanyId, companyId)
       .like(StringUtils.isNotBlank(name), EcomSpecialOrderDo::getName, name)
       .orderByDesc(EcomSpecialOrderDo::getCreateTime);
```

## Stream 和 Lambda（Java 8）

- 保持管道简短（最多 3-4 个操作）
- 优先使用方法引用
- 避免在 stream 中修改外部变量

```java
// 好
List<String> names = orders.stream()
    .map(Order::getCustomerName)
    .filter(StringUtils::isNotBlank)
    .collect(Collectors.toList());

// 坏 — 过长管道
List<String> names = orders.stream().map(Order::getCustomerName).filter(StringUtils::isNotBlank).distinct().sorted().collect(Collectors.toList());
```

## Optional 使用

- 从可能为空的方法返回 `Optional`
- 使用 `map()`、`flatMap()`、`orElseThrow()`
- 禁止 `Optional` 作为方法参数

```java
// 好
return Optional.ofNullable(order)
    .map(Order::getTotal)
    .orElseThrow(() -> new OrderNotFoundException(id));

// 坏 — Optional 作为参数
public void process(Optional<String> name) { }
```

## 异常处理

- 使用 `YouliBusinessException` 作为业务异常
- 使用 `CommonResult` 统一返回
- 禁止捕获后静默吞掉异常

```java
// Controller 层
try {
    return CommonResult.succeed(orderService.queryPage(ro));
} catch (YouliBusinessException e) {
    return CommonResult.failed(e.getMsg());
}

// 业务层
throw new YouliBusinessException("订单不存在，id=" + id);
```

## 校验规范

- 使用 JSR-303 注解在 DTO/RO 上校验
- 校验信息必须为中文

```java
public class EcomSpecialOrderPageRo {
    @NotBlank(message = "公司ID不能为空")
    private String companyId;

    @Size(max = 100, message = "名称不能超过100个字符")
    private String name;
}
```

## 日志规范

- 使用 Slf4j 日志门面
- 不记录敏感信息（密码、Token、PII）
- 使用占位符 `{}` 而非字符串拼接

```java
log.info("查询订单，id={}, companyId={}", id, companyId);
log.warn("订单不存在，id={}", id);
log.error("处理异常，orderId={}", orderId, ex);
```

## 分页规范

使用 **PageHelper**：

```java
PageHelper.startPage(ecomSpecialOrderPage.getPageNum(), ecomSpecialOrderPage.getPageSize());
Page<EcomSpecialOrderDo> page = (Page<EcomSpecialOrderDo>) ecomSpecialOrderMapper.selectPage(wrapper);
```

## 禁止的行为

- ❌ 硬编码魔法值（使用常量或枚举）
- ❌ 在 Service 中直接操作 Session/Transaction
- ❌ 使用 `String` 类型存储金额（使用 `BigDecimal`）
- ❌ `catch (Exception e)` 无处理
- ❌ `System.out.println`（使用日志）
- ❌ 未校验的用户输入直接拼接 SQL

## 参考

- [阿里巴巴 Java 开发手册（泰山版）](https://github.com/alibaba/p3c)
- MyBatis-Plus 文档：https://baomidou.com/pages/24112f/
