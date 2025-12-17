/**
 * 本地存储工具
 */

/**
 * LocalStorage 封装
 */
export const local = {
  /**
   * 设置数据
   */
  set<T>(key: string, value: T): void {
    try {
      const data = JSON.stringify(value)
      localStorage.setItem(key, data)
    } catch (error) {
      console.error('LocalStorage set error:', error)
    }
  },

  /**
   * 获取数据
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const data = localStorage.getItem(key)
      if (data === null) {
        return defaultValue ?? null
      }
      return JSON.parse(data) as T
    } catch (error) {
      console.error('LocalStorage get error:', error)
      return defaultValue ?? null
    }
  },

  /**
   * 删除数据
   */
  remove(key: string): void {
    localStorage.removeItem(key)
  },

  /**
   * 清空所有数据
   */
  clear(): void {
    localStorage.clear()
  },

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null
  }
}

/**
 * SessionStorage 封装
 */
export const session = {
  /**
   * 设置数据
   */
  set<T>(key: string, value: T): void {
    try {
      const data = JSON.stringify(value)
      sessionStorage.setItem(key, data)
    } catch (error) {
      console.error('SessionStorage set error:', error)
    }
  },

  /**
   * 获取数据
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const data = sessionStorage.getItem(key)
      if (data === null) {
        return defaultValue ?? null
      }
      return JSON.parse(data) as T
    } catch (error) {
      console.error('SessionStorage get error:', error)
      return defaultValue ?? null
    }
  },

  /**
   * 删除数据
   */
  remove(key: string): void {
    sessionStorage.removeItem(key)
  },

  /**
   * 清空所有数据
   */
  clear(): void {
    sessionStorage.clear()
  },

  /**
   * 检查是否存在
   */
  has(key: string): boolean {
    return sessionStorage.getItem(key) !== null
  }
}

/**
 * 带过期时间的存储
 */
export const storage = {
  /**
   * 设置数据（带过期时间）
   * @param key 键
   * @param value 值
   * @param expire 过期时间（毫秒）
   */
  set<T>(key: string, value: T, expire?: number): void {
    const data = {
      value,
      expire: expire ? Date.now() + expire : null
    }
    local.set(key, data)
  },

  /**
   * 获取数据（自动清除过期数据）
   */
  get<T>(key: string, defaultValue?: T): T | null {
    const data = local.get<{ value: T; expire: number | null }>(key)
    
    if (!data) {
      return defaultValue ?? null
    }

    // 检查是否过期
    if (data.expire && Date.now() > data.expire) {
      local.remove(key)
      return defaultValue ?? null
    }

    return data.value
  },

  /**
   * 删除数据
   */
  remove(key: string): void {
    local.remove(key)
  }
}

/**
 * Cookie 操作
 */
export const cookie = {
  /**
   * 获取 Cookie
   */
  get(name: string): string | null {
    if (typeof document === 'undefined') return null
    
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()!.split(';').shift()!
    }
    return null
  },

  /**
   * 设置 Cookie
   */
  set(
    name: string, 
    value: string, 
    options: {
      expires?: string | Date
      path?: string
      domain?: string
      secure?: boolean
      sameSite?: 'Lax' | 'Strict' | 'None'
    } = {}
  ): void {
    if (typeof document === 'undefined') return
    
    const {
      expires = '',
      path = '/',
      domain = '',
      secure = false,
      sameSite = 'Lax'
    } = options
    
    let cookieString = `${name}=${encodeURIComponent(value)}`
    
    if (expires) {
      if (typeof expires === 'string') {
        cookieString += `; expires=${expires}`
      } else {
        cookieString += `; expires=${expires.toUTCString()}`
      }
    }
    
    if (path) {
      cookieString += `; path=${path}`
    }
    
    if (domain) {
      cookieString += `; domain=${domain}`
    }
    
    if (secure) {
      cookieString += '; secure'
    }
    
    if (sameSite) {
      cookieString += `; SameSite=${sameSite}`
    }
    
    document.cookie = cookieString
  },

  /**
   * 删除 Cookie
   */
  remove(name: string, options: { path?: string; domain?: string } = {}): void {
    this.set(name, '', { ...options, expires: 'Thu, 01 Jan 1970 00:00:00 GMT' })
  }
}
