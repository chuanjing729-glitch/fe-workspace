import { defineConfig } from 'vitepress'
import { sidebar } from './config/sidebar.js'

export default defineConfig({
  title: '前端工程效率平台',
  description: '提升前端开发质量、效率和性能的统一工作空间',
  
  base: '/',
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Webpack插件', link: '/packages/webpack-spec-plugin/' },
      { text: 'AI 编码助手', link: '/ai-guidelines/' },
      { text: '完整规范', link: '/specs/' },
      { text: '前端工具库', link: '/packages/core-utils/' }
    ],
    
    sidebar,
    
    // socialLinks: [
    //   { icon: 'github', link: 'https://github.com/your-org/fe-efficiency' }
    // ]
  },
  
  vite: {
    server: {
      port: 3000
    }
  }
})