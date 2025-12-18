#!/usr/bin/env node

/**
 * 包文档同步工具
 * 用于同步 packages 目录下的包文档到 docs/packages 目录
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

function debug(message) {
  if (process.env.DEBUG) {
    log(colors.cyan, `🔍 ${message}`);
  }
}

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
 * 获取所有包的信息
 * @returns {Array} 包信息数组
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
      docsPath: path.join(process.cwd(), 'docs', 'packages', name)
    }));

  return packages;
}

/**
 * 获取指定包的信息
 * @param {string} packageName 包名
 * @returns {Object} 包信息
 */
function getPackageInfo(packageName) {
  const packages = getAllPackages();
  const pkg = packages.find(p => p.name === packageName);
  
  if (!pkg) {
    throw new Error(`包 "${packageName}" 不存在`);
  }
  
  return pkg;
}

/**
 * 检查文件是否需要更新（增量同步）
 * @param {string} srcPath 源文件路径
 * @param {string} destPath 目标文件路径
 * @returns {boolean} 是否需要更新
 */
function isFileUpdated(srcPath, destPath) {
  if (!fs.existsSync(destPath)) {
    debug(`目标文件不存在，需要更新: ${destPath}`);
    return true;
  }
  
  const srcStat = fs.statSync(srcPath);
  const destStat = fs.statSync(destPath);
  
  const needUpdate = srcStat.mtime > destStat.mtime;
  debug(`文件比较 - 源: ${srcPath} (${srcStat.mtime}), 目标: ${destPath} (${destStat.mtime}), 需要更新: ${needUpdate}`);
  
  return needUpdate;
}

/**
 * 检查是否存在同步冲突
 * @param {string} srcPath 源文件路径
 * @param {string} destPath 目标文件路径
 * @returns {Object} 冲突信息
 */
function checkConflict(srcPath, destPath) {
  // 检查目标文件是否存在
  if (!fs.existsSync(destPath)) {
    return { hasConflict: false };
  }
  
  // 检查源文件是否存在
  if (!fs.existsSync(srcPath)) {
    return { hasConflict: false };
  }
  
  // 获取文件内容的哈希值进行比较
  const srcContent = fs.readFileSync(srcPath, 'utf-8');
  const destContent = fs.readFileSync(destPath, 'utf-8');
  
  // 简单的哈希比较
  const crypto = require('crypto');
  const srcHash = crypto.createHash('md5').update(srcContent).digest('hex');
  const destHash = crypto.createHash('md5').update(destContent).digest('hex');
  
  return {
    hasConflict: srcHash !== destHash,
    srcHash,
    destHash
  };
}

/**
 * 同步 README.md 文件
 * @param {Object} pkg 包信息
 * @param {Object} options 同步选项
 * @returns {boolean} 是否成功
 */
function syncReadme(pkg, options = {}) {
  const srcReadme = path.join(pkg.path, 'README.md');
  const destReadme = path.join(pkg.docsPath, 'index.md');
  
  if (!fs.existsSync(srcReadme)) {
    warning(`[${pkg.name}] 源 README.md 文件不存在`);
    return false;
  }
  
  // 检查是否存在冲突
  if (options.checkConflict) {
    const conflictInfo = checkConflict(srcReadme, destReadme);
    if (conflictInfo.hasConflict) {
      warning(`[${pkg.name}] README.md 存在冲突，源文件和目标文件内容不同`);
      if (!options.force) {
        error(`[${pkg.name}] 同步已中止，使用 --force 选项强制同步`);
        return false;
      } else {
        warning(`[${pkg.name}] 使用 --force 选项强制同步`);
      }
    }
  }
  
  // 检查是否需要更新
  if (!options.force && !isFileUpdated(srcReadme, destReadme)) {
    info(`[${pkg.name}] README.md 无需更新`);
    return true;
  }
  
  try {
    // 确保目标目录存在
    if (!fs.existsSync(pkg.docsPath)) {
      fs.mkdirSync(pkg.docsPath, { recursive: true });
    }
    
    // 复制文件
    const content = fs.readFileSync(srcReadme, 'utf-8');
    fs.writeFileSync(destReadme, content, 'utf-8');
    
    success(`[${pkg.name}] README.md 同步完成`);
    return true;
  } catch (err) {
    error(`[${pkg.name}] README.md 同步失败: ${err.message}`);
    return false;
  }
}

/**
 * 同步 CHANGELOG.md 文件
 * @param {Object} pkg 包信息
 * @param {Object} options 同步选项
 * @returns {boolean} 是否成功
 */
