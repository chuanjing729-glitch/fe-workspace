# 贡献指南

感谢您有兴趣为 core-utils 做出贡献！这篇指南将帮助您了解如何参与项目的开发。

## 开发环境搭建

### 系统要求

- Node.js >= 12.x
- npm 或 yarn 包管理器
- Git 版本控制工具

### 克隆仓库

```bash
git clone https://github.com/your-org/core-utils.git
cd core-utils
```

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

### 目录结构

```
core-utils/
├── src/              # 源代码目录
│   ├── array/        # 数组工具函数
│   ├── object/       # 对象工具函数
│   ├── string/       # 字符串工具函数
│   ├── number/       # 数字工具函数
│   ├── date/         # 日期工具函数
│   ├── dom/          # DOM 操作工具函数
│   ├── event/        # 事件管理工具函数
│   ├── format/       # 格式化工具函数
│   ├── http/         # HTTP 请求工具函数
│   ├── storage/      # 存储工具函数
│   ├── url/          # URL 工具函数
│   ├── validation/   # 验证工具函数
│   ├── device/       # 设备检测工具函数
│   └── index.ts      # 导出所有工具函数
├── tests/            # 测试文件目录
├── docs/             # 文档目录
├── dist/             # 构建输出目录
├── package.json      # 项目配置文件
├── tsconfig.json     # TypeScript 配置文件
└── jest.config.js    # Jest 测试配置文件
```

## 开发流程

### 1. 创建分支

在开始开发之前，请创建一个新的分支：

```bash
git checkout -b feature/your-feature-name
```

### 2. 编写代码

- 遵循现有的代码风格和规范
- 为新功能编写相应的 TypeScript 类型定义
- 确保代码具有良好的注释和文档

### 3. 编写测试

为新增或修改的功能编写测试用例：

```bash
# 运行所有测试
npm test

# 运行特定模块的测试
npm test -- tests/array.test.ts
```

### 4. 构建项目

在提交之前，请确保项目能够成功构建：

```bash
npm run build
```

### 5. 提交代码

遵循约定式的提交信息格式：

```bash
git add .
git commit -m "feat: add new utility function"
```

提交信息类型：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响代码运行的变动）
- `refactor`: 重构（即不是新增功能，也不是修改 bug 的代码变动）
- `perf`: 性能优化
- `test`: 增加测试
- `chore`: 构建过程或辅助工具的变动

### 6. 推送分支

```bash
git push origin feature/your-feature-name
```

## 代码规范

### TypeScript 规范

- 使用 TypeScript 编写所有代码
- 提供完整的类型定义
- 遵循严格的类型检查（strict mode）

### 命名规范

- 函数名使用 camelCase（驼峰命名法）
- 类名使用 PascalCase（帕斯卡命名法）
- 常量使用 UPPER_CASE（大写字母加下划线）
- 私有属性和方法使用下划线前缀 `_`

### 注释规范

- 为所有公共 API 编写 JSDoc 注释
- 注释应包含函数说明、参数说明、返回值说明和使用示例

```typescript
/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @param hash WeakMap 用于处理循环引用
 * @returns 深拷贝后的对象
 * @example
 * ```typescript
 * const obj = { a: 1, b: { c: 2 } };
 * const cloned = deepClone(obj);
 * ```
 */
export function deepClone<T>(obj: T, hash = new WeakMap()): T {
  // 实现代码
}
```

## 测试要求

### 测试覆盖率

- 所有新功能必须包含测试用例
- 测试覆盖率应达到 95% 以上
- 测试用例应覆盖正常情况、边界情况和异常情况

### 测试文件命名

测试文件应与源文件保持一致的命名，以 `.test.ts` 结尾：

```
src/array/index.ts
tests/array.test.ts
```

### 测试结构

使用 Jest 测试框架，测试文件应具有以下结构：

```typescript
import { unique } from '../src/array'

describe('Array 模块测试', () => {
  // 正常情况测试
  test('unique: 基本去重', () => {
    expect(unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4])
  })

  // 边界情况测试
  test('unique: 空数组和非数组', () => {
    expect(unique([])).toEqual([])
    expect(unique(null as any)).toEqual([])
  })
})
```

## 文档要求

### README 更新

如果添加了新功能，请更新主 README.md 文件中的相关部分。

### API 文档

为所有公共函数提供详细的 API 文档，包括：
- 函数说明
- 参数类型和说明
- 返回值类型和说明
- 使用示例

## Pull Request 流程

1. 确保所有测试通过
2. 确保代码覆盖率达标
3. 更新相关文档
4. 提交 Pull Request 到 `main` 分支
5. 等待代码审查

## 发布流程

只有项目维护者才能发布新版本：

1. 更新版本号（遵循 SemVer 规范）
2. 更新 CHANGELOG.md
3. 创建 Git 标签
4. 发布到 npm

## 问题报告

如果您发现 bug 或有任何建议，请在 GitHub Issues 中提交：

1. 使用清晰的标题描述问题
2. 提供详细的复现步骤
3. 提供环境信息（Node.js 版本、操作系统等）
4. 如果可能，提供相关的代码片段

## 社区行为准则

请遵守我们的行为准则，为所有人创造一个开放、友好的社区环境。

## 联系方式

如有任何疑问，请联系项目维护者：Chuanjing Li