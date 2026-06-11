# CLAUDE.md 个人化配置指南

## 背景与解决方案

由于团队成员的工作区目录路径不同（如 `D:\work\jb`、`E:\project\youli` 等），CLAUDE.md 文件中的路径和作者信息不能硬编码为固定值。

共享的 CLAUDE.md 已使用 `%WORKSPACE_ROOT%` 占位符，团队成员只需创建本地覆盖文件即可。

## 团队成员操作

### 创建 CLAUDE.md.local

在 `D:\work\jb\` 根目录创建 `CLAUDE.md.local` 文件：

```markdown
# CLAUDE.md.local

本文件为个人本地覆盖配置，**不提交到 Git**。

## 本地路径配置

**工作区根目录：** `D:\work\jb`

## 本地作者信息

作者：你的名字
```

### 创建 .gitignore

在 `D:\work\jb\` 根目录创建/更新 `.gitignore` 文件，确保排除本地覆盖文件：

```gitignore
# CLAUDE.md 本地覆盖（不提交）
CLAUDE.md.local
```

## 文件说明

| 文件 | 用途 | 是否提交到Git |
|------|------|--------------|
| `CLAUDE.md` | 团队共享的开发规范 | ✅ 是 |
| `CLAUDE.md.local` | 个人本地路径和作者覆盖 | ❌ 否 |
| `.gitignore` | 排除 CLAUDE.md.local | ✅ 是 |

## 注意事项

- `CLAUDE.md.local` 不会被 Git 追踪，不会影响其他成员
- 如果不创建 `CLAUDE.md.local`，CLAUDE.md 中的占位符（如 `%WORKSPACE_ROOT%`）将显示为字面值
- 建议每个成员首次克隆仓库后立即创建自己的 `CLAUDE.md.local`

## 附录：环境变量测试结论

经测试，CLAUDE.md 文件中的环境变量（如 `%USERPROFILE%`、`%USERNAME%`）**不会自动展开**，文件内容被原样读取。因此不能使用环境变量方案来解决路径差异问题。
