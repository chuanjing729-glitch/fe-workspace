import { fileURLToPath, URL } from 'node:url'

export default {
  base: '/fe-workspace/',
  title: 'FE Workspace Docs',
  description: 'FE Workspace Documentation',
  themeConfig: {
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'What is this?', link: '/introduction' }
        ]
      },
      {
        text: 'Components',
        items: [
          { text: 'Button', link: '/components/button' }
        ]
      }
    ]
  },
  vite: {
    resolve: {
      alias: {
        '@fe-workspace/button': fileURLToPath(new URL('../../packages/button/index.js', import.meta.url))
      }
    }
  }
}
