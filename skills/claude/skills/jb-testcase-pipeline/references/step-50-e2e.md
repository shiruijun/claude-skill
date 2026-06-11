# Step 5: E2E 测试生成（Playwright）

## 输入依据

生成 E2E 测试脚本前，必须读取以下内容：

| 优先级 | 输入 | 路径 | 用途 | 必须 |
|--------|------|------|------|------|
| 1 | 测试用例 | `{需求目录}/test/case/cases.md` | 黑盒测试用例（TC-BB-*），作为 E2E 测试场景来源 | 是 |
| 2 | 测试数据 | `{需求目录}/test/case/testdata.md` | 测试数据（Mock、边界值），用于填充 E2E 测试参数 | 是 |
| 3 | 源代码页面组件 | 项目中 `views/**/*.vue` | DOM 结构、选择器、交互模式 | 是 |
| 4 | PRD | `{需求目录}/prd.md` | 需求背景，理解用户操作流程 | 推荐 |
| 5 | 已有 E2E 测试 | `{e2e-output}/features/**/*.spec.ts` | 项目约定、Page Object 模式、选择器风格 | 推荐 |

**需求目录结构：**
```
{需求目录}/
├── prd.md                    # PRD
├── spec.md                   # 技术设计
├── test/
│   └── case/
│       ├── cases.md          # 测试用例说明书
│       └── testdata.md       # 测试数据文档
└── design/
    ├── backend/
    └── frontend/
```

**生成流程：**
1. 读取 cases.md 中的黑盒用例（TC-BB-*），提取测试场景和步骤
2. 搜索源代码页面组件，分析 DOM 结构和 CSS 选择器
3. 参考已有 E2E 测试，匹配项目约定
4. 生成 Page Object + 测试脚本

## 前置条件

- `tests/e2e/` 目录已存在或需要创建
- `playwright.config.ts` 已配置
- `tests/e2e/global-setup.ts` 已实现登录逻辑
- **同一路由禁止新建 spec 文件**：生成前必须检查 `features/` 下是否已有同路由的 spec 文件，有则追加 `test.describe`，无则新建

## 输出路径配置

E2E 测试脚本的输出路径按优先级查找：

1. **命令参数**：`--e2e-output <path>`（如 `/jb-testcase-pipeline v6.8.8 --e2e-output D:\work\Test\tests\e2e`）
2. **自动搜索 + 用户选择**：搜索工作区中所有 `tests/e2e/` 目录，列出选项让用户选择
3. **默认值**：`{baseDir}/tests/e2e/`（baseDir 为 ai-doc 迭代目录对应的项目根目录）

**搜索 + 选择逻辑：**
```bash
# 搜索所有 tests/e2e 目录（从工作区根目录开始）
find "$WORKSPACE" -maxdepth 5 -type d -name "e2e" 2>/dev/null | grep "tests/e2e"

# 列出选项让用户选择（使用 AskUserQuestion）
# 默认推荐第一项（记忆用户偏好）
```

**用户选择后记住**：将选择的路径保存到 memory，下次生成 E2E 时默认使用该路径。

## 目录结构（公共抽离 + 端隔离 + 动态模块）

```
tests/e2e/
├── shared/                              # 公共（PC + H5 共用）
│   ├── pages/
│   │   └── BasePage.ts                  # 基类（goto、click、fill 等通用方法）
│   └── fixtures/                        # 公共测试数据
│       └── *.ts
│
├── pc/                                  # PC 端（Element UI，admin 后台）
│   ├── pages/                           # PC 端 Page Object（继承 shared/pages/BasePage）
│   │   └── *.ts
│   ├── fixtures/                        # PC 端测试数据
│   │   └── *.ts
│   └── features/                        # PC 端测试用例（按路由自动推断模块）
│       └── {模块名}/
│           └── {路由名}.spec.ts
│
├── h5/                                  # 移动端 H5（Vant 4，jingbei-h5）
│   ├── pages/                           # H5 端 Page Object（继承 shared/pages/BasePage）
│   │   └── *.ts
│   ├── fixtures/                        # H5 端测试数据
│   │   └── *.ts
│   └── features/                        # H5 端测试用例（按 功能模块 组织）
│       └── {模块名}/
│           └── {路由名}.spec.ts
│
├── global-setup.ts                      # 全局初始化（登录、存储 storageState）
├── global-teardown.ts                   # 全局清理
├── README.md
└── .auth/                               # 认证状态存储（自动生成）
    └── user.json
```

