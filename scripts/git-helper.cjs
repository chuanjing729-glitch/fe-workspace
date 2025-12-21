import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

/**
 * 提取最近更新的文档列表
 * @param {number} count - 提取的数量
 * @returns {Array} - 更新列表
 */
export function getRecentUpdates(count = 5) {
    try {
        // 获取最近修改的 markdown 文件
        const output = execSync(
            `git log --name-only --pretty=format:"%h|%at|%s" -n 50 -- "docs/**/*.md"`,
            { encoding: 'utf-8' }
        )

        const lines = output.split('\n')
        const updates = []
        const seenFiles = new Set()

        let currentCommit = null

        for (const line of lines) {
            if (line.includes('|')) {
                const [hash, timestamp, message] = line.split('|')
                currentCommit = { hash, timestamp: parseInt(timestamp) * 1000, message }
            } else if (line.trim() && line.endsWith('.md')) {
                const filePath = line.trim()

                // 排除索引页和一些非重要页面
                if (filePath.includes('index.md') || filePath.includes('404.md')) continue

                if (!seenFiles.has(filePath) && updates.length < count) {
                    const fullPath = path.join(process.cwd(), filePath)
                    if (!fs.existsSync(fullPath)) continue

                    // 获取文件的标题
                    const content = fs.readFileSync(fullPath, 'utf-8')
                    const titleMatch = content.match(/^#\s+(.+)$/m)
                    const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md')

                    updates.push({
                        title,
                        path: '/' + filePath.replace(/^docs\//, '').replace(/\.md$/, ''),
                        date: new Date(currentCommit.timestamp).toLocaleDateString('zh-CN'),
                        timestamp: currentCommit.timestamp
                    })
                    seenFiles.add(filePath)
                }
            }
        }

        return updates
    } catch (error) {
        console.warn('⚠️  无法从 Git 获取更新记录:', error.message)
        return []
    }
}
