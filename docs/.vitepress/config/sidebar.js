export const sidebar = {
  // Webpack 规范检查插件
  '/packages/webpack-spec-plugin/': [
    {
      text: 'Webpack 规范检查插件',
      items: [
        { text: '总览', link: '/packages/webpack-spec-plugin/' },
        { text: '快速开始', link: '/packages/webpack-spec-plugin/quick-start' },
        { text: '功能特性', link: '/packages/webpack-spec-plugin/features' },
        { text: '真实项目验证', link: '/packages/webpack-spec-plugin/validation-report' },
        { text: '生产环境评估', link: '/packages/webpack-spec-plugin/production-evaluation' },
        { text: '更新日志', link: '/packages/webpack-spec-plugin/changelog' }
      ]
    }
  ],

  // 前端工具库
  '/packages/core-utils/': [
    {
      text: '前端工具库',
      items: [
        { text: '总览', link: '/packages/core-utils/' },
        { text: 'DOM 操作', link: '/packages/core-utils/dom' },
        { text: '数据校验', link: '/packages/core-utils/validation' },
        { text: '格式化工具', link: '/packages/core-utils/format' },
        { text: '事件管理', link: '/packages/core-utils/event' },
        { text: 'HTTP 请求', link: '/packages/core-utils/http' },
        { text: 'Mixins 资源管理', link: '/packages/vue2-toolkit/mixins' }
      ]
    }
  ],

  // 完整规范
  '/specs/': [
    {
      text: '规范总览',
      items: [
        { text: '总览', link: '/specs/' }
      ]
    },
    {
      text: '代码编写规范',
      collapsed: false,
      items: [
        { text: '编码规范总览', link: '/specs/coding/' },
        { text: '命名规范', link: '/specs/coding/naming' },
        { text: 'JS/TS 规范', link: '/specs/coding/javascript' },
        { text: 'Vue 组件规范', link: '/specs/coding/vue' },
        { text: 'CSS 样式规范', link: '/specs/coding/css' },
        { text: '注释规范', link: '/specs/coding/comments' },
        { text: '边界处理规范', link: '/specs/coding/boundary-specification' },
        { text: '空指针防护规范', link: '/specs/coding/null-safety-specification' },
        { text: '事件规范', link: '/specs/coding/event-specification' },
        { text: 'NPM 包规范', link: '/specs/coding/npm-package' }
      ]
    },
    {
      text: '工程化规范',
      collapsed: false,
      items: [
        { text: '工程化总览', link: '/specs/engineering/' },
        { text: 'Git 工作流', link: '/specs/engineering/git-workflow' },
        { text: 'Code Review', link: '/specs/engineering/code-review' },
        { text: '构建与部署', link: '/specs/engineering/build-deploy' },
        { text: '测试规范', link: '/specs/engineering/testing' }
      ]
    },
    {
      text: '设计规范',
      collapsed: false,
      items: [
        { text: '设计规范总览', link: '/specs/design/' },
        { text: '技术方案设计', link: '/specs/design/technical-design' },
        { text: '技术设计文档模板', link: '/specs/design/technical-document' },
        { text: '架构设计规范', link: '/specs/design/architecture' }
      ]
    },
    {
      text: '性能优化规范',
      collapsed: false,
      items: [
        { text: '优化总览', link: '/specs/optimization/' },
        { text: '性能优化', link: '/specs/optimization/performance' },
        { text: '内存管理', link: '/specs/optimization/memory' },
        { text: '资源处理', link: '/specs/optimization/assets' }
      ]
    },
    {
      text: '前端开发规范',
      collapsed: true,
      items: [
        { text: '前端规范总览', link: '/specs/frontend/' },
        { text: '代码规范', link: '/specs/frontend/coding-standards' },
        { text: 'JavaScript 规范', link: '/specs/frontend/javascript' },
        { text: 'Vue 规范', link: '/specs/frontend/vue' },
        { text: 'CSS 规范', link: '/specs/frontend/css' },
        { text: '文件命名规范', link: '/specs/frontend/file-naming' },
        { text: '性能优化规范', link: '/specs/frontend/performance' },
        { text: '内存管理规范', link: '/specs/frontend/memory-management' }
      ]
    },
    {
      text: 'AI 使用规范',
      collapsed: false,
      items: [
        { text: '总览', link: '/ai-guidelines/' },
        { text: '基础使用技巧', link: '/ai-guidelines/basic-usage' },
        { text: '高阶使用技巧', link: '/ai-guidelines/advanced-techniques' },
        { text: '提示词与指令规范', link: '/ai-guidelines/prompt-engineering' },
        { text: '代码质量保障', link: '/ai-guidelines/code-quality' },
        { text: '安全使用规范', link: '/ai-guidelines/security-guidelines' },
        { text: '团队协作最佳实践', link: '/ai-guidelines/team-collaboration' },
        { text: '项目集成指南', link: '/ai-guidelines/project-integration' }
      ]
    }
  ]
}