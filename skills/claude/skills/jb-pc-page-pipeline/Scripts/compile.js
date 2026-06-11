const fs = require('fs');
const path = require('path');

// 定义根路径
const skillDir = path.resolve(__dirname, '..');
const distDir = path.join(skillDir, 'dist');
const outputFile = path.join(distDir, 'compiled_prompt.md');

function resolveLink(basePath, relativePath) {
  // 处理 file:// 协议或普通相对路径
  const cleanedPath = relativePath.replace(/^file:\/\/\/?/, '').replace(/^\.\//, '');
  return path.resolve(basePath, cleanedPath);
}

function compileSkill() {
  console.log('🚀 开始打包前端代码生成 Skill...');
  
  const skillMdPath = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillMdPath)) {
    console.error('❌ 未找到核心 SKILL.md 文件，请检查路径。');
    process.exit(1);
  }

  let coreContent = fs.readFileSync(skillMdPath, 'utf8');

  // 正则匹配 file:// 链接，将其替换为对应文件的真实内容
  // 匹配格式: [文件名](file://相对路径) 或 [文件名](file://../相对路径)
  const linkRegex = /\[([^\]]+)\]\((file:\/\/[^\)]+)\)/g;
  let match;
  const replacements = [];

  while ((match = linkRegex.exec(coreContent)) !== null) {
    const anchorText = match[1];
    const fileUrl = match[2];
    const absolutePath = resolveLink(skillDir, fileUrl);

    if (fs.existsSync(absolutePath)) {
      const extension = path.extname(absolutePath).slice(1);
      const relativeToSkill = path.relative(skillDir, absolutePath);
      console.log(`📦 正在嵌入参考资源: ${relativeToSkill}`);

      const fileContent = fs.readFileSync(absolutePath, 'utf8');
      
      // 构建嵌入的 Markdown 内容
      const embeddedSection = `
---
### 📖 嵌入参考资源: ${anchorText} (${relativeToSkill})

\`\`\`${extension === 'vue' ? 'html' : extension}
${fileContent.trim()}
\`\`\`
---`;
      replacements.push({
        rawMatch: match[0],
        embeddedContent: embeddedSection
      });
    } else {
      console.warn(`⚠️ 链接指向的文件不存在: ${absolutePath}`);
    }
  }

  // 替换链接为实际内容
  replacements.forEach(rep => {
    coreContent = coreContent.replace(rep.rawMatch, rep.embeddedContent);
  });

  // 创建输出目录
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 写入最终编译好的 Prompt 文件
  fs.writeFileSync(outputFile, coreContent, 'utf8');
  console.log(`\n✨ 编译成功！`);
  console.log(`📂 最终打包 Prompt 已生成在: \x1b[36m${outputFile}\x1b[0m`);
  console.log(`💡 您可以直接将该文件内容作为 CLI 工具的 System Prompt 输入。`);
}

compileSkill();
