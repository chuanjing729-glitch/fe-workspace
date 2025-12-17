# 前端工具库 (已迁移)

> ⚠️ 此页面已迁移

感谢您访问我们的前端工具库页面。我们正在进行一些改进，此页面的内容已经迁移到新的位置。

## 新的工具库位置

我们现在将工具库分为两个专门的包：

### 1. Core Utils 核心工具库
包含通用的工具函数，如数组操作、字符串处理、日期格式化、HTTP客户端等。

👉 [访问 Core Utils 文档](/packages/core-utils/)

### 2. Vue2 Toolkit Vue2工具库
专为 Vue2 应用设计的工具库，提供了常用的指令和 Mixins。

👉 [访问 Vue2 Toolkit 文档](/packages/vue2-toolkit/)

## 为什么进行迁移？

为了提供更好的模块化和维护性，我们将原来的 `fe-toolkit` 拆分为两个专门的包：

1. **更清晰的职责分离** - 通用工具和框架特定工具分开
2. **更好的按需引入** - 只引入需要的部分，减小包体积
3. **独立的版本管理** - 每个包可以独立更新和发布
4. **更高的可维护性** - 代码结构更清晰，便于维护

## 迁移指南

如果您之前使用了 `@fe-efficiency/fe-toolkit`，请按照以下步骤迁移：

### 1. 安装新的包
```bash
# 安装核心工具库
npm install @51jbs/core-utils

# 安装 Vue2 工具库（如果使用 Vue2）
npm install @51jbs/vue2-toolkit
```

### 2. 更新导入路径
```javascript
// 旧的导入方式
// import { formatDate, EventBus } from '@fe-efficiency/fe-toolkit'

// 新的导入方式
import { formatDate } from '@51jbs/core-utils'
import { EventBus } from '@51jbs/core-utils/event'
```

如有任何疑问，请联系我们的技术支持团队。
