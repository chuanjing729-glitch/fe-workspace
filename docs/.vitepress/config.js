import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/fe-workspace/",
  title: "前端工程效率平台",
  description: "前端工程效率平台",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: 'Webpack插件', link: '/webpack' },
      { text: 'AI 编码助手', link: '/ai' },
      { text: '完整规范', link: '/specs/coding' },
      { text: '前端工具库', link: '/utils' }
    ],

    sidebar: {
      '/specs/': [
        {
          text: '规范',
          items: [
            { text: '编码规范', link: '/specs/coding/' },
            { text: '注释规范', link: '/specs/coding/comments' },
            { text: '命名规范', link: '/specs/coding/naming' },
            { text: 'Git规范', link: '/specs/git/' },
            { text: '文档规范', link: '/specs/docs/' },
          ]
        }
      ],
      '/utils/': [
        {
          text: '工具库',
          items: [
            { text: '日期', link: '/utils/date' },
            { text: '字符串', link: '/utils/string' },
            { text: '数组', link: '/utils/array' },
            { text: '浏览器', link: '/utils/bom' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