**模块名推断规则：**
- 从项目的路由文件（如 `router.js`）中读取 `meta.title` 或 `children` 分组
- 如果路由有 `meta.module` 字段，使用该值作为模块名
- 如果没有明确分组，使用路由路径的第一段（如 `/approval-set` → `approval-set`）
- **禁止硬编码模块名**，必须从实际路由配置推断

## spec 文件命名规则

### 基本格式

```
{pc|h5}/features/{模块}/{菜单}/{路由名}.spec.ts
```

### 命名示例

```
pc/features/费控报销/我发起的/fee-apply.spec.ts           # 费用申请新增
pc/features/费控报销/我发起的/fee-apply-edit.spec.ts      # 费用申请编辑
pc/features/费控报销/我发起的/claim-form.spec.ts          # 报销单新增
pc/features/费控报销/我发起的/claim-form-edit.spec.ts     # 报销单编辑
pc/features/费控报销/我发起的/apply-for-payment-add.spec.ts    # 付款单新增
pc/features/费控报销/我发起的/apply-for-payment-edit.spec.ts   # 付款单编辑
```

### 同页面追加规则（必须遵循）

同一个页面的所有功能测试合并到一个 spec 文件，用 `test.describe` 分组。**生成前必须检查是否已有同路由 spec 文件**：

```typescript
// claim-list.spec.ts
test.describe('报销单列表 - 默认展示', () => { ... });
test.describe('报销单列表 - 筛选查询', () => { ... });
// 以后新增功能，追加 test.describe 即可，不新建文件
```

## 文件命名约定

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| Page Object | `PascalCase.ts` | `SearchSelectorPage.ts`、`BatchSubjectPage.ts` |
| spec 文件 | `{路由名}.spec.ts` | `fee-apply.spec.ts`、`claim-form-edit.spec.ts` |
| 测试数据 | `{功能名}-test-data.ts` | `search-selector-test-data.ts` |

## 公共调用原则（必须遵循）

生成 E2E 脚本前，必须读取已有脚本（`tests/e2e/**/*.spec.ts`、`tests/e2e/pages/*.ts`、`tests/e2e/fixtures/*.ts`），提取并遵循以下约定：

### Page Object 约定

```typescript
// 1. 继承 BasePage（从 shared 导入）
//    PC: import { BasePage } from '../../shared/pages/BasePage';
//    H5: import { BasePage } from '../../shared/pages/BasePage';
import { BasePage } from '../../shared/pages/BasePage';
export class XxxPage extends BasePage {
  // 2. 使用 readonly Locator 声明元素
  readonly someButton: Locator;

  constructor(page: Page) {
    super(page);
    // 3. 选择器风格：.filter({ hasText: '...' }) 优先
    this.someButton = page.locator('.el-button').filter({ hasText: '按钮文字' }).first();
  }

  // 4. 方法命名：动作动词开头
  async doSomething() { await this.someButton.click(); }
  async isSomethingVisible(): Promise<boolean> { return this.someButton.isVisible(); }
}
```

### 测试文件约定

```typescript
// 1. 文件头注释：需求编号 + 功能说明 + 注意事项
/**
 * 功能名称 E2E 测试
 * 基于 OPT-dXXXX 需求
 *
 * 注意：部分测试需要 XXX 功能实现后才能运行
 */

// 2. 导入：test/expect + Page Object + 测试数据
import { test, expect } from '@playwright/test';
import { XxxPage } from '../pages/XxxPage';
import { testData } from '../fixtures/xxx-test-data';

// 3. describe + beforeEach 结构
test.describe('功能名称', () => {
  let xxxPage: XxxPage;

  test.beforeEach(async ({ page }) => {
    xxxPage = new XxxPage(page);
    await xxxPage.goto('/#/route');
    await page.waitForLoadState('networkidle');
  });

  // 4. 按 TC-BB-XXX 分组，使用注释分隔
  // ==================== TC-BB-001 用例名称 ====================
  test.describe('TC-BB-001 用例名称', () => {
    // 5. 未实现功能使用 test.skip
    test.skip('测试描述 - 等待功能实现', async ({ page }) => {
      // Arrange → Act → Assert
    });

    // 6. 已实现功能直接 test
    test('测试描述', async ({ page }) => {
      // ...
    });
  });
});
```

### 调试与容错约定

