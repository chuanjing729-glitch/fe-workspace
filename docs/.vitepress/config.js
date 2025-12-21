import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid';
import { sidebar } from './config/sidebar'
import { getRecentUpdates } from '../../scripts/git-helper.cjs'

const recentUpdates = getRecentUpdates(5)

// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
  base: '/fe-workspace/',
  cleanUrls: true,
  title: "前端工程效率空间",
  description: "前端工程效率平台提升开发质量、效率和性能",
  head: [],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '介绍', link: '/' },
      { text: '规范', link: '/specs/' },
      { text: '插件', link: '/packages/plugins' },
      { text: '工具库', link: '/packages/tools' },
      { text: 'AI 指南', link: '/ai-guidelines/' }
    ],

    // 自定义：全站公告内容
    announcement: {
      show: true,
      text: '✨ 规范体系升级：新增“存量治理（基线机制）”及“自动化同步”规范，建议团队查阅。',
      link: '/specs/coding/null-safety-specification#存量代码治理-baseline-机制'
    },

    recentUpdates,

    sidebar,

    outline: {
      level: [2, 3],
      label: '本页目录'
    },

    search: {
      provider: 'local'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/chuanjing729-glitch/fe-workspace' }
    ]
  }
}));
