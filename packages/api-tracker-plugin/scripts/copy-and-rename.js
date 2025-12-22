const fs = require('fs');
const path = require('path');

// Function to copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Function to rename .ts files to .js files
function renameTsToJs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (let entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      renameTsToJs(entryPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      const newPath = entryPath.replace(/\.ts$/, '.js');
      fs.renameSync(entryPath, newPath);
    }
  }
}

// Copy src to dist
console.log('Copying src to dist...');
copyDir('src', 'dist');

// Rename .ts files to .js files
console.log('Renaming .ts files to .js files...');
renameTsToJs('dist');

console.log('Done!');