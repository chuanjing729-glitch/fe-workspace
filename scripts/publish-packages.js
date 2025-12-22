import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const SCOPE = '@51jbs/';

const args = process.argv.slice(2);
let packageNameArg = null;
let isDryRun = false;
let useChangeset = true;

// Parse arguments
for (const arg of args) {
  if (arg === '--dry-run') {
    isDryRun = true;
  } else if (arg === '--no-changeset') {
    useChangeset = false;
  } else if (!arg.startsWith('--')) {
    packageNameArg = arg;
  }
}

console.log(`🚀 Starting publish process (Dry Run: ${isDryRun ? 'YES' : 'NO'})`);

try {
  if (useChangeset && !packageNameArg) {
    // 1. Changeset Publish (Standard Flow)
    console.log('📦 Using Changeset to publish all changed packages...');
    const cmd = `pnpm exec changeset publish`;
    if (!isDryRun) {
      execSync(cmd, { stdio: 'inherit' });
    } else {
      console.log(`[Dry Run] Would execute: ${cmd}`);
    }
  } else if (packageNameArg) {
    // 2. Specific Package Publish (Manual Breakout)
    let finalPackageName = packageNameArg;
    if (!finalPackageName.startsWith('@')) {
      finalPackageName = SCOPE + finalPackageName;
    }

    console.log(`📦 Publishing specific package: ${finalPackageName}`);

    // Build first (Custom standard)
    console.log(`🔨 Building ${finalPackageName}...`);
    execSync(`pnpm --filter ${finalPackageName} run build`, { stdio: 'inherit' });

    const publishCommand = `pnpm --filter ${finalPackageName} publish --access public --no-git-checks`;
    if (!isDryRun) {
      execSync(publishCommand, { stdio: 'inherit' });
    } else {
      console.log(`[Dry Run] Would execute: ${publishCommand}`);
    }
  }

  // 3. Trigger docs sync
  console.log('📝 Syncing documentation...');
  if (!isDryRun) {
    execSync('pnpm docs:sync', { stdio: 'inherit' });
  } else {
    console.log('[Dry Run] Would execute: pnpm docs:sync');
  }

  console.log('✅ Publish process completed.');

} catch (error) {
  console.error('❌ Publish failed:');
  console.error(error.message);
  process.exit(1);
}