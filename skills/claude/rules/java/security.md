---
paths:
  - "**/*.java"
---
# Java 安全规范

> 本文件扩展自 [common/security.md](../common/security.md)，适用于 **Spring Cloud + Nacos + MyBatis-Plus** 项目。

## 密钥与敏感信息管理

### 禁止硬编码

**严禁在源代码中硬编码以下任何信息：**

| 类型 | 示例 | 违规严重度 |
|------|------|-----------|
| API 密钥 | `private static final String API_KEY = "sk-xxx"` | 🔴 严重 |
| 数据库密码 | `password = "root123"` | 🔴 严重 |
| 第三方密钥 | `aliyunSecret = "xxx"` | 🔴 严重 |
| JWT 密钥 | `jwt.secret = "xxx"` | 🔴 严重 |
| 加密盐值 | `salt = "randomxxx"` | 🔴 严重 |
| 账号密码 | `username="admin", password="xxx"` | 🔴 严重 |
| 内部 IP/域名 | `internal.api.com` | 🟡 中等 |
| Token/Bearer | `Authorization: "Bearer xxx"` | 🔴 严重 |

```java
// ❌ 错误 — 硬编码密钥（任何形式都禁止）
private static final String API_KEY = "sk-live-abc123...";
private static final String DB_PASSWORD = "root123";
private static final String JWT_SECRET = "my-secret-key";
String token = "eyJhbGciOiJIUzI1NiJ9...";

// ❌ 错误 — 配置类中的硬编码
@Configuration
public class AppConfig {
    @Value("${aliyun.accessKey}")  // 硬编码在配置文件中也不行
    private String accessKey = "LTAIxxx";  // ← 禁止
}
```

### 正确做法

```java
// ✅ 正确 — 环境变量
String apiKey = System.getenv("PAYMENT_API_KEY");
Objects.requireNonNull(apiKey, "PAYMENT_API_KEY 环境变量未配置");

// ✅ 正确 — Nacos 配置中心（加密后）
@Value("${secret.aliyun-access-key}")
private String accessKey;

// ✅ 正确 — 配置属性类（引用配置，非硬编码值）
@Data
@ConfigurationProperties(prefix = "app.external")
public class ExternalConfig {
    private String apiKey;      // 从 application.yml 读取，非硬编码
    private String apiSecret;
}

// ✅ 正确 — 启动时校验
@PostConstruct
public void init() {
    Assert.hasText(apiKey, "API_KEY must be configured");
}
```

### 配置管理规范

```
# ❌ 禁止：application.yml 中明文配置
aliyun:
  access-key: LTAIxxx          # 禁止硬编码
  access-secret: xxx            # 禁止硬编码

# ✅ 正确：引用环境变量或 Nacos 配置
aliyun:
  access-key: ${ALIYUN_ACCESS_KEY}           # 从环境变量读取
  access-secret: ${ALIYUN_ACCESS_SECRET}      # 从环境变量读取
  # 或使用加密配置：值来自 Nacos 加密配置
```

### Git 安全

```properties
# .gitignore — 必须排除
application-local.yml           # 本地开发配置
application-prod.yml            # 生产配置
**/config/local/**             # 本地配置目录
**/secret/**                   # 密钥目录

# 必须提交：示例配置（无真实值）
application-example.yml        # 模板文件，变量用占位符
```

### 密钥轮换

- 定期轮换所有外部 API 密钥（每 3-6 个月）
- 生产密钥泄露后立即轮换
- 不同环境使用不同密钥

## SQL 注入防护

项目使用 MyBatis-Plus，**禁止字符串拼接 SQL**：

```java
// 错误 — SQL 注入风险
@Select("SELECT * FROM orders WHERE name = '" + name + "'")

// 正确 — 使用 LambdaQueryWrapper
wrapper.eq(EcomSpecialOrderDo::getName, name);

// 正确 — XML 使用 #{} 参数
<select id="selectByName" resultType="Order">
    SELECT * FROM orders WHERE name = #{name}
</select>
```

