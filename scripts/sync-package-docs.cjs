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
 * 生成 Frontmatter
 * @param {Object} pkg 包信息
 * @param {string} type 文件类型 'readme' | 'changelog'
 * @returns {string} Frontmatter 字符串
 */
function getFrontmatter(pkg, type) {
  const title = type === 'readme' ? pkg.name : `${pkg.name} Changelog`;
  const order = type === 'readme' ? 1 : 2;

  return `---
title: ${title}
order: ${order}
editLink: true
---

`;
}

/**
 * 复制资源文件（如图片）并重写引用
 * @param {string} content 文件内容
 * @param {Object} pkg 包信息
 * @returns {string} 处理后的内容
 */
function processAssets(content, pkg) {
  const imgRegex = /!\[([^\]]*)\]\((?!http)([^)]+)\)/g;
  const assetsDir = path.join(pkg.docsPath, 'assets');
  let hasAssets = false;

  const newContent = content.replace(imgRegex, (match, alt, imgPath) => {
    try {
      const srcImgPath = path.resolve(pkg.path, imgPath);
      if (fs.existsSync(srcImgPath)) {
        if (!hasAssets) {
          if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
          }
          hasAssets = true;
        }

        const imgFileName = path.basename(srcImgPath);
        const destImgPath = path.join(assetsDir, imgFileName);

        // 复制图片
        fs.copyFileSync(srcImgPath, destImgPath);

        // 返回新的相对路径引用
        return `![${alt}](./assets/${imgFileName})`;
      } else {
        warning(`[${pkg.name}] 图片未找到: ${srcImgPath}`);
        return match;
      }
    } catch (e) {
      error(`[${pkg.name}] 处理图片失败: ${e.message}`);
      return match;
    }
  });

  return newContent;
}

/**
 * 处理链接：
 * 1. 如果是 .md 文件，则复制该文件到目标目录，并保持相对引用
 * 2. 如果是其他文件（源码），则转换为 GitHub 绝对链接
 * @param {string} content 文件内容
 * @param {Object} pkg 包信息
 * @returns {string} 处理后的内容
 */
function processLinks(content, pkg) {
  const linkRegex = /\[([^\]]+)\]\((?!http)([^)]+)\)/g;
  const repoBase = 'https://github.com/chuanjing729-glitch/fe-workspace/blob/main';
  const packagePath = `packages/${pkg.name}`;

  return content.replace(linkRegex, (match, text, link) => {
    // 忽略锚点链接
    if (link.startsWith('#')) return match;

    // 如果是图片，不在此处重写
    if (text.match(/!\[.*\]/)) return match;

    // 移除 hash 用于文件检查
    const linkPath = link.split('#')[0];
    const anchor = link.split('#')[1] ? '#' + link.split('#')[1] : '';

    try {
      const srcPath = path.resolve(pkg.path, linkPath);

      // 情况1: 是 Markdown 引用
      if (linkPath.endsWith('.md') && fs.existsSync(srcPath)) {
        const fileName = path.basename(linkPath);
        const destPath = path.join(pkg.docsPath, fileName);

        // 避免处理自身
        if (path.resolve(pkg.path, 'README.md') === srcPath) return match;

        // 特殊处理 CHANGELOG: 映射到 changelog.md
        if (fileName.toUpperCase() === 'CHANGELOG.MD') {
          return `[${text}](./changelog.md${anchor})`;
        }

        // 递归复制并处理引用的 MD 文件
        if (!fs.existsSync(destPath) || fs.statSync(srcPath).mtime > fs.statSync(destPath).mtime) {
          let nestedContent = fs.readFileSync(srcPath, 'utf-8');

          // 递归处理资源和链接
          nestedContent = processAssets(nestedContent, pkg);
          nestedContent = processLinks(nestedContent, pkg);

          // 简单的 Frontmatter (Title only)
          const nestedFrontmatter = `---
title: ${fileName.replace('.md', '')}
editLink: true
---

`;
          fs.writeFileSync(destPath, nestedFrontmatter + nestedContent, 'utf-8');
          success(`[${pkg.name}] 递归同步文档: ${fileName}`);
        }

        // 返回相对链接
        return `[${text}](./${fileName}${anchor})`;
      }

      // 情况2: 源码或其他文件 -> GitHub Blob
      const absPath = path.posix.join(packagePath, linkPath);
      return `[${text}](${repoBase}/${absPath})`;

    } catch (e) {
      warning(`[${pkg.name}] 处理链接失败: ${link} - ${e.message}`);
      return match;
    }
  });
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

  try {
    // 确保目标目录存在
    if (!fs.existsSync(pkg.docsPath)) {
      fs.mkdirSync(pkg.docsPath, { recursive: true });
    }

    let content = fs.readFileSync(srcReadme, 'utf-8');

    // 1. 注入 Frontmatter
    const frontmatter = getFrontmatter(pkg, 'readme');

    // 2. 处理资源图片
    content = processAssets(content, pkg);

    // 3. 处理链接 (支持递归 Markdown 同步)
    content = processLinks(content, pkg);

    const finalContent = frontmatter + content;

    fs.writeFileSync(destReadme, finalContent, 'utf-8');

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
    // Changelog 是可选的，不报错
    return true;
  }

  try {
    if (!fs.existsSync(pkg.docsPath)) {
      fs.mkdirSync(pkg.docsPath, { recursive: true });
    }

    let content = fs.readFileSync(srcChangelog, 'utf-8');
    const frontmatter = getFrontmatter(pkg, 'changelog');

    fs.writeFileSync(destChangelog, frontmatter + content, 'utf-8');

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
  let packageName = packageArgs[0];

  // 处理 lint-staged 传入的路径情况 (例如: packages/foo/README.md)
  if (packageName && packageName.includes('packages')) {
    const parts = packageName.split(path.sep);
    const packagesIndex = parts.indexOf('packages');
    if (packagesIndex !== -1 && packagesIndex + 1 < parts.length) {
      packageName = parts[packagesIndex + 1];
    }
  }

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