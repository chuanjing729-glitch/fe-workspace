#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 获取命令行参数
const packageName = process.argv[2];

if (!packageName) {
  console.error('请提供包名，例如: node scripts/create-package.js my-new-package');
  process.exit(1);
}

// 创建包目录
const packageDir = path.join('packages', packageName);
if (!fs.existsSync(packageDir)) {
  fs.mkdirSync(packageDir, { recursive: true });
}

// 创建 package.json
const packageJson = {
  name: `@fe-efficiency/${packageName}`,
  version: '0.0.1',
  description: '',
  main: 'dist/index.js',
  module: 'dist/index.mjs',
  types: 'dist/index.d.ts',
  files: ['dist'],
  scripts: {
    build: 'vite build',
    dev: 'vite',
    test: 'vitest',
    lint: 'eslint . --ext .ts,.vue',
    'type-check': 'tsc --noEmit'
  },
  keywords: [],
  author: 'Chuanjing Li',
  license: 'MIT',
  dependencies: {},
  devDependencies: {}
};

fs.writeFileSync(
  path.join(packageDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

// 创建基本的目录结构
const srcDir = path.join(packageDir, 'src');
if (!fs.existsSync(srcDir)) {
  fs.mkdirSync(srcDir, { recursive: true });
}

// 创建入口文件
fs.writeFileSync(
  path.join(srcDir, 'index.ts'),
  '// 导出你的模块\nexport {};\n'
);

// 创建 Vite 配置文件
const viteConfig = `import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '${packageName.replace(/-/g, '_')}',
      formats: ['es', 'cjs'],
      fileName: (format) => \`index.\${format}.js\`,
    },
    rollupOptions: {
      external: [], // 在这里添加外部依赖
      output: {
        globals: {}, // 在这里添加全局变量
      },
    },
  },
});
`;

fs.writeFileSync(path.join(packageDir, 'vite.config.ts'), viteConfig);

// 创建 TypeScript 配置
const tsConfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`;

fs.writeFileSync(path.join(packageDir, 'tsconfig.json'), tsConfig);

// 创建 README.md
fs.writeFileSync(
  path.join(packageDir, 'README.md'),
  `# ${packageName}

## 介绍

这是工作空间中的一个包。

## 安装

\`\`\`bash
pnpm add @fe-efficiency/${packageName}
\`\`\`

## 使用

\`\`\`typescript
import {} from '@fe-efficiency/${packageName}';
\`\`\`
`
);

console.log(`包 ${packageName} 已成功创建于 ${packageDir}`);