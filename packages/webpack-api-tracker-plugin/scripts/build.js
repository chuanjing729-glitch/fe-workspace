const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure lib directory exists
const libDir = path.join(__dirname, 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

// Compile all TypeScript files
console.log('Compiling TypeScript files...');
execSync('npx tsc --project tsconfig.json --outDir lib', { stdio: 'inherit' });

console.log('Build completed successfully!');