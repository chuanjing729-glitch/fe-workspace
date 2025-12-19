import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
    ...DefaultTheme,
    Layout() {
        return h(DefaultTheme.Layout, null, {
            'doc-before': () => h('div', { class: 'vp-doc-author' }, '作者：Chuanjing Li')
        })
    }
}
