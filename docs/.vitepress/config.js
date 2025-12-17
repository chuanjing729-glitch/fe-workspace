import { defineConfig } from 'vitepress'
import { sidebar } from './config/sidebar'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/fe-workspace/',
  title: "前端工程效率空间",
  description: "前端工程效率平台提升开发质量、效率和性能",
  
  // 构建优化
  buildEnd: {
    ssr: true,
    ssg: true
  },
  
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '介绍', link: '/' },
      { text: '规范', link: '/specs/' },
      { text: '插件', link: '/packages/webpack-spec-plugin/' },
      { text: '工具库', link: '/packages/' },
      { text: 'AI 指南', link: '/ai-guidelines/' }
    ],

    sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/chuanjing729-glitch/fe-workspace' }
    ]
  }
})
