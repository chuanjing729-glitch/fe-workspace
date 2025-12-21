import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import RecentUpdates from './components/RecentUpdates.vue'
import './custom.css'

export default {
    ...DefaultTheme,
    Layout() {
        const { theme, frontmatter } = useData()
        const announce = theme.value.announcement

        return h(DefaultTheme.Layout, null, {
            // 插入到布局最顶部
            'layout-top': () => announce?.show ? h('div', { class: 'vp-announcement' }, [
                h('span', { class: 'vp-announcement-text' }, announce.text),
                announce.link ? h('a', { class: 'vp-announcement-link', href: announce.link }, ' 立即查看 →') : null
            ]) : null,
            // 首页 Features 之后插入最近更新
            'home-features-after': () => h(RecentUpdates),
            'doc-after': () => h('div', { class: 'vp-doc-author' }, '作者：Chuanjing Li')
        })
    }
}
