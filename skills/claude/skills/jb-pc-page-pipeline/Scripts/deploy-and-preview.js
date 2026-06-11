#!/usr/bin/env node

/**
 * 自动部署与预览脚本
 * 将生成的 Vue 页面部署到 finance-saas-vue 项目并启动预览
 *
 * 用法:
 *   node deploy-and-preview.js --module=reimbursement --name=reimbursement-list --path=/reimbursement/list --source=/path/to/generated.vue
 *
 * 参数:
 *   --module    模块目录名 (如: reimbursement, contract)
 *   --name      页面组件名 (如: reimbursement-list)
 *   --path      路由路径 (如: /reimbursement/list)
 *   --source    生成的 Vue 文件路径
 *   --project   目标项目路径 (默认: ../../../finance-saas-vue)
 *   --open      是否自动打开浏览器 (默认: true)
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

// 解析命令行参数
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) {
      args[match[1]] = match[2];
    }
  });
  return args;
}

const args = parseArgs();

// 配置
const PROJECT_PATH = path.resolve(__dirname, args.project || '../../../finance-saas-vue');
const MODULE_NAME = args.module;
const PAGE_NAME = args.name;

// 修复 Windows Git Bash 对以 / 开头的参数的路径转换问题
// Git Bash 会把 /test/path 转成 D:/Program Files/Git/test/path
let rawPath = args.path || '';
const gitBashPrefix = /[A-Za-z]:\/Program Files\/Git/i;
if (gitBashPrefix.test(rawPath)) {
  rawPath = rawPath.replace(gitBashPrefix, '');
}
const ROUTE_PATH = rawPath;
const SOURCE_FILE = args.source;
const AUTO_OPEN = args.open !== 'false';

// 校验参数
function validate() {
  const errors = [];
  if (!MODULE_NAME) errors.push('缺少 --module 参数');
  if (!PAGE_NAME) errors.push('缺少 --name 参数');
  if (!ROUTE_PATH) errors.push('缺少 --path 参数');
  if (!SOURCE_FILE) errors.push('缺少 --source 参数');

  if (!fs.existsSync(PROJECT_PATH)) {
    errors.push(`项目路径不存在: ${PROJECT_PATH}`);
  }
  if (!fs.existsSync(SOURCE_FILE)) {
    errors.push(`源文件不存在: ${SOURCE_FILE}`);
  }

  if (errors.length > 0) {
    console.error('❌ 参数错误:');
    errors.forEach((e) => console.error(`   - ${e}`));
    console.error('\n用法示例:');
    console.error(
      '  node deploy-and-preview.js --module=reimbursement --name=reimbursement-list --path=/reimbursement/list --source=./dist/reimbursement-list.vue'
    );
    process.exit(1);
  }
}

// 步骤 1: 创建模块目录并复制文件
function deployFile() {
  const viewsDir = path.join(PROJECT_PATH, 'src/jinbeiguanjia/views');
  const moduleDir = path.join(viewsDir, MODULE_NAME);
  const targetFile = path.join(moduleDir, `${PAGE_NAME}.vue`);

  // 创建模块目录（如果不存在）
  if (!fs.existsSync(moduleDir)) {
    fs.mkdirSync(moduleDir, { recursive: true });
    console.log(`📁 创建模块目录: ${path.relative(PROJECT_PATH, moduleDir)}`);
  }

  // 复制文件
  fs.copyFileSync(SOURCE_FILE, targetFile);
  console.log(`📄 复制页面文件: ${path.relative(PROJECT_PATH, targetFile)}`);

  return targetFile;
}

// 步骤 2: 注册路由
function registerRoute() {
  const routerFile = path.join(PROJECT_PATH, 'src/jinbeiguanjia/router.js');
  let content = fs.readFileSync(routerFile, 'utf8');

  // 构建路由配置
  const routeEntry = `      {
        path: '${ROUTE_PATH}',
        name: '${PAGE_NAME}',
        component: () =>
          import(\`./views/${MODULE_NAME}/${PAGE_NAME}.vue\`).then(completeName),
      },`;

  // 查找 children 数组的最后一个路由项之前的位置
  // 策略：在 children 数组的末尾（redirect 之前）插入新路由
  const redirectPattern = /(      \/\/ 兜底页面[\s\S]*?)(\s*\{\s*path: '\/home',)/;
  const childrenEndPattern = /(    ],\s*\n\s*redirect\(\))/;

  if (childrenEndPattern.test(content)) {
    // 在 children 数组结束前插入
    content = content.replace(
      childrenEndPattern,
      `${routeEntry}\n\n$1`
    );
  } else {
    console.warn('⚠️ 无法自动定位路由插入点，请手动添加路由');
    console.warn(`建议插入位置: src/jinbeiguanjia/router.js`);
    console.warn(`路由配置:\n${routeEntry}`);
    return false;
  }

  fs.writeFileSync(routerFile, content);
  console.log(`🔗 注册路由: ${ROUTE_PATH} -> ${PAGE_NAME}`);
  return true;
}

// 步骤 3: 检查开发服务器是否已运行
function isDevServerRunning() {
  return new Promise((resolve) => {
    // 尝试连接 localhost:3000
    const http = require('http');
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'HEAD',
        timeout: 2000,
      },
      () => resolve(true)
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

// 步骤 4: 启动开发服务器
async function startDevServer() {
  const running = await isDevServerRunning();
  if (running) {
    console.log('✅ 开发服务器已在运行 (localhost:3000)');
    return true;
  }

  console.log('🚀 启动开发服务器...');
  const child = spawn('npm', ['run', 'dev'], {
    cwd: PROJECT_PATH,
    stdio: 'inherit',
    shell: true,
    detached: true,
  });

  // 等待服务器启动
  console.log('⏳ 等待服务器启动 (约 5-10 秒)...');
  await new Promise((resolve) => setTimeout(resolve, 8000));

  // 再次检查
  const started = await isDevServerRunning();
  if (started) {
    console.log('✅ 开发服务器启动成功');
    return true;
  } else {
    console.warn('⚠️ 开发服务器可能还在启动中，请稍后再试');
    return false;
  }
}

// 步骤 5: 打开浏览器
function openBrowser() {
  if (!AUTO_OPEN) return;

  const url = `https://localhost:3000/#${ROUTE_PATH}`;
  console.log(`🌐 打开页面: ${url}`);

  const platform = process.platform;
  let command;

  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  exec(command, (err) => {
    if (err) {
      console.warn(`⚠️ 自动打开浏览器失败，请手动访问: ${url}`);
    }
  });
}

// 主流程
async function main() {
  console.log('🎯 开始部署与预览\n');

  // 1. 校验参数
  validate();
  console.log(`📦 目标项目: ${PROJECT_PATH}`);
  console.log(`📄 源文件: ${SOURCE_FILE}`);
  console.log(`🏷️  模块: ${MODULE_NAME}`);
  console.log(`📋 页面: ${PAGE_NAME}`);
  console.log(`🔗 路由: ${ROUTE_PATH}\n`);

  // 2. 部署文件
  deployFile();

  // 3. 注册路由
  const routeOk = registerRoute();
  if (!routeOk) {
    console.error('❌ 路由注册失败，终止后续步骤');
    process.exit(1);
  }

  // 4. 启动开发服务器
  const serverOk = await startDevServer();

  // 5. 打开浏览器
  if (serverOk) {
    openBrowser();
  }

  console.log('\n✨ 部署完成！');
  console.log(`📝 文件位置: src/jinbeiguanjia/views/${MODULE_NAME}/${PAGE_NAME}.vue`);
  console.log(`🔗 访问地址: https://localhost:3000/#${ROUTE_PATH}`);
}

main().catch((err) => {
  console.error('❌ 部署失败:', err.message);
  process.exit(1);
});
