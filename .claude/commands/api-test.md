---
name: api-test
description: API 接口自动化测试 - 验证后端 API 接口功能
---

# API 接口自动化测试

自动化验证后端 API 接口，测试不同参数组合的响应。

## 执行步骤

### 1. 收集接口信息

询问用户：
- 接口 URL
- 请求方法（GET/POST/PUT/DELETE）
- 请求参数/Body
- 请求头（如 Authorization）
- 预期响应（状态码、响应字段）

### 2. 执行请求

根据请求方法执行：

**GET 请求**：
```bash
curl -X GET "<URL>?param1=value1&param2=value2" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>"
```

**POST 请求**：
```bash
curl -X POST "<URL>" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"field1": "value1", "field2": "value2"}'
```

### 3. 验证响应

检查：
- HTTP 状态码是否符合预期
- 响应 JSON 字段是否正确
- 错误情况是否正确处理

## 参数化测试模板

可以批量执行多个测试用例：

| 用例 | 参数 | 预期结果 |
|------|------|----------|
| 正常登录 | username: "admin", password: "123456" | 200, token 返回 |
| 密码错误 | username: "admin", password: "wrong" | 401, 错误提示 |
| 参数缺失 | username: "" | 400, 参数校验失败 |

## 输出

- 每个接口的请求/响应
- 状态码验证结果
- 响应数据是否符合预期
- 错误分析和调试建议