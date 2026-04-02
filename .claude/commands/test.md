---
name: test
description: 自动化测试验证 - 执行 E2E 测试、API 测试和自动化测试脚本
---

# 自动化测试验证

你需要帮助用户验证前后端功能，执行以下测试流程：

## 1. 环境检查

首先检查项目中是否存在测试配置：
- 检查 `package.json` 中是否有测试脚本
- 检查是否存在 `playwright.config.ts` 或 `playwright.config.js`
- 检查是否存在 `pytest.ini` 或 `pom.xml` 中的测试配置

## 2. 执行测试

根据用户选择，执行以下测试：

### E2E 浏览器测试
如果用户需要进行浏览器测试：
1. 检查 Playwright 是否安装，未安装则提示安装命令
2. 使用 `npx playwright test` 运行测试
3. 如果需要 UI 模式调试，使用 `npx playwright test --ui`

### API 接口测试
如果用户需要 API 测试：
1. 询问用户要测试的接口 URL 和参数
2. 使用 curl 或 http 工具发送请求
3. 验证返回状态码和响应内容

### 执行自动化测试脚本
根据项目类型执行：
- Node.js: `npm test` 或 `npm run test`
- Python: `pytest`
- Java: `mvn test` 或 `./gradlew test`

## 3. 测试报告

测试完成后：
- 汇总测试结果（通过/失败）
- 分析失败原因
- 提供修复建议

## 执行流程

1. 询问用户要测试的功能模块
2. 选择测试类型（可多选）
3. 自动执行测试
4. 输出测试报告