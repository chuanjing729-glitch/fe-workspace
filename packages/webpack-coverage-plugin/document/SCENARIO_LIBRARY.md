# 📚 测试场景全集 (Scenario Library) - Webpack Coverage Plugin

**Version**: 3.0.0
**Date**: 2025-12-20
**Definition**: 这是一个 "由表及里" 的场景矩阵，涵盖了从 UI 触点到底层代码逻辑的全覆盖路径。

## 1. 逻辑分支场景 (Logical Branch Scenarios)

### 1.1 条件语句 (If/Else)
*   **场景**: `if(isMember) { discount() } else { regular() }`
*   **验证操作**:
    1.  普通账号登录 -> 验证 `regular()` 绿色。
    2.  会员账号登录 -> 验证 `discount()` 绿色。
*   **目标**: 确保两行逻辑完全变绿。

### 1.2 开关逻辑 (Switch/Case)
*   **场景**: 处理订单状态 (Pending/Paid/Shipped/Cancelled)。
*   **验证操作**: 依次点击各状态筛选项。
*   **目标**: 证明每个 `case` 分别被独立触发。

### 1.3 运算符短路 (Logical Short-circuit)
*   **场景**: `const data = cached || await fetchData()`
*   **验证操作**:
    1.  首屏加载 -> 触发 `await fetchData()`。
    2.  再次进入页面（缓存生效） -> 验证 `fetchData` **不被** 标记。
*   **覆盖要点**: 验证 `||` 后半段的 "非执行状态" 被准确捕获。

---

## 2. 界面交互场景 (UI Interaction Scenarios)

### 2.1 表单校验 (Form Validation)
*   **场景**: 多重正则表达式校验（手机号、长度、特殊字符）。
*   **动作**: 输入非法格式 -> 输入合法格式 -> 点击清除。
*   **覆盖**: 每一个 `RegExp.test()` 的路径以及对应的 `ErrorMessage` UI 渲染逻辑。

### 2.2 列表滚动与懒加载 (Scroll & Lazy Load)
*   **场景**: 无限列表滚动。
*   **动作**: 滚动到底部 -> 触发 `loadMore()`。
*   **覆盖**: 验证分页逻辑、Loading 展示逻辑、以及列表结尾提示逻辑。

### 2.3 弹窗嵌套 (Modals & Popovers)
*   **场景**: 点击 A 弹窗后在其中点击 B 弹窗。
*   **动作**: 打开 A -> 取消 B -> 确认 B -> 关闭 A。
*   **覆盖**: 验证父子弹窗的 `onClose`、`onConfirm` 回调链条。

---

## 3. 框架特性场景 (Framework Feature Scenarios)

### 3.1 Vue 响应式边界
*   **场景**: `this.$set` 在 Vue 2 中新增属性。
*   **场景**: `watch` 选项的 `deep: true` 深度监听。
*   **测试**: 修改嵌套对象的深层属性。
*   **目标**: 插件应记录 `watcher` 回调被触发。

### 3.2 React Hooks 依赖
*   **场景**: `useEffect` 的各种依赖项变动。
*   **测试**: 改变依赖项，触发 Effect 执行。
*   **目标**: Verify Effect 函数内部逻辑的覆盖。

---

## 4. 极端异常场景 (Extreme Edge Cases)

### 4.1 弱网与超时
*   **操作**: 使用 Chrome DevTools 模拟 `Slow 3G`。
*   **预期**: 捕获到界面展示 "Network request timed out" 的 UI 逻辑。

### 4.2 文件上传失败
*   **操作**: 上传一个超过 20MB 的大文件，触发后端 `413 Payload Too Large`。
*   **预期**: 覆盖前端对 `413` 状态码的提示与重试逻辑。

### 4.3 浏览器差异 (Polyfill Paths)
*   **操作**: 在 IE 或旧版浏览器（如 Chrome 50）中模拟特定 API 丢失。
*   **预期**: 验证 `if (!window.IntersectionObserver) { fallback() }` 中的补偿逻辑。
