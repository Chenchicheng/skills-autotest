#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const os = require('os');

const args = process.argv.slice(2);
const command = args[0];

// 颜色输出
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function exec(cmd) {
  try {
    execSync(cmd, { stdio: 'inherit' });
    return true;
  } catch (e) {
    return false;
  }
}

function question(rl, prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function interactiveSetup() {
  log('\n🚀 自动化测试环境配置向导\n', 'cyan');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const config = {};
  config.baseUrl = await question(rl, '请输入前端地址 (默认: http://localhost:3000): ') || 'http://localhost:3000';
  config.apiUrl = await question(rl, '请输入后端 API 地址 (默认: http://localhost:8080): ') || 'http://localhost:8080';
  config.username = await question(rl, '请输入测试用户名 (默认: admin): ') || 'admin';
  config.password = await question(rl, '请输入测试密码 (默认: 123456): ') || '123456';

  rl.close();

  const cwd = process.cwd();

  log('\n📦 安装依赖...', 'blue');
  exec('npm install -D @playwright/test dotenv');

  log('\n🌐 安装浏览器...', 'blue');
  exec('npx playwright install chromium');

  // 创建 .env.test
  log('\n📝 创建环境配置...', 'blue');
  fs.writeFileSync(path.join(cwd, '.env.test'), `BASE_URL=${config.baseUrl}
API_BASE_URL=${config.apiUrl}
TEST_USERNAME=${config.username}
TEST_PASSWORD=${config.password}
`);

  // 创建 playwright.config.ts
  if (!fs.existsSync(path.join(cwd, 'playwright.config.ts'))) {
    log('📝 创建 Playwright 配置...', 'blue');
    fs.writeFileSync(path.join(cwd, 'playwright.config.ts'), `import { defineConfig, devices } from '@playwright/test';
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

  // 创建测试目录和示例
  if (!fs.existsSync(path.join(cwd, 'tests'))) {
    fs.mkdirSync(path.join(cwd, 'tests'));
  }

  if (!fs.existsSync(path.join(cwd, 'tests/login.spec.ts'))) {
    log('📝 创建示例测试...', 'blue');
    fs.writeFileSync(path.join(cwd, 'tests/login.spec.ts'), `import { test, expect } from '@playwright/test';

test('登录测试', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="username"], input[type="text"]', process.env.TEST_USERNAME);
  await page.fill('input[name="password"], input[type="password"]', process.env.TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*dashboard|.*home/, { timeout: 10000 });
});

test('API 健康检查', async ({ request }) => {
  const res = await request.get(process.env.API_BASE_URL + '/health');
  expect(res.ok()).toBeTruthy();
});
`);
  }

  // 更新 package.json
  if (fs.existsSync(path.join(cwd, 'package.json'))) {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
    pkg.scripts = pkg.scripts || {};
    pkg.scripts['test:e2e'] = 'playwright test';
    pkg.scripts['test:ui'] = 'playwright test --ui';
    pkg.scripts['test:headed'] = 'playwright test --headed';
    fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify(pkg, null, 2));
  }

  log('\n✅ 配置完成！\n', 'green');
  log('运行测试:', 'cyan');
  log('  npx playwright test --ui\n', 'yellow');
}

function install() {
  const homeDir = os.homedir();

  log('\n🚀 正在安装自动化测试 Skills...\n', 'blue');

  // 安装 Claude Code Skills 到用户根目录
  const claudeDir = path.join(homeDir, '.claude', 'commands');
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  const packageDir = path.dirname(__dirname);
  const skillsDir = path.join(packageDir, '.claude', 'commands');

  if (fs.existsSync(skillsDir)) {
    const files = fs.readdirSync(skillsDir);
    files.forEach(file => {
      const src = path.join(skillsDir, file);
      const dest = path.join(claudeDir, file);
      fs.copyFileSync(src, dest);
      log(`  ✓ 已安装 Claude Code Skill: ${file}`, 'green');
    });
  }

  // 安装 Cursor 配置到用户根目录
  const cursorSrcDir = path.join(packageDir, '.cursor');
  const cursorDestDir = path.join(homeDir, '.cursor');

  if (fs.existsSync(cursorSrcDir)) {
    if (!fs.existsSync(cursorDestDir)) {
      fs.mkdirSync(cursorDestDir, { recursive: true });
    }

    const cursorFiles = fs.readdirSync(cursorSrcDir);
    cursorFiles.forEach(file => {
      const src = path.join(cursorSrcDir, file);
      const dest = path.join(cursorDestDir, file);
      fs.copyFileSync(src, dest);
      log(`  ✓ 已安装 Cursor 配置: ${file}`, 'green');
    });
  }

  log('\n✅ 安装完成！\n', 'green');
  log('安装位置: ' + homeDir + '\n', 'blue');
  log('可用命令：', 'blue');
  log('  Claude Code: /test, /e2e-test, /api-test');
  log('  Cursor: 直接询问 AI 进行测试，会自动应用规则\n');
}

function help() {
  log('\n自动化测试 Skills CLI\n', 'cyan');
  log('用法:');
  log('  npx skills-autotest install     安装 Skills 到用户目录');
  log('  npx skills-autotest setup       交互式配置 Playwright 环境');
  log('  npx skills-autotest run         运行 UI 模式测试');
  log('  npx skills-autotest test        运行无头模式测试');
  log('  npx skills-autotest help        显示帮助信息\n');
}

// 主逻辑
switch (command) {
  case 'install':
    install();
    break;
  case 'setup':
    interactiveSetup();
    break;
  case 'run':
    log('\n🧪 启动 UI 测试模式...\n', 'cyan');
    exec('npx playwright test --ui');
    break;
  case 'test':
    log('\n🧪 运行测试...\n', 'cyan');
    exec('npx playwright test');
    break;
  case 'help':
  case '--help':
  case '-h':
    help();
    break;
  default:
    if (command) {
      log(`未知命令: ${command}`, 'yellow');
    }
    help();
    break;
}