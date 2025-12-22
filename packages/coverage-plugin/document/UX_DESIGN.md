# 🎨 交互设计文档 (UX Design) - Webpack Coverage Plugin

**Version**: 3.0.0 (Extreme Detail)
**Date**: 2025-12-20
**Status**: Formal Standard
**Reference Docs**: [PRODUCT_REQ.md](./PRODUCT_REQ.md)

## 1. 核心设计体系 (Detailed Design System)

### 1.1 气泡及其多态表现 (The Bubble states)
气泡不仅是数字显示器，是系统的 "情感大脑"。

| 视觉状态 | 颜色 (Hex) | 动画 (Animation) | 辅助文本 / Icon | 场景描述 |
|---|---|---|---|---|
| **休眠 (Idle)** | `#666666` (60% alpha) | None | `Connecting...` | DevServer 尚未响应上报请求。 |
| **极低 (Critical)** | `#ff4d4f` (🔴) | 弱呼吸灯效 | `Coverage: 12%` | 变动代码几乎未被测试。 |
| **中等 (Warning)** | `#faad14` (🟡) | None | `Coverage: 65%` | 已测试部分，但仍存在显著遗漏。 |
| **达标 (Success)** | `#52c41a` (🟢) | 首次达到时 Bounce 一次 | `Coverage: 100%` | 本地变动已完全覆盖。 |
| **异常 (Broken)** | `#333333` | 灰色叉号 | `API Missing` | 网络断开、代理配置错误或端口被占用。 |

### 1.2 气泡物理特性 (Physical Traits)
*   **边缘吸附 (Edge Snap)**: 拖拽释放后，自动平滑移动到最近的屏幕垂直边缘。
*   **最小化 (Minimize)**: 双击气泡可切换为 "简易模式"（仅显示点色，不显示数字）。

---

## 2. 面板详细交互 (Panel Interaction Specs)

### 2.1 详情弹窗 (Detail Modal)
*   **触发**: 单击气泡。
*   **入场动画**: 从底部滑入，并带有轻微的高斯模糊背景（Glassmorphism）。

#### A. 统计首部 (Header)
*   **实时百分比**: 采用数字增长动效 (Counter animation)。
*   **操作区**:
    *   `[Reset]`: 清空当前会话计数（不影响 Server 端持久化）。
    *   `[Sync]`: 立即触发一次全量 Git Diff 和 Coverage 解析。

#### B. 文件网格 (File Navigation)
*   **筛选器**: `[All] [Changed Only] [Uncovered Only]`。
*   **条目交互**: 鼠标 Hover 文件名时，展示对应的路径全地址（Tooltip）。
*   **行号链接**: 点击行号区域，如果配置了 IDE 环境变量（如 `__IDE_PROTOCOL__`），可尝试反向唤起 Webstorm/VSCode 并定位到该行。

---

## 3. 辅助交互策略 (Accessibility & Assistive Tech)

### 3.1 快捷键定义
*   `Alt + C`: 直接切换面板显隐。
*   `Alt + R`: 强制刷新上报。

### 3.2 响应式设计
*   **移动端适配**:
    *   气泡自动缩小 20%。
    *   面板改为底部全屏 Drawer 模式，支持手势下拉关闭。
*   **暗黑模式**:
    *   跟随系统 `prefers-color-scheme`。
    *   暗黑模式下面板背景采用透明度 85% 的纯黑，边框采用 `#444`。

---

## 4. 全链路场景演示流程 (User Flows)

### Flow-01: 沉浸式开发
1.  开发者保持气泡收起。
2.  在编辑器中编写 `if-else`。
3.  浏览器热重载。
4.  开发者扫一眼气泡：如果是黄色，说明刚才的操作还不够，需继续点选另一个分支。
5.  气泡变绿，心理负担解除，切回编辑器继续下一行。

### Flow-02: 验收重压
1.  提测前，打开完整 HTML 报告页。
2.  点击 "High Risk Files" 分类。
3.  通过报告中的染色发现某行逻辑从未被覆盖。
4.  在应用中手动复现该极端情况（如断网、恶意输入）。
5.  报告动态标记为变绿，信心增加，输出报告作为提测附件。

---

## 5. UI 性能约束 (UI Performance)
*   **帧率 (FPS)**: 气泡动画应在 60FPS 运行，不得引起主进程卡顿。
*   **内存占用**: 运行时 Overlay DOM 数量不得超过 50 个节点，防止内存泄露。
