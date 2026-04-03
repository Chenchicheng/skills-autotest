#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 颜色
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function exec(cmd, silent = false) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
  } catch (e) {
    return null;
  }
}

function question(rl, prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function setup() {
  log('\n🚀 自动化测试环境配置向导\n', 'cyan');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // 收集配置信息
  const config = {};

  config.baseUrl = await question(rl, '请输入前端地址 (默认: http://localhost:3000): ') || 'http://localhost:3000';
  config.apiUrl = await question(rl, '请输入后端 API 地址 (默认: http://localhost:8080): ') || 'http://localhost:8080';
  config.username = await question(rl, '请输入测试用户名 (默认: admin): ') || 'admin';
  config.password = await question(rl, '请输入测试密码 (默认: 123456): ') || '123456';

  rl.close();

  log('\n📋 配置信息:', 'blue');
  console.log(JSON.stringify(config, null, 2));

  // 检查 Node.js
  log('\n检查 Node.js...', 'blue');
  const nodeVersion = process.version;
  log(`  ✓ Node.js ${nodeVersion}`, 'green');

  // 安装 Playwright
  log('\n安装 Playwright...', 'blue');
  exec('npm install -D @playwright/test');

  // 安装浏览器
  log('\n安装浏览器...', 'blue');
  exec('npx playwright install chromium');

  // 创建 .env.test
  log('\n创建环境配置...', 'blue');
  fs.writeFileSync('.env.test', `BASE_URL=${config.baseUrl}
API_BASE_URL=${config.apiUrl}
TEST_USERNAME=${config.username}
TEST_PASSWORD=${config.password}
`);

  // 创建 playwright.config.ts
  if (!fs.existsSync('playwright.config.ts')) {
    log('创建 Playwright 配置...', 'blue');
    fs.writeFileSync('playwright.config.ts', `import { defineConfig, devices } from '@playwright/test';
require('dotenv').config({ path: '.env.test' });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL,
    trace: { mode: 'on-first-retry' },
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
`);
  }

  // 创建测试目录
  if (!fs.existsSync('tests')) {
    fs.mkdirSync('tests');
  }

  // 创建示例测试
  if (!fs.existsSync('tests/login.spec.ts')) {
    log('创建示例测试...', 'blue');
    fs.writeFileSync('tests/login.spec.ts', `import { test, expect } from '@playwright/test';

test('登录测试', async ({ page }) => {
  // 打开登录页
  await page.goto('/login');

  // 填充表单
  await page.fill('input[name="username"], input[type="text"]', process.env.TEST_USERNAME);
  await page.fill('input[name="password"], input[type="password"]', process.env.TEST_PASSWORD);

  // 点击登录
  await page.click('button[type="submit"]');

  // 验证结果
  await expect(page).toHaveURL(/.*dashboard|.*home/, { timeout: 10000 });
});

test('API 健康检查', async ({ request }) => {
  const res = await request.get(process.env.API_BASE_URL + '/health');
  expect(res.ok()).toBeTruthy();
});
`);
  }

  // 更新 package.json
  if (fs.existsSync('package.json')) {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.scripts = pkg.scripts || {};
    pkg.scripts['test:e2e'] = 'playwright test';
    pkg.scripts['test:ui'] = 'playwright test --ui';
    pkg.scripts['test:headed'] = 'playwright test --headed';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  }

  log('\n✅ 配置完成！\n', 'green');
  log('运行测试:', 'cyan');
  log('  npx playwright test --ui', 'yellow');
}

// 主命令
const args = process.argv.slice(2);
const cmd = args[0];

if (cmd === 'setup') {
  setup();
} else if (cmd === 'run') {
  log('\n🧪 运行测试...\n', 'cyan');
  exec('npx playwright test --ui');
} else if (cmd === 'test') {
  log('\n🧪 运行无头测试...\n', 'cyan');
  exec('npx playwright test');
} else {
  console.log(`
${colors.cyan}自动化测试 CLI${colors.reset}

用法:
  npx skills-autotest setup    交互式配置环境
  npx skills-autotest run       运行 UI 模式测试
  npx skills-autotest test      运行无头模式测试

示例:
  npx skills-autotest setup
  npx skills-autotest run
`);
}