function syncChangelog(pkg, options = {}) {
  const srcChangelog = path.join(pkg.path, 'CHANGELOG.md');
  const destChangelog = path.join(pkg.docsPath, 'changelog.md');
  
  if (!fs.existsSync(srcChangelog)) {
    warning(`[${pkg.name}] 源 CHANGELOG.md 文件不存在`);
    return false;
  }
  
  // 检查是否存在冲突
  if (options.checkConflict) {
    const conflictInfo = checkConflict(srcChangelog, destChangelog);
    if (conflictInfo.hasConflict) {
      warning(`[${pkg.name}] CHANGELOG.md 存在冲突，源文件和目标文件内容不同`);
      if (!options.force) {
        error(`[${pkg.name}] 同步已中止，使用 --force 选项强制同步`);
        return false;
      } else {
        warning(`[${pkg.name}] 使用 --force 选项强制同步`);
      }
    }
  }
  
  // 检查是否需要更新
  if (!options.force && !isFileUpdated(srcChangelog, destChangelog)) {
    info(`[${pkg.name}] CHANGELOG.md 无需更新`);
    return true;
  }
  
  try {
    // 确保目标目录存在
    if (!fs.existsSync(pkg.docsPath)) {
      fs.mkdirSync(pkg.docsPath, { recursive: true });
    }
    
    // 复制文件
    const content = fs.readFileSync(srcChangelog, 'utf-8');
    fs.writeFileSync(destChangelog, content, 'utf-8');
    
    success(`[${pkg.name}] CHANGELOG.md 同步完成`);
    return true;
  } catch (err) {
    error(`[${pkg.name}] CHANGELOG.md 同步失败: ${err.message}`);
    return false;
  }
}

/**
 * 同步单个包的文档
 * @param {Object} pkg 包信息
 * @param {Object} options 同步选项
 * @returns {boolean} 是否成功
 */
function syncPackage(pkg, options = {}) {
  info(`[${pkg.name}] 开始同步文档...`);
  
  let successCount = 0;
  let failCount = 0;
  
  // 同步 README.md
  if (syncReadme(pkg, options)) {
    successCount++;
  } else {
    failCount++;
  }
  
  // 同步 CHANGELOG.md（如果存在）
  if (fs.existsSync(path.join(pkg.path, 'CHANGELOG.md'))) {
    if (syncChangelog(pkg, options)) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  if (failCount === 0) {
    success(`[${pkg.name}] 文档同步完成 (${successCount} 个文件成功)`);
    return true;
  } else {
    error(`[${pkg.name}] 文档同步完成 (${successCount} 个文件成功, ${failCount} 个文件失败)`);
    return false;
  }
}

/**
 * 批量同步所有包的文档
 * @param {Object} options 同步选项
 */
function syncAllPackages(options = {}) {
  try {
    const packages = getAllPackages();
    info(`找到 ${packages.length} 个包`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const pkg of packages) {
      console.log('');
      if (syncPackage(pkg, options)) {
        successCount++;
      } else {
        failCount++;
      }
    }
    
    console.log('\n---');
    if (failCount === 0) {
      success(`所有包文档同步完成! (${successCount}/${packages.length} 个包成功)`);
    } else {
      warning(`包文档同步完成! (${successCount}/${packages.length} 个包成功, ${failCount} 个包失败)`);
    }
  } catch (err) {
    error(`批量同步失败: ${err.message}`);
    process.exit(1);
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
📦 包文档同步工具

用法:
  node scripts/sync-package-docs.cjs [包名] [选项]

参数:
  包名    (可选) 指定要同步的包名，如果不指定则同步所有包

选项:
  --help, -h        显示帮助信息
  --force, -f       强制同步，忽略时间戳检查
  --check-conflict  检查同步冲突
  --debug           显示调试信息
  --dry-run         预演模式，不实际执行同步

示例:
  # 同步所有包的文档
  node scripts/sync-package-docs.cjs
  
  # 同步指定包的文档
  node scripts/sync-package-docs.cjs core-utils
  
  # 强制同步指定包的文档
  node scripts/sync-package-docs.cjs core-utils --force
  
  # 检查冲突并同步
  node scripts/sync-package-docs.cjs --check-conflict
`);
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  // 显示帮助
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  // 解析选项
  const options = {
    force: args.includes('--force') || args.includes('-f'),
    checkConflict: args.includes('--check-conflict'),
    dryRun: args.includes('--dry-run')
  };
  
  // 设置调试模式
  if (args.includes('--debug')) {
    process.env.DEBUG = 'true';
  }
  
  // 过滤掉选项参数，获取包名
  const packageArgs = args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-'));
  const packageName = packageArgs[0];
  
  // 预演模式
  if (options.dryRun) {
    info('预演模式：不会实际执行同步操作');
  }
  
  if (packageName) {
    // 同步指定包
    try {
      const pkg = getPackageInfo(packageName);
      if (!options.dryRun) {
        syncPackage(pkg, options);
      } else {
        info(`预演：将同步包 ${packageName}`);
      }
    } catch (err) {
      error(err.message);
      process.exit(1);
    }
  } else {
    // 同步所有包
    if (!options.dryRun) {
      syncAllPackages(options);
    } else {
      info('预演：将同步所有包');
    }
  }
}

// 执行主函数
if (require.main === module) {
  main();
}

// 导出函数供其他脚本使用
module.exports = {
  getAllPackages,
  getPackageInfo,
  syncPackage,
  syncAllPackages
};