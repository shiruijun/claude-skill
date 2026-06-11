# 规则
## 结构

规则按**通用**层和**语言特定**目录组织：

```
rules/
├── common/          # 语言无关的原则（始终安装）
│   ├── coding-style.md
│   ├── git-workflow.md
│   ├── testing.md
│   ├── performance.md
│   ├── patterns.md
│   ├── hooks.md
│   ├── agents.md
│   └── security.md
├── typescript/      # TypeScript/JavaScript 特定
├── python/          # Python 特定
├── golang/          # Go 特定
├── web/             # Web 和前端特定
├── swift/           # Swift 特定
└── php/             # PHP 特定
```

- **common/** 包含通用原则 — 无语言特定的代码示例。
- **语言目录** 用框架特定的模式、工具和代码示例扩展通用规则。每个文件引用其对应的通用版本。

## 安装

### 选项 1：安装脚本（推荐）

```bash
# 安装通用 + 一个或多个语言特定的规则集
./install.sh typescript
./install.sh python
./install.sh golang
./install.sh web
./install.sh swift
./install.sh php

# 同时安装多种语言
./install.sh typescript python
```

### 选项 2：手动安装

> **重要：** 复制整个目录 — 不要使用 `/*` 展开。
> 通用和语言特定目录包含同名文件。
> 将它们展开到一个目录会导致语言特定文件覆盖通用规则，
> 并破坏语言特定文件使用的 `../common/` 相对引用。

```bash
# 安装通用规则（所有项目必需）
cp -r rules/common ~/.claude/rules/common

# 根据项目技术栈安装语言特定规则
cp -r rules/typescript ~/.claude/rules/typescript
cp -r rules/python ~/.claude/rules/python
cp -r rules/golang ~/.claude/rules/golang
cp -r rules/web ~/.claude/rules/web
cp -r rules/swift ~/.claude/rules/swift
cp -r rules/php ~/.claude/rules/php

# 注意！根据您的实际项目需求配置；此配置仅供参考。
```

## 规则 vs 技能

- **规则** 定义适用于广泛范围的标准、约定和检查清单（例如"80% 测试覆盖率"、"禁止硬编码密钥"）。
- **技能**（`skills/` 目录）为特定任务提供深入、可操作的参考材料（例如 `python-patterns`、`golang-testing`）。

语言特定的规则文件在适当的地方引用相关技能。规则告诉你*做什么*；技能告诉你*怎么做*。

## 添加新语言

要添加对新语言的支持（例如 `rust/`）：

1. 创建 `rules/rust/` 目录
2. 添加扩展通用规则的文件：
   - `coding-style.md` — 格式化工具、习语、错误处理模式
   - `testing.md` — 测试框架、覆盖率工具、测试组织
   - `patterns.md` — 语言特定的设计模式
   - `hooks.md` — 格式化器、linter、类型检查器的 PostToolUse hooks
   - `security.md` — 密钥管理、安全扫描工具
3. 每个文件应以：
   ```
   > This file extends [common/xxx.md](../common/xxx.md) with <Language> specific content.
   ```
4. 如果有现有技能则引用，或在 `skills/` 下创建新的。

对于非语言领域如 `web/`，当有足够的可重用领域特定指导来证明独立规则集合理时，遵循相同的分层模式。

## 规则优先级

当语言特定规则和通用规则冲突时，**语言特定规则优先**（特定覆盖通用）。这遵循标准的分层配置模式（类似于 CSS 特异性或 `.gitignore` 优先级）。

- `rules/common/` 定义适用于所有项目的通用默认值。
- `rules/golang/`、`rules/python/`、`rules/swift/`、`rules/php/`、`rules/typescript/` 等在语言习惯不同时覆盖这些默认值。

### 示例

`common/coding-style.md` 推荐不可变性作为默认原则。语言特定的 `golang/coding-style.md` 可以覆盖这一点：

> Idiomatic Go uses pointer receivers for struct mutation — see [common/coding-style.md](../common/coding-style.md) for the general principle, but Go-idiomatic mutation is preferred here.

### 带覆盖说明的通用规则

`rules/common/` 中可能被语言特定文件覆盖的规则会被标记：

> **语言说明**：此规则可能会被语言特定规则覆盖；对于某些语言，该模式可能并不符合惯用写法。

## 项目特定语言优先级

当项目使用特定技术栈时，对应规则文件**覆盖通用规则**：

| 项目技术栈 | 规则目录 | 说明 |
|-----------|---------|------|
| Java 8 + Spring Boot 2.2.9 | `rules/java/` | 覆盖 common 中 Java 相关规则 |
| Spring Cloud 微服务 | `rules/java/` | 包含 Spring Cloud Alibaba, Nacos 配置 |
| MyBatis-Plus | `rules/java/` | 覆盖 JPA 相关模式 |
| Vue 3 + TypeScript | `rules/typescript/` + `rules/web/` | 前端特定规则 |

### 优先级顺序

```
项目 CLAUDE.md > rules/{技术栈}/ > rules/common/
```

例如：
- `D:\work\jb\CLAUDE.md` 定义了 Java 8 项目结构
- `rules/java/coding-style.md` 适配 Java 8 特性
- `rules/common/coding-style.md` 提供通用原则

### 项目配置

在 `CLAUDE.md` 中指定技术栈后，Claude Code 自动加载对应规则：
- 检测到 `pom.xml` + `Spring Boot` → 使用 `rules/java/`
- 检测到 `package.json` + `Vue` → 使用 `rules/web/`
