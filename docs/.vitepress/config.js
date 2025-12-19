import { defineConfig } from 'vitepress'
import { sidebar } from './config/sidebar'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/fe-workspace/',
  title: "前端工程效率空间",
  description: "前端工程效率平台提升开发质量、效率和性能",
  head: [
    ['link', { rel: 'icon', href: '/fe-workspace/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/fe-workspace/favicon.ico' }],
    ['link', { rel: 'shortcut icon', href: '/fe-workspace/favicon.ico' }]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '介绍', link: '/' },
      { text: '规范', link: '/specs/' },
      { text: '插件', link: '/packages/plugins' },
      { text: '工具库', link: '/packages/tools' },
      { text: 'AI 指南', link: '/ai-guidelines/' }
    ],

    sidebar,

    search: {
      provider: 'local'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/chuanjing729-glitch/fe-workspace' }
    ]
  }
});
