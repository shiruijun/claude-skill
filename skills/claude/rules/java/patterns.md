---
paths:
  - "**/*.java"
---
# Java 设计模式

> 本文件扩展自 [common/patterns.md](../common/patterns.md)，适用于 **MyBatis-Plus + Spring Cloud + Nacos** 项目。

## 项目包结构

```
com.xiaogj.youli.{domain}/
├── {DomainApplication}.java       # 启动类
├── api/                           # Feign 接口和 Controller
│   └── jingbei/
│       ├── *Controller.java
│       ├── ro/*Ro.java            # 请求对象
│       └── vo/*Vo.java            # 响应对象
├── app/{subdomain}/               # 业务实现
│   ├── dto/                       # 内部数据传输对象
│   ├── enums/                     # 枚举
│   ├── mapper/                    # MyBatis-Plus Mapper
│   ├── model/                     # 实体 DO
│   └── service/
│       └── impl/*ServiceImpl.java
├── common/                        # 服务内共享
└── task/                          # XXL-JOB 定时任务
```

## 分层架构

```
Controller (api/)     → 接收请求、参数校验、统一响应
    ↓
Service (app/)        → 业务逻辑、事务管理
    ↓
Mapper (app/)         → 数据访问（MyBatis-Plus）
```

## Controller 层规范

```java
@RestController
@RequestMapping("/api/etl/ecom/specialOrder")
@Api(tags = "电商特殊单管理")
public class EcomSpecialOrderController extends BaseController {

    @Resource
    private EcomSpecialOrderService ecomSpecialOrderService;

    @PostMapping("queryPage")
    @ApiOperation(value = "分页查询", response = EcomSpecialOrderPageVo.class)
    public CommonResult<EcomSpecialOrderPageVo> queryPage(
            @RequestBody EcomSpecialOrderPageRo ecomSpecialOrderPage) {
        // 获取当前用户公司ID
        ecomSpecialOrderPage.setCompanyId(this.getCurrentUser().getCompanyId());
        return CommonResult.succeed(ecomSpecialOrderService.queryPage(ecomSpecialOrderPage));
    }
}
```

**Controller 要点：**
- 继承 `BaseController` 获取 `getCurrentUser()`
- 使用 `@ApiOperation` 描述接口
- 调用 Service 层，不写业务逻辑
- 统一返回 `CommonResult<T>`

## Service 层规范

```java
@Service
public class EcomSpecialOrderServiceImpl implements EcomSpecialOrderService {

    @Resource
    private EcomSpecialOrderMapper ecomSpecialOrderMapper;

    @Transactional(rollbackFor = Exception.class)
    @Override
    public boolean save(EcomSpecialOrderDo entity) {
        // 前置校验
        validate(entity);
        return mapper.insert(entity) > 0;
    }

    private void validate(EcomSpecialOrderDo entity) {
        if (entity.getCompanyId() == null) {
            throw new YouliBusinessException("公司ID不能为空");
        }
    }
}
```

**Service 要点：**
- 接口与实现分离：`*Service` 接口 + `*ServiceImpl` 实现
- 事务注解 `@Transactional`
- 业务逻辑集中在此层
- 使用 `YouliBusinessException` 抛出业务异常

## Mapper 层规范

```java
@Mapper
public interface EcomSpecialOrderMapper extends BaseMapper<EcomSpecialOrderDo> {

    /**
     * 自定义分页查询
     */
    IPage<EcomSpecialOrderDo> selectCustomPage(Page<EcomSpecialOrderDo> page,
                                                @Param("companyId") Long companyId,
                                                @Param("name") String name);
}
```

XML 映射：

```xml
<mapper namespace="com.xiaogj.youli.data.etl.app.jingbei.mapper.EcomSpecialOrderMapper">

    <select id="selectCustomPage" resultType="com.xiaogj.youli.data.etl.app.jingbei.model.EcomSpecialOrderDo">
        SELECT * FROM t_yl_ecom_special_order
        WHERE company_id = #{companyId}
        <if test="name != null and name != ''">
            AND name LIKE CONCAT('%', #{name}, '%')
        </if>
    </select>
</mapper>
```

## 统一响应封装

项目使用 `CommonResult`：

```java
public class CommonResult<T> {
    private int code;
    private String msg;
    private T data;

    public static <T> CommonResult<T> succeed(T data) { }
    public static <T> CommonResult<T> failed(String msg) { }
    public static <T> CommonResult<T> failed(int code, String msg) { }
}
```

## 业务异常处理

