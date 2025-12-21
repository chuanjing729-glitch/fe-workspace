// Jest setup file for Vue2 Toolkit

// 1. Mock Global Objects
// 使用 globalThis 以获得更好的类型兼容性
const g = globalThis as any;

g.requestAnimationFrame = (cb: any) => setTimeout(cb, 0);
g.cancelAnimationFrame = (id: any) => clearTimeout(id);

// 2. Mock Observers (模拟浏览器观察者 API)

// ResizeObserver
class MockResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}
g.ResizeObserver = MockResizeObserver;

// IntersectionObserver
class MockIntersectionObserver {
    constructor(public callback: any) { }
    observe() {
        // 模拟立即触发可见
        this.callback([{ isIntersecting: true }])
    }
    unobserve() { }
    disconnect() { }
}
g.IntersectionObserver = MockIntersectionObserver;

// MutationObserver
class MockMutationObserver {
    constructor(public callback: any) { }
    observe() {
        // 模拟变动
        this.callback([{ type: 'attributes' }])
    }
    disconnect() { }
    takeRecords() { return [] }
}
g.MutationObserver = MockMutationObserver;

// 3. Mock DOM APIs
document.execCommand = jest.fn();

// 4. Suppress Vue Warnings (抑制已知警告，保持控制台整洁)
const originalWarn = console.warn
const originalError = console.error

console.warn = jest.fn((...args) => {
    const msg = args[0]
    if (typeof msg === 'string' && (
        msg.includes('[Vue warn]') ||
        msg.includes('runtime-only') ||
        msg.includes('destroyed')
    )) return
    originalWarn(...args)
})

console.error = jest.fn((...args) => {
    const msg = args[0]
    if (typeof msg === 'string' && (
        msg.includes('[Vue warn]') ||
        msg.includes('destroyed') ||
        msg.includes('Failed to mount')
    )) return
    originalError(...args)
})
