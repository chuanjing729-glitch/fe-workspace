# ✅ 测试验证规范 (QA Validation Spec) - Webpack Coverage Plugin

**Version**: 3.0.0
**Date**: 2025-12-20
**Scope**: 涵盖单元测试、集成测试、及端到端（E2E）验收流程。

## 1. 测试环境矩阵 (Testing Matrix)

| 项目 | 环境 A (Legacy) | 环境 B (Modern) | 环境 C (Performance) |
|---|---|---|---|
| **OS** | Windows 10 | macOS Sonoma | Linux (Ubuntu) |
| **Node** | v16.x (LTS) | v20.x (Current) | v18.x |
| **Build Tool** | Webpack 5.0 | Vite 5.2 | Rspack 1.0 |
| **Framework** | Vue 2.7 | React 18 / Vue 3 | Preact / Svelte |

---

## 2. 自动化测试用例 (Automated Test Cases)

### 2.1 核心插桩测试 (Instrumentation Unit Tests)
*   **TC-UT-01**: 验证三元表达式 `a ? b : c` 的三分支（a, b, c）是否都能被独立计数。
*   **TC-UT-02**: 验证 Async/Await 转换后的代码在报错时，`catch` 块的计数器工作正常。
*   **TC-UT-03**: 验证 Sourcemap 穿透。插桩代码抛出 Error 时，Stack Trace 应指向原始源码行。

### 2.2 服务端集成测试 (Server-side Integration)
*   **TC-IT-01**: 模拟并行上报。5 个 Client 同时上报，Server 需确保内存不溢出且数据合并准确。
*   **TC-IT-02**: 验证 Git 服务。在非 Git 目录启动时，插件应降级为 "Full Coverage" 模式而不是直接崩溃。

---

## 3. 手工验收流程 (Manual Acceptance - The "Kitchen Sink" Flow)

### 3.1 覆盖率实时性验收 (Real-time AC)
1.  启动 `examples/vue2-app`。
2.  打开浏览器控制台 -> Network 标签。
3.  点击页面按钮。
4.  **校验**: 5s 内必须发出一个 `/__coverage_upload` 的 POST 请求。
5.  **校验**: 气泡数字随之跳动。

### 3.2 极端边界验收 (Edge Case AC)
1.  **HMR 压力测试**: 快速修改组件代码 10 次 -> 校验气泡是否保持数据累加，无 "跳 0" 现象。
2.  **网络异常测试**: 在中间件处理时手动将请求 Pending -> 校验气泡是否转圈 (Loading 态) 且不卡死页面交互。

---

## 4. 性能回归标准 (Performance Baseline)

*   **Build Time**: `npm run build` 开启插桩 vs 关闭插桩。差异值 < 15%。
*   **Bundle Size**: 打包后的 `vendor.js` 不得包含任何插桩库代码 (Istanbul 工具库应仅在 Node 端运行)。
*   **Overlay Footprint**: 在没有覆盖率数据时，Overlay 的初始 DOM 高度应为 0。

---

## 5. 验收报告提交要求
所有的验收必须附带以下证据：
1.  **控制台截图**: 证明无报错。
2.  **HTML 报告文件**: `smart-test-report.html`。
3.  **覆盖率数值**: 变动代码部分必须达到 100%。
