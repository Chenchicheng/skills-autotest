---
name: e2e-test
description: E2E 浏览器自动化测试 - 使用 Playwright 进行端到端测试
---

# E2E 浏览器自动化测试

使用 Playwright 执行端到端测试，验证前后端联调逻辑。

## 执行步骤

### 1. 检查 Playwright 环境
```bash
# 检查是否安装
npx playwright --version
```

如果未安装，提示用户：
```bash
npm init playwright@latest
```

### 2. 收集测试信息

询问用户：
- 测试的页面 URL
- 需要输入的表单字段和测试数据
- 预期的结果（跳转页面、显示文本、API 响应等）

### 3. 生成/运行测试

**如果已有测试文件**：
```bash
npx playwright test
```

**如果需要生成新测试**：
1. 使用 `npx playwright codegen <URL>` 录制测试
2. 或根据用户提供的信息编写测试代码

### 4. 测试模式选择

提供选项：
- `npx playwright test` - 无头模式运行
- `npx playwright test --ui` - UI 模式，方便调试
- `npx playwright test --headed` - 显示浏览器窗口

## 测试模板

```typescript
import { test, expect } from '@playwright/test';

test('功能测试', async ({ page }) => {
  // 1. 打开页面
  await page.goto('<URL>');

  // 2. 输入参数
  await page.fill('<选择器>', '<值>');

  // 3. 执行操作
  await page.click('<按钮选择器>');

  // 4. 验证结果
  await expect(page.locator('<结果选择器>')).toContainText('<预期文本>');
});
```

## 输出

- 测试运行结果
- 失败截图（如有）
- 错误分析和修复建议