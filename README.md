# Claude Code 自动化测试 Skills

用于 Claude Code 的自动化测试技能包，支持 E2E 测试、API 测试等。

## 安装

将 `.claude/commands/` 目录复制到你的项目根目录或 `~/.claude/commands/`。

```bash
# 克隆仓库
git clone https://github.com/Chenchicheng/skills-autotest.git

# 复制到全局配置
cp -r skills-autotest/.claude/commands/* ~/.claude/commands/
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

## License

MIT