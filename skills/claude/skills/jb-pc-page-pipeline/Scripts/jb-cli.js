#!/usr/bin/env node

/**
 * 经贝前端团队便捷 AI CLI 工具
 * 允许使用 / 指令快速调用对应的 Skill 规范
 * 用法: 
 *   jb /generator "需求描述"
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 定义指令与 Skill 文件的映射关系
const SKILLS_MAP = {
  '/generator': {
    name: '前端代码生成器',
    filePath: 'docs/skills/frontend-generator/dist/compiled_prompt.md'
  }
};

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '/help' || args[0] === '-h' || args[0] === '--help') {
  console.log('\n🛠️  经贝前端 AI CLI 工具 - 可用指令列表:\n');
  Object.entries(SKILLS_MAP).forEach(([cmd, info]) => {
    console.log(`  ${cmd.padEnd(15)} ->  使用 [${info.name}] 规范进行对话`);
  });
  console.log('\n示例:');
  console.log('  jb /generator "帮我写一个宽度 800px 的公司主体新增弹窗"\n');
  process.exit(0);
}

const command = args[0];
const userPrompt = args.slice(1).join(' ');

if (!SKILLS_MAP[command]) {
  console.log(`❌ 未知的指令: ${command}，请输入 jb /help 查看可用指令。`);
  process.exit(1);
}

const skillInfo = SKILLS_MAP[command];
const absoluteSkillPath = path.resolve(process.cwd(), skillInfo.filePath);

if (!fs.existsSync(absoluteSkillPath)) {
  console.log(`❌ 找不到 Skill 文件: ${skillInfo.filePath}，请确认是否运行过 node compile.js`);
  process.exit(1);
}

console.log(`\n🤖 已加载 [${skillInfo.name}]，正在启动 Claude Code...`);
console.log(`📝 提示词: "${userPrompt}"\n`);

// 组装最终发给 Claude CLI 的 Prompt
// 明确要求 Claude 必须读取并严格遵循引用的 Skill 文件内容
const finalPrompt = `请阅读并严格遵循项目规范文件 @${skillInfo.filePath}。任务是：${userPrompt}`;

// 启动原生的 claude 命令行工具，并将拼接后的 prompt 传给它
const claudeProcess = spawn('claude', [finalPrompt], {
  stdio: 'inherit',
  shell: true
});

claudeProcess.on('error', (err) => {
  console.error('❌ 启动 Claude CLI 失败，请确认是否已全局安装 @anthropic-ai/claude-code。', err);
});
