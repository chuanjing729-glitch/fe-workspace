import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Config['sidebar'] = {
  '/guides/': [
    {
      text: '使用指南',
      items: [
        { text: '快速开始', link: '/guides/getting-started' }
      ]
    }
  ],
  '/specs/': [
    {
      text: '规范文档',
      // items: [
      //   { text: '代码规范标准', link: '/specs/code-standards' },
      //   { text: '开发流程与规范', link: '/specs/development-process' },
      //   { 
      //     text: '前端开发规范', 
      //     link: '/specs',
      //     collapsed: true,
      //     items: [
      //       { text: '代码规范', link: '/specs/frontend/coding-standards' },
      //       { text: '文件命名规范', link: '/specs/frontend/file-naming' },
      //       { text: 'JavaScript规范', link: '/specs/frontend/javascript' },
      //       { text: 'CSS规范', link: '/specs/frontend/css' },
      //       { text: 'Vue规范', link: '/specs/frontend/vue' },
      //       { text: '性能优化规范', link: '/specs/frontend/performance' },
      //       { text: '技术方案设计规范', link: '/specs/frontend/technical-design' },
      //       { text: '技术设计文档模板', link: '/specs/frontend/technical-document' },
      //       { text: '资源处理规范', link: '/specs/frontend/asset-processing' },
      //       { text: '构建与部署规范', link: '/specs/frontend/build-deployment' },
      //       { text: '测试规范', link: '/specs/frontend/testing' },
      //       { text: '微前端规范', link: '/specs/frontend/micro-frontend' },
      //       { text: '内存管理规范', link: '/specs/frontend/memory-management' },
      //       { text: 'Git工作流规范', link: '/specs/frontend/git-workflow' },
      //       { text: 'Code Review规范', link: '/specs/frontend/code-review' }
      //     ]
      //   }
      // ]
    }
  ],
  '/packages/': [
    {
      text: '工具包',
      // items: [
      //   { text: '前端工具库', link: '/packages/fe-toolkit/' }
      // ]
    }
  ]
}