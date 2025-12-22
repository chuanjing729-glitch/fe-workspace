import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.js'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      'test/README.md',
      // 排除那些不是真正测试文件的脚本
      'test/check-project.js',
      'test/core-check-test.js',
      'test/debug-js-rule.js',
      'test/debug-security-performance.js',
      'test/full-validation-test.js',
      'test/quick-check.js',
      'test/static-scan.js',
      'test/test-all-rules.js',
      'test/test-boundary-rule.js',
      'test/test-enhanced-rules.js',
      'test/test-new-rules.js',
      'test/test-production-ready.js',
      'test/verify-boundary-in-real-project.js'
    ],
    // 禁用多线程以避免 process.chdir 问题
    threads: false
  }
})