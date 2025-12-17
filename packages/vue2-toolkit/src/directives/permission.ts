import { DirectiveOptions } from 'vue'

/**
 * 权限控制指令
 * 使用方法: v-permission="'admin'" 或 v-permission="['admin', 'editor']"
 * 可通过 Vue.prototype.$permissions 设置用户权限列表
 */
const permission: DirectiveOptions = {
  bind(el, binding, vnode) {
    checkPermission(el, binding, vnode)
  },
  
  update(el, binding, vnode) {
    checkPermission(el, binding, vnode)
  }
}

function checkPermission(el: HTMLElement, binding: any, vnode: any) {
  // 获取用户权限列表（从Vue实例或全局window获取）
  const vm = vnode.context
  const userPermissions = (vm && vm.$permissions) || (window as any).USER_PERMISSIONS || []
  
  // 获取指令绑定的权限要求
  const requiredPermissions = binding.value
  
  // 如果没有设置权限要求，则显示元素
  if (!requiredPermissions) {
    el.style.display = ''
    return
  }
  
  // 标准化权限要求为数组
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions]
  
  // 检查用户是否拥有任一所需权限
  const hasPermission = permissions.some(permission => 
    userPermissions.includes(permission)
  )
  
  // 根据权限检查结果控制元素显示
  if (hasPermission) {
    el.style.display = ''
  } else {
    el.style.display = 'none'
  }
}

export default permission
