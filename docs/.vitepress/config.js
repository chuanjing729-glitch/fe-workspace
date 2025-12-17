import { defineConfig } from 'vitepress'
import { sidebar } from './config/sidebar'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/fe-workspace/',
  title: "前端工程效率空间",
  description: "前端工程效率平台提升开发质量、效率和性能",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '介绍', link: '/' },
      { text: '开始', link: '/guides/getting-started' }
    ],

    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/chuanjing729-glitch/fe-workspace' }
    ]
  }
})
