# API Reference

本文档详细介绍了 `@51jbs/incremental-coverage-plugin` 的配置选项及其含义。

## 配置对象 (IncrementalCoverageOptions)

所有配置项均可选，插件会根据环境提供默认值。

### 过滤选项

#### `include`
- **类型**: `string[]`
- **默认值**: `['src/**']`
- **说明**: 采用 Glob 模式定义哪些文件需要进行覆盖率插桩和增量计算。建议仅包含源代码目录以提高性能。

#### `exclude`
- **类型**: `string[]`
- **默认值**: `['**/*.spec.ts', '**/*.test.ts', '**/node_modules/**']`
- **说明**: 需要明确排除的文件或目录。

---

### 计算选项

#### `gitDiffBase`
- **类型**: `string`
- **默认值**: `'main'`
- **说明**: 用于计算增量差异的 Git 基准分支或 Commit ID。插件会对比 `HEAD` 与该基准的差异，仅计算受影响行的覆盖率。

#### `threshold`
- **类型**: `number`
- **默认值**: `80`
- **说明**: 增量覆盖率的可接受阈值（0-100）。低于此值时，报告状态将标记为“未达标”。

---

### 报告与管理选项

#### `outputDir`
- **类型**: `string`
- **默认值**: `'.coverage'`
- **说明**: 报告生成的目录路径。

#### `reportFormat`
- **类型**: `'html' | 'json' | 'both'`
- **默认值**: `'html'`
- **说明**: 指定生成的报告格式。`both` 将同时生成 HTML 可视化报告和 JSON 数据报告。

#### `reportInterval`
- **类型**: `number`
- **单位**: 毫秒 (ms)
- **默认值**: `10000` (10s)
- **说明**: 报告生成的最小间隔。在频繁 HMR（热更新）过程中，插件会对此频率进行“防抖”处理，避免过度消耗磁盘 IO。

#### `historyCount`
- **类型**: `number`
- **默认值**: `15`
- **说明**: `.coverage` 目录下保留的带时间戳历史报告的数量。超出此限制的旧文件将被自动删除。

---

### 高级选项

#### `baselinePath`
- **类型**: `string`
- **默认值**: `'.coverage/baseline.json'`
- **说明**: 基线覆盖率文件的存储路径。基线用于识别覆盖率的“回退”。

#### `autoSaveBaseline`
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 首次运行且无基线文件时，是否自动将当前覆盖率存为基线。

#### `enableOverlay`
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否在浏览器端注入 Overlay UI（目前处于实验阶段）。
