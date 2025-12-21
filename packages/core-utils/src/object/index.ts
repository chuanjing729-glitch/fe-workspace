/**
 * 深拷贝工具
 * 解决 JSON.parse(JSON.stringify()) 的问题：
 * 1. 支持循环引用
 * 2. 支持函数、Date、RegExp 等特殊对象
 * 3. 支持 Symbol
 */

/**
 * 深拷贝
 * @param obj 要拷贝的对象
 * @param hash WeakMap 用于处理循环引用
 * @returns 深拷贝后的对象
 */
export function deepClone<T>(obj: T, hash = new WeakMap()): T {
  // null 或 undefined
  if (obj === null || obj === undefined) {
    return obj
  }

  // 基本类型
  if (typeof obj !== 'object') {
    return obj
  }

  // 处理循环引用
  if (hash.has(obj as any)) {
    return hash.get(obj as any)
  }

  // Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  // RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as any
  }

  // 数组
  if (Array.isArray(obj)) {
    const cloneArr: any[] = []
    hash.set(obj as any, cloneArr)
    obj.forEach((item, index) => {
      cloneArr[index] = deepClone(item, hash)
    })
    return cloneArr as any
  }

  // 对象
  const cloneObj: any = {}
  hash.set(obj as any, cloneObj)

  // 复制 Symbol 属性
  const symbolKeys = Object.getOwnPropertySymbols(obj)
  symbolKeys.forEach(key => {
    cloneObj[key] = deepClone((obj as any)[key], hash)
  })

  // 复制普通属性
  Object.keys(obj).forEach(key => {
    cloneObj[key] = deepClone((obj as any)[key], hash)
  })

  return cloneObj
}

/**
 * 浅拷贝
 */
export function shallowClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return [...obj] as any
  }

  return { ...obj }
}

/**
 * 合并对象（深度合并）
 */
export function merge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target

  const source = sources.shift()
  if (source === undefined) return target

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const targetValue = (target as any)[key]
      const sourceValue = (source as any)[key]

      if (isObject(sourceValue)) {
        if (!targetValue || !isObject(targetValue)) {
          (target as any)[key] = {}
        }
        merge((target as any)[key], sourceValue)
      } else {
        (target as any)[key] = sourceValue
      }
    })
  }

  return merge(target, ...sources)
}

/**
 * 判断是否为普通对象
 */
function isObject(obj: any): boolean {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj)
}

/**
 * 判断对象是否为空
 */
export function isEmpty(obj: any): boolean {
  if (obj === null || obj === undefined) return true
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * 安全地从对象中获取深层属性 (Safe Get)
 * @param obj 目标对象
 * @param path 路径 (如 'a.b.c')
 * @param defaultValue 默认值
 */
export function safeGet<T = any>(obj: any, path: string, defaultValue?: T): T {
  if (obj === null || obj === undefined || typeof path !== 'string' || !path) {
    return defaultValue as T
  }

  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (current === null || current === undefined) return defaultValue as T
    current = current[key]
  }

  return (current === undefined || current === null) ? defaultValue as T : current
}