```java
// 业务异常
throw new YouliBusinessException("操作失败，原因是...");

// 全局异常处理（@ControllerAdvice）
@ExceptionHandler(YouliBusinessException.class)
public CommonResult<Void> handleBusiness(YouliBusinessException e) {
    log.warn("业务异常：{}", e.getMsg());
    return CommonResult.failed(e.getMsg());
}
```

## 多租户实现

项目使用 `company_id` 隔离租户：

```java
// 在 Service 层自动注入 companyId
public IPage<EcomSpecialOrderPageVo> queryPage(EcomSpecialOrderPageRo ro) {
    Long companyId = getCurrentUserCompanyId(); // 从上下文获取
    ro.setCompanyId(companyId.toString());
    // 查询时自动带上 companyId 条件
}
```

## 分布式 ID

使用雪花算法或数据库自增（根据项目配置）：

```java
// 实体主键
@TableName("t_yl_ecom_special_order")
public class EcomSpecialOrderDo {

    @TableId(type = IdType.ASSIGN_ID)  // 雪花ID
    private Long id;
}
```

## 业务日志

使用 `@YouliBusLog` 记录操作日志：

```java
@PostMapping("/import")
@YouliBusLog(
    api = "/api/etl/ecom/specialOrder/import",
    app = "数据同步",
    module = "电商特殊单管理",
    type = "导入特殊单",
    success = "导入特殊单成功",
    fail = "导入特殊单失败:{{#_errMsg}}"
)
public CommonResult<Long> importSpecialOrder(@RequestParam("file") MultipartFile file) {
    // ...
}
```

## 缓存使用

项目使用 **Caffeine**（本地缓存）+ **Redis**（分布式缓存）：

```java
// 本地缓存（Caffeine）
@Cacheable(value = "dict", key = "#code")
public DictVo getDictByCode(String code) { }

// Redis 缓存
@Resource
private RedissonClient redissonClient;

public void lock(String key) {
    RLock lock = redissonClient.getLock(key);
    lock.lock();
    try {
        // 业务逻辑
    } finally {
        lock.unlock();
    }
}
```

## 分页查询模式

```java
@Override
public IPage<EcomSpecialOrderPageVo> queryPage(EcomSpecialOrderPageRo ro) {
    // 1. 设置分页
    Page<EcomSpecialOrderDo> page = new Page<>(ro.getPageNum(), ro.getPageSize());

    // 2. 构建查询条件
    LambdaQueryWrapper<EcomSpecialOrderDo> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(EcomSpecialOrderDo::getCompanyId, Long.parseLong(ro.getCompanyId()))
           .like(StringUtils.isNotBlank(ro.getName()), EcomSpecialOrderDo::getName, ro.getName())
           .orderByDesc(EcomSpecialOrderDo::getCreateTime);

    // 3. 执行查询
    Page<EcomSpecialOrderDo> result = mapper.selectPage(page, wrapper);

    // 4. 转换返回
    return result.convert(this::convertToVo);
}

private EcomSpecialOrderPageVo convertToVo(EcomSpecialOrderDo do) {
    EcomSpecialOrderPageVo vo = new EcomSpecialOrderPageVo();
    vo.setId(do.getId());
    vo.setName(do.getName());
    // ... 其他字段映射
    return vo;
}
```

## Feign 调用模式

```java
// 1. 在 API 模块定义 Feign 接口
@FeignClient(name = "xiaogj-youli-mdm")
public interface MdmFeignClient {

    @GetMapping("/api/mdm/goods/{id}")
    CommonResult<GoodsVo> getGoodsById(@PathVariable("id") Long id);
}

// 2. 在消费端调用
@Resource
private MdmFeignClient mdmFeignClient;

public GoodsVo getGoods(Long goodsId) {
    CommonResult<GoodsVo> result = mdmFeignClient.getGoodsById(goodsId);
    if (result.isSuccess()) {
        return result.getData();
    }
    throw new YouliBusinessException("商品不存在");
}
```

## Skill 引用

当进行以下工作时，使用对应 skill：

| 工作场景 | Skill |
|---------|-------|
| MyBatis-Plus CRUD | `mybatis-plus` |
| LambdaQueryWrapper 条件构建 | `mybatis-plus` |
| 分页查询 | `mybatis-plus` |
| Spring Boot 架构设计 | `springboot-patterns` |
| Feign 服务调用 | `springboot-patterns` |
| Nacos 配置管理 | `springboot-patterns` |
| Sentinel 限流熔断 | `springboot-patterns` |

## 参考

- MyBatis-Plus: https://baomidou.com/pages/24112f/
- Spring Cloud Alibaba: https://github.com/alibaba/spring-cloud-alibaba
- Alibaba Java Coding Standards: https://github.com/alibaba/p3c
