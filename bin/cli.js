#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

// 颜色输出
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function install() {
  const homeDir = require('os').homedir();

  log('\n🚀 正在安装自动化测试 Skills...\n', 'blue');

  // 安装 Claude Code Skills 到用户根目录
  const claudeDir = path.join(homeDir, '.claude', 'commands');
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  // 获取包目录中的 skills 文件
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

  // 打印使用说明
  log('\n✅ 安装完成！\n', 'green');
  log('安装位置: ' + homeDir + '\n', 'blue');
  log('可用命令：', 'blue');
  log('  Claude Code: /test, /e2e-test, /api-test');
  log('  Cursor: 直接询问 AI 进行测试，会自动应用规则\n');
}

function help() {
  log('\n自动化测试 Skills CLI\n', 'blue');
  log('用法:');
  log('  npx skills-autotest install    安装 Skills 到当前项目');
  log('  npx skills-autotest help       显示帮助信息\n');
}

// 主逻辑
switch (command) {
  case 'install':
    install();
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