```typescript
// 1. 步骤日志：中文 + 步骤编号
console.log('【步骤1】等待页面加载');
console.log(`   当前URL: ${page.url()}`);

// 2. 异步容错：可选操作使用 .catch
await page.waitForLoadState('networkidle').catch(() => {});
await page.waitForTimeout(2000);

// 3. 性能测试：Date.now() 计时
//    断言阈值必须按照测试用例要求（如 TC-BB-xxx 中的 ≤ 1s），不能参照其他脚本的阈值
//    测试超时时间（第二个参数）只是给测试执行留足时间，不影响断言标准
const startTime = Date.now();
await xxxPage.doSomething();
const duration = Date.now() - startTime;
expect(duration).toBeLessThan(1000); // 按测试用例要求，如 ≤ 1s
}, 10000); // 测试超时，给执行留时间

// 4. API 监控：page.on('request') / page.on('response')
page.on('request', request => { /* ... */ });
page.on('response', async response => { /* ... */ });

// 5. 弹窗操作：.el-message-box__btns .el-button 选择器
const confirmBtn = page.locator('.el-message-box__btns .el-button--primary');
const cancelBtn = page.locator('.el-message-box__btns .el-button--default');

// 6. 复杂 DOM 操作：page.evaluate()
await page.evaluate(() => {
  const rows = document.querySelectorAll('.el-table__row');
  // ...
});
```

### 禁止的行为

- ❌ 不读取已有脚本就生成新脚本
- ❌ 硬编码 URL（使用 `baseURL` 变量）
- ❌ 不处理异步操作的错误（必须 `.catch`）
- ❌ 不加调试日志（必须 `console.log` 步骤）
- ❌ 跳过 test.skip 直接写 test（未实现功能必须 skip）

## 整体流程

```
Step 5: E2E 测试生成
┌─────────────────────────────────────────────────────────┐
│ 1. 探索项目结构                                          │
│    • 检查现有 E2E 测试约定（目录、命名、Page Object）    │
│    • 检查路由结构（hash mode vs history mode）           │
│    • 检查 UI 组件库（Element UI / Vant）                 │
├─────────────────────────────────────────────────────────┤
│ 2. 生成 Page Object                                     │
│    • 继承 BasePage                                       │
│    • 使用正确的 CSS 选择器                                │
│    • 处理弹窗/tooltip/tree 等交互                        │
├─────────────────────────────────────────────────────────┤
│ 3. 生成测试用例                                          │
│    • 按功能模块拆分 spec 文件                            │
│    • 使用 test.skip() 标记未实现功能                    │
│    • 每个 test.describe 对应一个测试场景                 │
├─────────────────────────────────────────────────────────┤
│ 4. 运行验证                                              │
│    • 运行测试，修复失败用例                              │
│    • 循环修正直到全部通过或正确跳过                      │
└─────────────────────────────────────────────────────────┘
```

## 代码影响点分析（必须执行）

生成测试用例前，**必须先搜索现有代码**，找出功能影响点：

```
Step 5 前置：代码影响点分析
┌─────────────────────────────────────────────────────────┐
│ 1. 读取 PRD，提取关键词                                  │
│    • 功能名称、实体名称（单据、模板、表单等）             │
│    • 相关操作（删除、编辑、复制等）                       │
│    • API 端点、路由路径                                  │
├─────────────────────────────────────────────────────────┤
│ 2. 在项目代码中搜索                                      │
│    • grep 关键词 → 定位页面组件                          │
│    • 读取页面组件 → 理解现有结构                         │
│    • 找到 API 调用 → 理解数据流                          │
├─────────────────────────────────────────────────────────┤
│ 3. 分析现有实现                                          │
│    • 模板/数据结构（data、computed、methods）            │
│    • 已有操作按钮（编辑、复制等）的实现方式              │
│    • 权限控制方式（__ps 等）                            │
│    • 确认弹窗模式（this.msgbox.confirm 等）              │
├─────────────────────────────────────────────────────────┤
│ 4. 输出影响点清单（写入 cases.md 头部）                  │
│    • 需要修改的文件 + 具体行号                           │
│    • 可复用的已有代码                                    │
│    • 需要新增的代码                                      │
└─────────────────────────────────────────────────────────┘
```

**搜索策略（按优先级）：**
1. `grep -r "功能关键词" src/jinbeiguanjia/views/` — 找页面
2. `grep -r "API端点" src/jinbeiguanjia/` — 找接口
3. `grep -r "路由路径" src/jinbeiguanjia/router.js` — 找路由
4. 读取找到的页面组件，理解完整结构
5. **验证数据库表名**（必须）：在后端项目中搜索 `@TableName` 注解确认实际表名和字段

