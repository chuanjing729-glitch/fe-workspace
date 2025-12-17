// ❌ 错误示例：文件名应该是 kebab-case
// 应该命名为 api-client.js

const API_BASE_URL = 'https://api.example.com'

// ❌ 错误：高频事件没有使用防抖
window.addEventListener('scroll', () => {
  console.log('scrolling')
  // 大量 DOM 操作
  document.querySelector('.header').style.top = window.scrollY + 'px'
})

// ❌ 错误：循环中的 DOM 操作
function renderList(items) {
  for (let i = 0; i < items.length; i++) {
    const div = document.createElement('div')
    div.innerHTML = items[i]
    document.body.appendChild(div)  // 每次都操作 DOM
  }
}

// ❌ 错误：没有 JSDoc 注释的复杂函数
async function fetchUserData(userId, options) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`)
  const data = await response.json()
  
  if (options.includeOrders) {
    const orders = await fetch(`${API_BASE_URL}/users/${userId}/orders`)
    data.orders = await orders.json()
  }
  
  if (options.includeProfile) {
    const profile = await fetch(`${API_BASE_URL}/users/${userId}/profile`)
    data.profile = await profile.json()
  }
  
  return data
}

// TODO: 优化性能  // ❌ 错误：缺少责任人

export { fetchUserData }
