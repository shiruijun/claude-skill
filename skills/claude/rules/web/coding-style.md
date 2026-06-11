# Web 前端开发规范

> 适用于经贝管家前端项目。PC 端 `xiaogj-youli-platform-web` + H5 端 `jingbei-h5`。
> 项目特有的技术栈、目录结构、组件库路径、图标规范、开发命令、代理配置等，参见各自项目的 `CLAUDE.md`。

## 性能约束

- 图片必须有 `width` / `height` 属性，防止 CLS
- 非首屏图片加 `loading="lazy"`
- 第三方脚本异步加载（`async` / `defer`）
- 动画只动 `transform` / `opacity`
- 重型库动态导入：`const lib = await import('lib')`
- Bundle 预算：落地页 JS < 150KB gzip，应用页 < 300KB

## 安全约束

- 禁止 `v-html` 渲染用户输入（XSS）
- Element UI `dangerouslyUseHTMLString` 仅限受控数据
- 文件上传组件必须校验类型和大小，禁止信任客户端文件名后缀
- 敏感信息禁止 `console.log`

## 日志与调试

- 开发调试可用 `console.log`，**提交前必须清理**
- 禁止提交包含 `console.log` 的代码到生产分支

## 列表与表格规范

- **金额列必须右对齐**（`align="right"`），便于纵向比较
- 金额显示使用 `formatMoney` 格式化（千分位 + 两位小数）

## 禁止的行为

- 直接修改 props（使用 emit）
- 在模板中写复杂计算（提取到 computed）
- `style` 中不使用 `scoped`（全局样式除外）
- 深层相对路径引用（如 `../../../utils`）
- 图片无 width/height 属性
- 重型库全量导入（应动态导入）