**必须分析的页面组件结构：**
- `<template>` — 找到操作列、按钮、弹窗
- `data()` — 找到数据结构、表格字段
- `methods` — 找到已有操作方法（del、copy、edit 等）
- 权限控制 — 找到 `__ps('xxx')` 权限码

**必须验证的数据库信息：**
- 在后端项目中搜索 `@TableName` 注解，找到实际数据库表名
- 确认外键/关联字段（如 `formId`、`applyId`）
- 找到"已使用"判断的 SQL 逻辑（哪些表做了 count 或 exists 查询）
- 输出格式：`{逻辑名} → {实际表名}（Entity: {EntityClass}），关联：{table1}.{field} → {table2}.{field}`

**输出格式（写入 cases.md 头部）：**
```markdown
## 代码影响点分析

### 核心关联关系（实际数据库表名）

| 逻辑名 | 实际表名 | Entity 类 | 关键字段 |
|--------|----------|-----------|----------|
| 单据设置表 | t_yl_amb_form | FormDo | id, form_name, form_type |
| 审批申请表 | t_yl_approval_apply | ApprovalApplyDo | form_id → t_yl_amb_form.id |
| 费用申请单 | t_yl_approval_fee_form | ApprovalFeeFormDo | apply_id → t_yl_approval_apply.id |

**"已使用"判断逻辑**：`t_yl_approval_apply` 表中存在 `form_id` 匹配的记录

### 影响文件清单

| 影响文件 | 行号 | 影响类型 | 说明 |
|----------|------|----------|------|
| views/approval-set/list.vue | 278-287 | 修改 | 操作列新增删除按钮 |
| views/approval/approval-template.vue | 196-217 | 参考 | 已有 del(row) 方法 |

### 已有可复用代码
- `this.msgbox.confirm(...)` — 确认弹窗
- `this.ajax(...)` — API 调用封装
- `__ps('a390')` — 权限控制

### 需要新增的代码
- API 返回使用状态字段
- 删除前引用检查逻辑
```

## 关键约定（经贝管家项目）

### 路由格式

项目使用 **hash 路由**，URL 格式：
```
https://jbtest.xiaogj.com/#/{route}
```

常见路由：
| 页面 | 路由 |
|------|------|
| 报销单新增 | `/#/claim-form` |
| 费用申请新增 | `/#/fee-apply-add` |
| 付款单新增 | `/#/apply-for-payment-add` |
| 报销单列表 | `/#/claim-list` |
| 首页 | `/#/df-report-index` |

### 认证方式

使用手机号 + 验证码登录，通过 `global-setup.ts` 保存 `storageState`：
```typescript
// playwright.config.ts
use: {
  storageState: 'tests/e2e/.auth/user.json',
}
```

测试账号通过环境变量配置：
- `TEST_USERNAME` — 手机号
- `TEST_SMS_CODE` — 验证码（测试环境固定为 `111111`）

### global-setup.ts 实现（经贝项目）

```typescript
// tests/e2e/global-setup.ts
import { chromium, ChromiumBrowser } from '@playwright/test';

async function globalSetup() {
  const browser: ChromiumBrowser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 打开登录页
    await page.goto(process.env.BASE_URL || 'https://admin-test.xiaogj.com');

    // 2. 输入手机号
    await page.fill('input[type="text"]', process.env.TEST_USERNAME || '');

    // 3. 点击"发送验证码"
    await page.click('button:has-text("发送验证码")');

    // 4. 输入验证码（测试环境固定 111111）
    await page.fill('input[placeholder*="验证码"]', process.env.TEST_SMS_CODE || '111111');

    // 5. 点击登录
    await page.click('button[type="submit"]');

    // 6. 等待登录完成（跳转到首页）
    await page.waitForURL(/\/#\/|\/home/, { timeout: 10000 });

    // 7. 保存认证状态
    await page.context().storageState({
      path: 'tests/e2e/.auth/user.json',
    });

    console.log('Global setup completed');
  } finally {
    await browser.close();
  }
}

export default globalSetup;
```

**注意：** `BASE_URL` 必须与 `playwright.config.ts` 中的 `baseURL` 保持一致，避免认证状态与测试环境不匹配。

### UI 组件交互模式

#### 业务科目选择（tooltip/tree）

