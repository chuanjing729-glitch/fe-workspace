import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "FE",
  description: "A VitePress Site",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '介绍', link: '/' },
      { text: '开始', link: '/guides/getting-started' }
    ],

    sidebar: [
      {
        text: '介绍',
        items: [
          { text: '快速开始', link: '/guides/getting-started' },
          { text: 'AI 规范', link: '/ai-guidelines/' },
          { text: 'Webpack 插件', link: '/packages/webpack-spec-plugin/' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/chuanjing729-glitch/fe-workspace' }
    ]
  }
})
