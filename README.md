# Claude Code 自动化测试 Skills

用于 Claude Code 的自动化测试技能包，支持 E2E 测试、API 测试等。

## 安装

### NPX 一键安装（推荐）

```bash
# 安装 Skills 到用户目录
npx skills-autotest install

# 交互式配置 Playwright 环境
npx skills-autotest setup

# 运行 UI 模式测试
npx skills-autotest run

# 运行无头模式测试
npx skills-autotest test
```

`setup` 命令会自动：
- 安装 Playwright 和浏览器
- 创建 `.env.test` 环境配置
- 创建 `playwright.config.ts`
- 生成示例测试文件
- 更新 `package.json` 测试脚本

### 手动安装

```bash
git clone https://github.com/Chenchicheng/skills-autotest.git

# Claude Code
cp -r skills-autotest/.claude/commands/* ~/.claude/commands/

# Cursor
cp -r skills-autotest/.cursor ~/
```

## 可用 Skills

| 命令 | 功能 |
|------|------|
| `/test` | 综合测试 - 选择测试类型后自动执行 |
| `/e2e-test` | E2E 浏览器测试 - Playwright 自动化 |
| `/api-test` | API 接口测试 - curl 验证后端接口 |

## 使用示例

```
# 执行综合测试
/test

# 执行 E2E 浏览器测试
/e2e-test

# 执行 API 接口测试
/api-test
```

## 功能特点

- 🤖 AI 驱动的自动化测试
- 🌐 支持 Playwright E2E 测试
- 🔌 支持 API 接口测试
- 📊 自动生成测试报告
- 🔧 支持参数化测试
- 💻 支持 Claude Code 和 Cursor

## License

MIT