/**
 * 权限管理 Mixin
 * 提供权限检查和权限相关功能
 */

export default {
  computed: {
    /**
     * 当前用户权限列表
     */
    $_userPermissions(): string[] {
      return (this as any).$store?.state.user?.permissions || []
    },
    
    /**
     * 当前用户角色列表
     */
    $_userRoles(): string[] {
      return (this as any).$store?.state.user?.roles || []
    }
  },
  
  methods: {
    /**
     * 检查是否有指定权限
     * @param {string|Array} permissions - 权限标识或权限标识数组
     * @returns {boolean} 是否有权限
     */
    $_hasPermission(permissions: string | string[]): boolean {
      if (!permissions) return true
      
      const perms = Array.isArray(permissions) ? permissions : [permissions]
      return perms.some(permission => this.$_userPermissions.includes(permission))
    },
    
    /**
     * 检查是否有指定角色
     * @param {string|Array} roles - 角色标识或角色标识数组
     * @returns {boolean} 是否有角色
     */
    $_hasRole(roles: string | string[]): boolean {
      if (!roles) return true
      
      const roleList = Array.isArray(roles) ? roles : [roles]
      return roleList.some(role => this.$_userRoles.includes(role))
    },
    
    /**
     * 检查是否有任意权限
     * @param {Array} permissions - 权限标识数组
     * @returns {boolean} 是否有任意权限
     */
    $_hasAnyPermission(permissions: string[]): boolean {
      if (!permissions || !permissions.length) return true
      return permissions.some(permission => this.$_userPermissions.includes(permission))
    },
    
    /**
     * 检查是否有所有权限
     * @param {Array} permissions - 权限标识数组
     * @returns {boolean} 是否有所有权限
     */
    $_hasAllPermissions(permissions: string[]): boolean {
      if (!permissions || !permissions.length) return true
      return permissions.every(permission => this.$_userPermissions.includes(permission))
    },
    
    /**
     * 权限检查装饰器
     * @param {string|Array} permissions - 权限标识
     * @param {Function} callback - 有权限时执行的回调
     * @param {Function} fallback - 无权限时执行的回调
     */
    $_checkPermission(
      permissions: string | string[], 
      callback?: () => void, 
      fallback?: () => void
    ) {
      if (this.$_hasPermission(permissions)) {
        callback && callback()
      } else {
        fallback && fallback()
        console.warn(`[PermissionManager] Permission denied: ${JSON.stringify(permissions)}`)
      }
    },
    
    /**
     * 权限路由守卫辅助方法
     */
    $_checkRoutePermission(route: any): boolean {
      const requiredPermissions = route.meta?.permissions
      if (!requiredPermissions) return true
      return this.$_hasPermission(requiredPermissions)
    }
  }
}
