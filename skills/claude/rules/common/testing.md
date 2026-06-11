# 测试要求

## 核心原则

**每次代码变更后必须执行测试，测试不通过禁止提交代码。**

---

## 强制测试执行

### 代码变更后必做

1. **运行所有相关单元测试**
2. **运行集成测试**（如涉及数据库/API/外部服务）
3. **测试不通过 → 禁止提交代码**
4. 测试覆盖率必须达标（≥80%）

### 禁止的行为

- 禁止跳过测试或使用 `--skipTests` 提交代码
- 禁止注释掉失败的测试
- 禁止修改测试以绕过检查（除非测试本身有误）
- 禁止提交已知失败的测试

### 提交前检查清单

- [ ] 所有单元测试通过
- [ ] 所有集成测试通过
- [ ] 测试覆盖率 ≥ 80%
- [ ] 无被注释或跳过的测试
- [ ] 新功能有对应的测试用例

---

## 最低测试覆盖率：80%

测试类型（全部必需）：
1. **单元测试** - 单个函数、工具、组件
2. **集成测试** - API 端点、数据库操作
3. **E2E 测试** - 关键用户流程（框架根据语言选择）

---

## 测试驱动开发

强制工作流：
1. 先写测试（RED）
2. 运行测试 - 应该失败
3. 编写最小实现（GREEN）
4. 运行测试 - 应该通过
5. 重构（IMPROVE）
6. 验证覆盖率（80%+）

---

## 测试失败排查

1. 使用 **tdd-guide** agent
2. 检查测试隔离
3. 验证模拟是否正确
4. 修复实现，而非测试（除非测试本身有误）

---

## 代理支持

- **tdd-guide** - 主动用于新功能，强制先写测试
- **code-reviewer** - 审查测试覆盖率是否达标

---

## 测试结构（AAA 模式）

优先使用 Arrange-Act-Assert 结构：

```typescript
test('calculates similarity correctly', () => {
  // Arrange
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert
  expect(similarity).toBe(0)
})
```

### 测试命名

使用描述性名称解释被测试的行为：

```typescript
test('returns empty array when no markets match query', () => {})
test('throws error when API key is missing', () => {})
test('falls back to substring search when Redis is unavailable', () => {})
```

---

## 本地测试命令参考

### Java / Maven

```bash
# 运行所有测试
mvn test

# 运行特定测试类
mvn test -Dtest=OrderServiceTest

# 运行特定测试方法
mvn test -Dtest=OrderServiceTest#findById_existingOrder

# 生成覆盖率报告
mvn test jacoco:report
```

### 前端 / Node.js

```bash
# 运行单元测试
npm run test:unit

# 运行 E2E 测试
npm run test:e2e

# 运行测试并生成覆盖率
npm run test:coverage
```
