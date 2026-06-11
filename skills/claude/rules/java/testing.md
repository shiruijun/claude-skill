---
paths:
  - "**/*.java"
---
# Java 测试规范

> 本文件扩展自 [common/testing.md](../common/testing.md)，适用于 **MyBatis-Plus + Spring Boot 2.2.9** 项目。

## 测试框架

| 层级 | 框架 | 说明 |
|------|------|------|
| 单元测试 | JUnit 4 + Mockito | Service 层逻辑测试 |
| 集成测试 | Spring Boot Test + H2 | Controller + Service 层 |
| 数据库测试 | Testcontainers MySQL | 需要真实 MySQL 的场景 |

## 测试目录结构

```
src/test/java/com/xiaogj/youli/{domain}/
├── service/                  # Service 单元测试
│   └── EcomSpecialOrderServiceTest.java
├── controller/               # Controller 测试
│   └── EcomSpecialOrderControllerTest.java
└── integration/             # 集成测试
    └── EcomSpecialOrderIT.java
```

## 单元测试模式（Service）

```java
@RunWith(MockitoJUnitRunner.class)
public class EcomSpecialOrderServiceTest {

    @Mock
    private EcomSpecialOrderMapper ecomSpecialOrderMapper;

    @InjectMocks
    private EcomSpecialOrderServiceImpl ecomSpecialOrderService;

    @Test
    public void queryPage_正常返回分页数据() {
        // Arrange
        Long companyId = 1L;
        EcomSpecialOrderPageRo ro = new EcomSpecialOrderPageRo();
        ro.setCompanyId(companyId.toString());

        Page<EcomSpecialOrderDo> mockPage = new Page<>(1, 10);
        mockPage.setRecords(Arrays.asList(new EcomSpecialOrderDo(), new EcomSpecialOrderDo()));
        mockPage.setTotal(2);

        when(ecomSpecialOrderMapper.selectPage(any(), any())).thenReturn(mockPage);

        // Act
        IPage<EcomSpecialOrderPageVo> result = ecomSpecialOrderService.queryPage(ro);

        // Assert
        assertThat(result.getTotal()).isEqualTo(2);
        assertThat(result.getRecords()).hasSize(2);
    }

    @Test(expected = YouliBusinessException.class)
    public void queryPage_无权限_抛出异常() {
        // Arrange
        EcomSpecialOrderPageRo ro = new EcomSpecialOrderPageRo();
        ro.setCompanyId(null);

        // Act
        ecomSpecialOrderService.queryPage(ro);
    }
}
```

## 集成测试模式（Controller）

使用 `@SpringBootTest` + `MockMvc`：

```java
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class EcomSpecialOrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void queryPage_正常返回() throws Exception {
        EcomSpecialOrderPageRo ro = new EcomSpecialOrderPageRo();
        ro.setCompanyId("1");
        ro.setPageNum(1);
        ro.setPageSize(10);

        mockMvc.perform(post("/api/etl/ecom/specialOrder/queryPage")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ro)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }
}
```

## MyBatis-Plus Mapper 测试

使用内嵌 H2 数据库：

```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class EcomSpecialOrderMapperTest {

    @Autowired
    private EcomSpecialOrderMapper mapper;

    @Test
    public void selectPage_正常查询() {
        LambdaQueryWrapper<EcomSpecialOrderDo> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(EcomSpecialOrderDo::getCompanyId, 1L);

        Page<EcomSpecialOrderDo> page = new Page<>(1, 10);
        Page<EcomSpecialOrderDo> result = mapper.selectPage(page, wrapper);

        assertThat(result.getTotal()).isGreaterThanOrEqualTo(0);
    }
}
```

application-test.yml 配置：
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1
    driver-class-name: org.h2.Driver
    username: sa
    password:
  h2:
    console:
      enabled: true
```

## 测试命名规范

使用中文方法名（项目惯例）：

```java
@Test
public void queryPage_订单存在_返回分页数据() { }

@Test
public void queryPage_公司ID为空_抛出参数异常() { }

@Test
public void importSpecialOrder_文件格式错误_返回失败() { }
```

## 覆盖率目标

- **行覆盖率 >= 80%**
- 使用 JaCoCo 生成报告
- 重点覆盖：Service 业务逻辑、复杂查询条件

```bash
# Maven 生成覆盖率报告
mvn test jacoco:report
```

## 禁止的行为

- ❌ 测试中硬编码数据库连接
- ❌ 测试依赖外部真实数据库
- ❌ 测试不验证任何断言
- ❌ 测试覆盖 getter/setter
- ❌ 测试之间共享状态

## MyBatis-Plus 特定测试技巧

### 条件构造器测试

```java
@Test
public void testWrapper_条件组合() {
    LambdaQueryWrapper<EcomSpecialOrderDo> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(EcomSpecialOrderDo::getCompanyId, 1L)
           .like(StringUtils.isNotBlank("name"), EcomSpecialOrderDo::getName, "test")
           .orderByDesc(EcomSpecialOrderDo::getCreateTime);

    List<EcomSpecialOrderDo> result = mapper.selectList(wrapper);
    assertThat(result).isNotNull();
}
```

### 分页测试

```java
@Test
public void testPagination_第二页() {
    Page<EcomSpecialOrderDo> page = new Page<>(2, 10);

    LambdaQueryWrapper<EcomSpecialOrderDo> wrapper = new LambdaQueryWrapper<>();
    wrapper.orderByDesc(EcomSpecialOrderDo::getCreateTime);

    Page<EcomSpecialOrderDo> result = mapper.selectPage(page, wrapper);

    assertThat(result.getCurrent()).isEqualTo(2);
    assertThat(result.getSize()).isEqualTo(10);
}
```

## 参考

- Spring Boot Test: https://docs.spring.io/spring-boot/docs/2.2.9.RELEASE/reference/htmlsingle/#boot-features-testing
- MyBatis-Plus: https://baomidou.com/pages/24112f/
- JUnit 4: https://junit.org/junit4/
