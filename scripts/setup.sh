#!/bin/bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log_info "🚀 自动化测试环境初始化开始..."

# 1. 检查 Node.js
log_info "检查 Node.js 版本..."
if ! command -v node &> /dev/null; then
    log_error "未安装 Node.js，请先安装 Node.js"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
log_success "Node.js 版本: $(node -v)"

# 2. 检查 npm
if ! command -v npm &> /dev/null; then
    log_error "未安装 npm"
    exit 1
fi
log_success "npm 版本: $(npm -v)"

# 3. 安装 Playwright（根据 Node 版本选择合适版本）
log_info "安装 Playwright..."
if [ "$NODE_VERSION" -ge 18 ]; then
    PLAYWRIGHT_VERSION="latest"
else
    PLAYWRIGHT_VERSION="1.40.0"
fi

if [ -f "package.json" ]; then
    # 项目目录，安装到项目
    if ! grep -q "playwright" package.json 2>/dev/null; then
        log_info "安装 Playwright 到项目..."
        npm install -D @playwright/test@$PLAYWRIGHT_VERSION
    fi
else
    # 全局安装
    log_info "全局安装 Playwright..."
    npm install -g @playwright/test@$PLAYWRIGHT_VERSION
fi

# 4. 安装浏览器
log_info "安装浏览器..."
npx playwright install chromium

# 5. 创建配置文件（如果不存在）
if [ ! -f "playwright.config.ts" ] && [ ! -f "playwright.config.js" ]; then
    log_info "创建 Playwright 配置文件..."
    cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: { mode: 'on-first-retry' },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
EOF
fi

# 6. 创建测试目录
mkdir -p tests

# 7. 创建环境配置文件
if [ ! -f ".env.test" ]; then
    log_info "创建测试环境配置..."
    cat > .env.test << 'EOF'
# 测试环境配置
BASE_URL=http://localhost:3000

# 测试账号
TEST_USERNAME=admin
TEST_PASSWORD=123456

# API 配置
API_BASE_URL=http://localhost:8080
EOF
    log_warn "请编辑 .env.test 文件配置你的测试账号和地址"
fi

# 8. 创建示例测试文件
if [ ! -f "tests/example.spec.ts" ]; then
    log_info "创建示例测试文件..."
    cat > tests/example.spec.ts << 'EOF'
import { test, expect } from '@playwright/test';

// 从环境变量读取配置
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const USERNAME = process.env.TEST_USERNAME || 'admin';
const PASSWORD = process.env.TEST_PASSWORD || '123456';

test.describe('自动化测试', () => {
  test('登录测试', async ({ page }) => {
    // 打开登录页
    await page.goto(`${BASE_URL}/login`);

    // 填充用户名密码
    await page.fill('input[name="username"], input[type="text"]', USERNAME);
    await page.fill('input[name="password"], input[type="password"]', PASSWORD);

    // 点击登录
    await page.click('button[type="submit"], button:has-text("登录"), button:has-text("Login")');

    // 验证登录成功
    await expect(page).toHaveURL(/.*dashboard|.*home|.*index/, { timeout: 10000 });
  });

  test('API 健康检查', async ({ request }) => {
    const response = await request.get(`${process.env.API_BASE_URL || BASE_URL}/health`);
    expect(response.ok()).toBeTruthy();
  });
});
EOF
fi

# 9. 添加 npm scripts（如果有 package.json）
if [ -f "package.json" ]; then
    log_info "添加测试脚本到 package.json..."

    # 使用 node 来修改 package.json
    node -e '
    const fs = require("fs");
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    pkg.scripts = pkg.scripts || {};
    if (!pkg.scripts["test:e2e"]) pkg.scripts["test:e2e"] = "playwright test";
    if (!pkg.scripts["test:ui"]) pkg.scripts["test:ui"] = "playwright test --ui";
    if (!pkg.scripts["test:headed"]) pkg.scripts["test:headed"] = "playwright test --headed";
    fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
    '
fi

log_success "✅ 环境初始化完成！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 下一步操作："
echo ""
echo "  1. 编辑 .env.test 配置你的测试环境："
echo "     vim .env.test"
echo ""
echo "  2. 修改 tests/example.spec.ts 编写你的测试用例"
echo ""
echo "  3. 运行测试："
echo "     npm run test:e2e        # 无头模式"
echo "     npm run test:ui         # UI 模式（推荐）"
echo "     npm run test:headed     # 显示浏览器"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"