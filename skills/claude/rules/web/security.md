# Web 安全规范

> 前端安全红线。按需加载。

## 密钥与敏感信息

- **严禁**在源码中硬编码 API 密钥、密码、Token
- **严禁**将 `.env`、配置中心文件提交到 Git
- 敏感信息（Token、密码、手机号、身份证）禁止打印到日志或 console

## XSS 防护

- 禁止直接注入未净化 HTML（避免 `innerHTML` / `dangerouslySetInnerHTML`）
- 用户输入渲染前必须转义
- Element UI 的 `dangerouslyUseHTMLString` 仅在受控数据上使用

## 用户输入

- 所有用户输入必须经过校验后再处理
- 文件上传必须校验文件类型和大小，禁止信任客户端提供的文件名后缀
- 表单提交启用 CSRF 保护

## 响应头（生产环境）

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```
