# ⚙️ 技术实现文档 (Technical Specification) - Webpack Coverage Plugin

**Version**: 3.0.0 (Extreme Detail)
**Date**: 2025-12-20
**Status**: Formal Standard
**Reference Docs**: [PRODUCT_REQ.md](./PRODUCT_REQ.md)

## 1. 核心流程演进 (Processing Pipeline)

### 1.1 编译时：增强插桩 (Compilation Phase)
插桩不仅是简单的语句计数，还包含对现代 JS 高级特性的语义理解。

1.  **AST 解析与遍历**: 使用 `babel/parser` 生成 AST，并使用 `istanbul-lib-instrument` 进行变换。
2.  **增量标记**: 插件会在构建初期调用 `GitService` 获取 `affectedLines`。在每个插桩后的计数器中加入元数据，标记该计数器是否属于 "变更行"。
3.  **Sourcemap 修正**: 
    ```typescript
    // 伪代码: Sourcemap Chain 处理
    const originalMap = this.getPreviousSourceMap();
    const instrumentationResult = instrumenter.instrumentSync(code, filename, originalMap);
    this.pushNewSourceMap(instrumentationResult.lastSourceMap());
    ```

### 1.2 运行时：智能采集 (Runtime Phase)
运行在开发者浏览器中的 `CoverageClient` 负责精细化管理数据。

1.  **上报策略**:
    *   **定时触发 (Interval)**: 默认 5s。
    *   **事件触发 (Event-based)**: 监听 `visibilitychange` (切换标签页时立即上报一次)。
    *   **手动触发 (Manual)**: UI 面板中的 Refresh。
2.  **数据压缩算法 (Post-Process)**:
    在上传前，Client 会对 `__coverage__` 对象进行瘦身，移除冗余的 `fnMap`, `statementMap` (这些在 Server 端已通过 SourceMap 复原)。仅上传 `s`, `f`, `b` 计数器数组。

---

## 2. 服务端：深度计算引擎 (Server-side Engine)

### 2.1 变更识别决策树 (Diff Decision Tree)
1.  **判定逻辑**: 是否为本地 Git 工作区文件？ -> 是。
2.  **行号映射**: 文件 A 的第 10 行是否在 `git diff` 的 `@@ -10,5 +10,8 @@` 范围内？
3.  **聚合**: 将所有满足条件的计数器求和，计算 `changedCoverageRate`。

### 2.2 存储方案 (Storage Strategy)
*   **内存 L1 缓存 (In-Memory)**: 存储当前活跃会话的覆盖率对象。
*   **磁盘 L2 持久化 (File-based)**: `.coverage/cache/` 下存储 JSON 镜像，支持 DevServer 重启后的数据恢复。

---

## 3. 企业级特性实现 (Enterprise Features)

### 3.1 Monorepo 支持逻辑
插件会向上递归寻找最近的 `.git` 目录作为 Workspace Root。
对于引用的子包 (Symlinked Packages)，通过配置 `additionalRoots` 强制包含进插桩范围。

### 3.2 插件钩子顺序 (Hook Sequence)
*   **Webpack**: 在 `module.loaders` 之后，但在 `Minification/Uglify` 之前执行，确保混淆不破坏插桩。
*   **Vite**: `enforce: 'post'`，确保在框架编译器 (如 `@vitejs/plugin-vue`) 处理完 SFC 转换后获取完整的 JS 代码。

---

## 4. API & 通讯协议 (Deep Dive)

### 4.1 POST /__coverage_upload 协议详情
```typescript
interface UploadPayload {
    id: string;             // 会话 ID (基于 IP 或 Git User)
    timestamp: number;
    files: {
       [filePath: string]: {
           s: number[];     // Statements counts
           f: number[];     // Functions counts
           b: { [idx: string]: number[] }; // Branch counts
       }
    }
}
```

### 4.2 GET /__coverage_info 响应详情
```typescript
interface InfoResponse {
    overall: {
        coverage: number;   // 0.0 - 100.0
        coveredLines: number;
        totalLines: number;
    },
    changed: {              // 💡 仅变动部分的统计
        coverage: number;
        uncoveredFiles: string[];
    },
    status: 'syncing' | 'ready' | 'error'
}
```

---

## 5. 安全性考量 (Security)
*   **跨域控制 (CORS)**: 中间件自动注入 `Access-Control-Allow-Origin: *`，允许从不同的 DevServer 端口上报。
*   **生产环境安全**: 严禁在 `NODE_ENV === 'production'` 且配置了 `productionAllowed: false` 的情况下上报，防止意外泄露源码逻辑。