## 输入验证

- 使用 JSR-303 注解在 DTO/RO 上校验
- 校验失败抛出 `YouliBusinessException`
- 文件上传验证类型和大小

```java
public class EcomSpecialOrderPageRo {
    @NotBlank(message = "公司ID不能为空")
    private String companyId;

    @Size(max = 100, message = "名称不能超过100个字符")
    private String name;
}

// Controller 层
public CommonResult<EcomSpecialOrderPageVo> queryPage(@RequestBody @Valid EcomSpecialOrderPageRo ro) {
    // ...
}
```

## 文件上传安全

```java
// 验证文件类型
private static final Set<String> ALLOWED_TYPES = new HashSet<>(Arrays.asList("xlsx", "xls"));

public void validateFile(MultipartFile file) {
    String filename = file.getOriginalFilename();
    String ext = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    if (!ALLOWED_TYPES.contains(ext)) {
        throw new YouliBusinessException("只支持 Excel 文件");
    }
    if (file.getSize() > 10 * 1024 * 1024) {
        throw new YouliBusinessException("文件大小不能超过 10MB");
    }
}
```

## 认证和授权

- 使用 `BaseController.getCurrentUser()` 获取当前用户
- 在 Service 层校验 `companyId` 租户权限
- 禁止绕过租户隔离查询

```java
// 好 — 校验租户权限
Long currentCompanyId = getCurrentUserCompanyId();
if (!entity.getCompanyId().equals(currentCompanyId)) {
    throw new YouliBusinessException("无权操作此数据");
}

// 坏 — 未校验租户权限
return mapper.selectById(id);
```

## 敏感数据处理

- 日志中禁止记录：密码、Token、身份证号、手机号
- 使用字段脱敏工具类

```java
// 脱敏工具（项目应有此类）
public static String maskPhone(String phone) {
    if (phone == null) return null;
    return phone.substring(0, 3) + "****" + phone.substring(7);
}

public static String maskIdCard(String idCard) {
    if (idCard == null) return null;
    return idCard.substring(0, 6) + "********" + idCard.substring(14);
}
```

## 接口限流

使用 Sentinel 保护接口：

```java
@SentinelResource(value = "queryPage", blockHandler = "queryPageBlock")
public CommonResult<EcomSpecialOrderPageVo> queryPage(EcomSpecialOrderPageRo ro) {
    // ...
}

public CommonResult<EcomSpecialOrderPageVo> queryPageBlock(EcomSpecialOrderPageRo ro, BlockException ex) {
    return CommonResult.failed("请求过于频繁，请稍后重试");
}
```

## XXL-JOB 定时任务安全

- 任务执行记录详细日志
- 失败重试机制配置
- 禁止在任务中硬编码敏感信息

## Nacos 配置安全

- 命名空间隔离不同环境
- 使用加密配置而非明文密码
- 定期轮换密钥

## 错误消息

- API 响应不暴露堆栈跟踪、SQL 错误、内部路径
- 使用通用错误消息 + 日志记录详情

```java
try {
    return orderService.findById(id);
} catch (OrderNotFoundException ex) {
    log.warn("订单不存在，id={}", id);
    return CommonResult.failed("订单不存在");
} catch (Exception ex) {
    log.error("查询订单异常，id={}", id, ex);
    return CommonResult.failed("系统异常，请稍后重试");
}
```

## 依赖安全

- 定期检查 `mvn dependency:tree` 审计依赖
- 使用 OWASP Dependency-Check 扫描 CVE
- 关注 fastjson 漏洞，及时升级版本

## 参考

- 阿里巴巴 Java 开发手册安全规约
- Spring Cloud Security: https://spring.io/projects/spring-cloud-security
- MyBatis-Plus 安全: https://baomidou.com/pages/24112f/#安全
