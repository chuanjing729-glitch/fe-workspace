// 测试文件：验证 AST 版本的空指针安全检查

// ============ 数组访问测试 ============

// 不安全的数组访问（应该报错）
function unsafeArrayAccess() {
    const arr = getData()
    const first = arr[0] // 应该报错：不安全的数组访问
    return first
}

// 安全的数组访问（不应该报错）
function safeArrayAccessWithOptionalChaining() {
    const arr = getData()
    const first = arr?.[0] // 使用可选链，安全
    return first
}

function safeArrayAccessWithLengthCheck() {
    const arr = getData()
    if (arr.length > 0) {
        const first = arr[0] // 有长度检查，安全
        return first
    }
}

function safeArrayAccessWithGuard() {
    const arr = getData()
    const first = arr && arr[0] // 有守卫，安全
    return first
}

// ============ 函数调用测试 ============

// 不安全的函数调用（应该报错）
function unsafeFunctionCall() {
    const obj = getObject()
    obj.method() // 应该报错：不安全的函数调用
}

// 安全的函数调用（不应该报错）
function safeFunctionCallWithOptionalChaining() {
    const obj = getObject()
    obj?.method() // 使用可选链，安全
}

function safeFunctionCallWithTypeCheck() {
    const obj = getObject()
    if (typeof obj.method === 'function') {
        obj.method() // 有类型检查，安全
    }
}

function safeFunctionCallWithGuard() {
    const obj = getObject()
    obj && obj.method() // 有守卫，安全
}

// ============ 解构赋值测试 ============

// 不安全的解构（应该报错）
function unsafeDestructuring() {
    const data = getData()
    const { name, age } = data // 应该报错：不安全的解构赋值
    return { name, age }
}

// 安全的解构（不应该报错）
function safeDestructuringWithFallback() {
    const data = getData()
    const { name, age } = data || {} // 有默认值，安全
    return { name, age }
}

function safeDestructuringWithDefaults() {
    const data = getData()
    const { name = 'Unknown', age = 0 } = data // 每个属性都有默认值，安全
    return { name, age }
}

function safeDestructuringWithGuard() {
    const data = getData()
    if (data) {
        const { name, age } = data // 有守卫检查，安全
        return { name, age }
    }
}

// ============ 守卫检测测试 ============

// 测试三元表达式守卫
function ternaryGuard() {
    const obj = getObject()
    const value = obj ? obj.property : null // 安全
}

// 测试空值合并守卫
function nullishCoalescingGuard() {
    const obj = getObject()
    const value = obj?.property ?? 'default' // 安全
}

// 测试逻辑或守卫
function logicalOrGuard() {
    const config = getConfig()
    const settings = config || {} // 安全
    const { theme } = settings // 安全（settings 有默认值）
}

// 辅助函数（模拟外部依赖）
function getData(): any {
    return null
}

function getObject(): any {
    return null
}

function getConfig(): any {
    return null
}
