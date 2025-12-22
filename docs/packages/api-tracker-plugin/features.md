# 功能特性

## 📊 核心功能概览

api-tracker-plugin 提供完整的 API 契约跟踪和变更检测功能。

| 功能模块 | 子功能 | 说明 |
|---------|-------|------|
| 数据采集 | OpenAPI 解析 | 支持 YAML/JSON 格式的 OpenAPI 规范 |
| 数据采集 | 网页爬虫 | 自动爬取 Swagger UI 等文档页面 |
| 契约管理 | 快照生成 | 生成 API 契约快照用于版本对比 |
| 变更检测 | 差异分析 | 检测接口新增、删除、参数变更 |
| 报告生成 | HTML 报告 | 可视化展示 API 变更详情 |
| 运行时集成 | 通知气泡 | 开发时实时提醒 API 变更 |

## 1. 数据采集模式

### OpenAPI 模式

支持标准的 OpenAPI 3.0 规范：

```yaml
openapi: 3.0.0
info:
  title: 用户服务 API
  version: 1.0.0
paths:
  /users:
    get:
      summary: 获取用户列表
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
```

### 爬虫模式

自动爬取在线 API 文档：

```javascript
crawler: {
  baseUrl: 'http://localhost:3000',
  paths: ['/api/**'],
  selectors: {
    title: 'h1',
    description: '.api-description',
    endpoints: '.endpoint-item'
  }
}
```

## 2. 契约快照

### 快照结构

```json
{
  "version": "1.0.0",
  "generatedAt": "2025-12-18T10:00:00Z",
  "endpoints": [
    {
      "method": "GET",
      "path": "/users",
      "summary": "获取用户列表",
      "parameters": [],
      "responses": {
        "200": {
          "description": "成功",
          "schema": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/User"
            }
          }
        }
      }
    }
  ]
}
```

### 快照存储

```
.api-tracker/
  ├── snapshots/
  │   ├── 20251218-100000.json
  │   ├── 20251217-093000.json
  │   └── latest.json
  └── contracts/
      └── user-service.json
```

## 3. 变更检测

### 检测类型

- ✅ 接口新增/删除
- ✅ 请求参数变更
- ✅ 响应结构变更
- ✅ 数据类型变更
- ✅ 必填字段变更

### 变更示例

```diff
// 接口 /users/{id} 的响应变更
{
  "200": {
    "schema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
-       "email": {
-         "type": "string"
-       }
+       "email": {
+         "type": "string",
+         "format": "email"
+       },
+       "phone": {
+         "type": "string"
+       }
      }
    }
  }
}
```

## 4. 报告生成

### HTML 报告内容

#### 1. 变更概览
- ✅ 新增接口列表
- ✅ 删除接口列表
- ✅ 变更接口详情
- ✅ 兼容性评估

#### 2. 详细变更
- ✅ 字段级别变更对比
- ✅ 数据类型变更说明
- ✅ 必填性变更标记

#### 3. 影响分析
- ✅ 前端影响评估
- ✅ 后端兼容性检查
- ✅ 迁移建议

### 报告示例

```html
<div class="api-change-report">
  <h2>API 变更报告</h2>
  <div class="summary">
    <span class="added">+3 新增接口</span>
    <span class="removed">-1 删除接口</span>
    <span class="modified">~5 变更接口</span>
  </div>
  
  <div class="change-detail">
    <h3>变更详情: GET /users/{id}</h3>
    <div class="field-changes">
      <div class="field-added">+ phone (string)</div>
      <div class="field-modified">~ email (format: email)</div>
      <div class="field-removed">- age (number)</div>
    </div>
  </div>
</div>
```

## 5. 运行时集成

### 通知气泡

开发时在页面右下角显示 API 变更提醒：

```javascript
// 气泡功能特性
- 实时检测 API 契约变更
- 点击查看详情报告
- 支持手动刷新契约快照
- 可配置显示/隐藏
```

### 配置选项

```javascript
runtime: {
  enabled: true,
  position: 'bottom-right', // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  autoDismiss: 5000, // 5秒后自动消失
  showOn: ['dev', 'test'] // 在哪些环境下显示
}
```

## 6. 安全特性

### 配置隔离

```javascript
security: {
  // 敏感配置不会被写入快照
  credentials: {
    username: process.env.API_USERNAME,
    password: process.env.API_PASSWORD
  },
  
  // 公开配置会被写入快照
  publicConfig: {
    baseUrl: 'https://api.example.com',
    version: 'v1'
  }
}
```

### 数据脱敏

```javascript
sanitization: {
  // 脱敏规则
  patterns: [
    {
      match: '/password|secret|token/i',
      replace: '******'
    }
  ],
  
  // 敏感字段列表
  sensitiveFields: ['password', 'secret', 'token', 'apiKey']
}
```

## 📈 性能优化

### 缓存机制

```
.api-tracker/
  ├── cache/
  │   ├── openapi-parser.cache
  │   ├── crawler.cache
  │   └── diff.cache
  └── ...
```

### 增量处理

- ✅ 只处理变更的 API 文档
- ✅ 缓存已解析的契约数据
- ✅ 并行处理多个 API 源

## 🪝 集成能力

### 与 coverage-plugin 协同

```javascript
// 当 API 发生重大变更时，自动触发覆盖率检查
integration: {
  coveragePlugin: {
    triggerOnBreakingChanges: true,
    autoRunCoverage: true
  }
}
```

### CI/CD 集成

```bash
# 检查 API 变更
npx api-tracker check

# 生成变更报告
npx api-tracker report

# 与基线版本比较
npx api-tracker diff --baseline v1.0.0
```

## 📚 相关文档

- [快速开始](./quick-start.md) - 快速上手指南
- [配置选项](./index.md#配置选项) - 配置详细说明
- [更新日志](./changelog.md) - 版本更新记录
- [真实项目验证](./validation-report.md) - 验证报告