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
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        allow: ['..']
      }
    }
  }
}
