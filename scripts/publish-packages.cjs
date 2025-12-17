#!/usr/bin/env node

/**
 * 一键发布脚本
 * 实现构建、版本更新、文档更新和发布功能
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 获取命令行参数
const args = process.argv.slice(2);
const packageName = args[0]; // 可选的包名参数
const versionType = args[1] || 'patch'; // 版本类型: major, minor, patch

// 颜色输出
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(colors.red, `❌ ${message}`);
}

function success(message) {
  log(colors.green, `✅ ${message}`);
}

function info(message) {
  log(colors.blue, `ℹ️  ${message}`);
}

function warning(message) {
  log(colors.yellow, `⚠️  ${message}`);
}

/**
 * 获取所有包的路径
 */
function getAllPackages() {
  const packagesDir = path.join(process.cwd(), 'packages');
  if (!fs.existsSync(packagesDir)) {
    throw new Error('packages 目录不存在');
  }

  const packages = fs.readdirSync(packagesDir)
    .filter(item => fs.statSync(path.join(packagesDir, item)).isDirectory())
    .map(name => ({
      name,
      path: path.join(packagesDir, name),
      packageJsonPath: path.join(packagesDir, name, 'package.json')
    }))
    .filter(pkg => fs.existsSync(pkg.packageJsonPath));

  return packages;
}

/**
 * 获取指定包的信息
 */
function getPackageInfo(packageName) {
  const packages = getAllPackages();
  const pkg = packages.find(p => p.name === packageName);
  
  if (!pkg) {
    throw new Error(`包 "${packageName}" 不存在`);
  }
  
  const packageJson = JSON.parse(fs.readFileSync(pkg.packageJsonPath, 'utf-8'));
  return {
    ...pkg,
    packageJson
  };
}

/**
 * 获取所有包或指定包
 */
function getPackages() {
  if (packageName) {
    return [getPackageInfo(packageName)];
  }
  return getAllPackages().map(pkg => {
    const packageJson = JSON.parse(fs.readFileSync(pkg.packageJsonPath, 'utf-8'));
    return {
      ...pkg,
      packageJson
    };
  });
}

/**
 * 更新版本号
 */
function updateVersion(packageInfo, versionType) {
  const { name, packageJsonPath, packageJson } = packageInfo;
  const currentVersion = packageJson.version;
  
  // 解析当前版本
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  // 计算新版本
  let newVersion;
  switch (versionType) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }
  
  // 更新 package.json
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  success(`[${name}] 版本已从 ${currentVersion} 更新为 ${newVersion}`);
  return { oldVersion: currentVersion, newVersion };
}

/**
 * 构建包
 */
function buildPackage(packageInfo) {
  const { name, path: packagePath } = packageInfo;
  
  try {
    info(`[${name}] 开始构建...`);
    execSync('pnpm run build', { cwd: packagePath, stdio: 'inherit' });
    success(`[${name}] 构建完成`);
  } catch (err) {
    error(`[${name}] 构建失败: ${err.message}`);
    throw err;
  }
}

/**
 * 发布包
 */
function publishPackage(packageInfo) {
  const { name, path: packagePath } = packageInfo;
  
  try {
    info(`[${name}] 开始发布...`);
    const output = execSync('pnpm publish --access public --no-git-checks', { 
      cwd: packagePath, 
      stdio: ['inherit', 'pipe', 'pipe'],
      encoding: 'utf-8'
    });
    success(`[${name}] 发布成功`);
    if (output) {
      console.log(output);
    }
    return true;
  } catch (err) {
    error(`[${name}] 发布失败: ${err.message}`);
    throw err;
  }
}

/**
 * 更新文档 Changelog
 */
function updateDocsChangelog(packageInfo, versionInfo) {
  const { name, packageJson } = packageInfo;
  const { newVersion } = versionInfo;
  
  // 查找对应的文档文件
  const docsDir = path.join(process.cwd(), 'docs', 'packages');
  const docFileName = `${name}.md`;
  const docPath = path.join(docsDir, docFileName);
  
  if (!fs.existsSync(docPath)) {
    warning(`[${name}] 未找到对应的文档文件: ${docPath}`);
    return;
  }
  
  try {
    // 使用 changelog-helper 更新文档
    const changelogHelperPath = path.join(process.cwd(), 'scripts', 'changelog-helper.cjs');
    const changeType = versionType === 'major' ? 'UPDATE' : 
                      versionType === 'minor' ? 'ADD' : 'OPTIMIZE';
    const changeContent = versionType === 'major' ? '重大更新' : 
                         versionType === 'minor' ? '新增功能' : '性能优化和bug修复';
    
    execSync(
      `node "${changelogHelperPath}" add "${docPath}" "${newVersion}" "${changeType}" "${changeContent}"`,
      { stdio: 'inherit' }
    );
    
    success(`[${name}] 文档 Changelog 已更新`);
  } catch (err) {
    error(`[${name}] 更新文档 Changelog 失败: ${err.message}`);
  }
}

/**
 * 重建文档
 */
function rebuildDocs() {
  try {
    info('开始重建文档...');
    execSync('pnpm run docs:build', { stdio: 'inherit' });
    success('文档重建完成');
  } catch (err) {
    error(`文档重建失败: ${err.message}`);
    throw err;
  }
}

/**
 * 检查 NPM_TOKEN 是否存在
 */
function checkNpmToken() {
  const npmToken = process.env.NODE_AUTH_TOKEN || process.env.NPM_TOKEN;
  if (!npmToken) {
    warning('NODE_AUTH_TOKEN 或 NPM_TOKEN 环境变量未设置，可能无法发布到 npm');
    return false;
  }
  return true;
}

/**
 * 主函数
 */
async function main() {
  try {
    info(`开始执行发布流程 (${versionType} 版本)...`);
    
    // 检查 NPM token
    checkNpmToken();
    
    // 获取要处理的包
    const packages = getPackages();
    
    if (packages.length === 0) {
      error('未找到任何包');
      process.exit(1);
    }
    
    info(`找到 ${packages.length} 个包: ${packages.map(p => p.name).join(', ')}`);
    
    // 处理每个包
    let publishedCount = 0;
    for (const pkg of packages) {
      console.log('\n---');
      info(`处理包: ${pkg.name}`);
      
      // 1. 更新版本号
      const versionInfo =  updateVersion(pkg, versionType);
      
      // 2. 构建包
      buildPackage(pkg);
      
      // 3. 更新文档 Changelog
      updateDocsChangelog(pkg, versionInfo);
      
      // 4. 发布包
      const isPublished = publishPackage(pkg);
      if (isPublished) {
        publishedCount++;
      }
    }
    
    // 5. 重建文档
    // rebuildDocs();
    
    console.log('\n---');
    success(`所有包发布完成! 成功发布 ${publishedCount}/${packages.length} 个包`);
    
  } catch (err) {
    error(`发布流程失败: ${err.message}`);
    process.exit(1);
  }
}

// 显示帮助信息
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📦 一键发布脚本

用法:
  node scripts/publish-packages.js [包名] [版本类型]

参数:
  包名       (可选) 指定要发布的包名，如果不指定则发布所有包
  版本类型   (可选) 版本更新类型: major, minor, patch (默认: patch)

示例:
  # 发布所有包 (patch 版本)
  node scripts/publish-packages.js
  
  # 发布所有包 (minor 版本)
  node scripts/publish-packages.js "" minor
  
  # 发布指定包 (major 版本)
  node scripts/publish-packages.js core-utils major
`);
  process.exit(0);
}

// 执行主函数
main();