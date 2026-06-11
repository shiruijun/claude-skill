# Web Hooks

## PostToolUse

- **H5 类型检查**：编辑 H5 文件后 `cd jingbei-h5 && npx vue-tsc --noEmit`
- **格式化**：编辑后使用项目 prettier/eslint 入口点格式化

## PreToolUse

- **文件大小守卫**：写入内容超过 800 行时阻止，要求拆分为更小的模块

## Stop

- **构建验证**：会话结束前验证 PC 端和 H5 端构建是否通过

## 开发命令

```bash
# 严格按 package-lock.json 安装
npm ci

# 开发服务器
npm run dev

# 生产构建
npm run build
```