业务科目使用 `el-tooltip` + `el-tree`，不是 `el-dialog`：
```typescript
// 点击输入框触发 tooltip
await input.click();
// 等待 tooltip 出现
const tooltip = page.locator('.el-tooltip__popper').filter({ has: page.locator('.el-tree') });
await tooltip.waitFor({ state: 'visible', timeout: 5000 });
// 在树中选择节点
await tooltip.locator('.el-tree-node__content').filter({ hasText: subjectName }).click();
```

#### 新增明细按钮

页面可能有多个"新增明细"按钮（表头一个，表尾一个），用 `.last()` 取底部的：
```typescript
this.addDetailButton = page.locator('.el-button').filter({ hasText: '新增明细' }).last();
```

### 测试跳过策略

未实现的功能使用 `test.skip()` 并加注释：
```typescript
test.skip('批量应用后未分摊行科目正确填充 - 等待功能实现', async ({ page }) => {
  // 测试逻辑...
});
```

## Page Object 模板

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class XxxPage extends BasePage {
  readonly someButton: Locator;
  readonly someTable: Locator;

  constructor(page: Page) {
    super(page);
    this.someButton = page.locator('button').filter({ hasText: '按钮文字' }).first();
    this.someTable = page.locator('.el-table').first();
  }

  async doSomething() {
    await this.someButton.click();
  }

  async isSomethingVisible(): Promise<boolean> {
    return this.someButton.isVisible();
  }
}
```

## 测试文件模板

```typescript
import { test, expect } from '@playwright/test';
import { XxxPage } from '../pages/XxxPage';  // PC: 相对路径 pc/pages/，H5: h5/pages/

test.describe('功能名称', () => {
  let xxxPage: XxxPage;

  test.beforeEach(async ({ page }) => {
    xxxPage = new XxxPage(page);
    await xxxPage.goto('/#/route-path');
    await page.waitForLoadState('networkidle');
  });

  test('测试用例名称', async ({ page }) => {
    // Arrange - 准备
    // Act - 执行
    // Assert - 断言
    await expect(page.locator('.el-message--error')).not.toBeVisible();
  });

  test.skip('未实现功能 - 等待功能实现', async ({ page }) => {
    // 等功能实现后移除 test.skip
  });
});
```

## 常见错误与修复

| 错误 | 原因 | 修复 |
|------|------|------|
| `net::ERR_CONNECTION_REFUSED localhost:8080` | BasePage 默认 URL 错误 | 改为 `https://jbtest.xiaogj.com` |
| "新增明细" 按钮找不到 | 选了表头的按钮 | `.first()` → `.last()` |
| 页面显示首页而非目标页 | URL 格式错误 | 加 `/#/` 前缀 |
| "选择业务科目" dialog 超时 | 实际是 tooltip 不是 dialog | 改用 `.el-tooltip__popper` |
| 登录态失效 | 未复用 storageState | config 加 `storageState` |

## 运行命令

```bash
# 运行所有 E2E 测试
npx playwright test

# 带浏览器界面运行
npx playwright test --headed

# 运行指定端
npx playwright test pc/
npx playwright test h5/

# 运行指定模块
npx playwright test "pc/features/费控报销/"

# 运行指定文件
npx playwright test pc/features/费控报销/我发起的/batch-subject-claim.spec.ts

# 查看测试报告
npx playwright show-report
```

## 生成完成：改动汇总输出

E2E 测试脚本生成完成后，**必须自动输出改动汇总**，格式如下：

```
✅ E2E 测试脚本生成完成

📁 新增文件：
   {e2e-output}/
   ├── {pc|h5}/features/{模块}/{菜单}/{路由名}.spec.ts  # 测试脚本
   ├── {pc|h5}/pages/{PageName}.ts                                    # Page Object
   └── {pc|h5}/fixtures/{feature-name}-test-data.ts                   # 测试数据

📁 改动文件（如有）：
   {e2e-output}/{pc|h5}/pages/ExistingPage.ts     # 扩展已有 Page Object

📊 测试用例统计：
   - 可运行测试：{n} 条（现有功能验证）
   - 待实现测试：{n} 条（test.skip，等待功能开发）
   - 合计：{n} 条

▶️  运行测试：
   npx playwright test features/{feature-name}.spec.ts --headed

⏭️  下一步：
   - 功能开发完成后，将 test.skip() 改为 test() 启用测试
   - 运行测试验证功能正确性
```

**输出规则：**
1. 新增文件：本次生成的所有新文件
2. 改动文件：对已有文件的修改（如扩展现有 Page Object）
3. 统计数据：自动计算可运行和待实现的测试数量
4. 运行命令：给出可直接复制执行的命令
