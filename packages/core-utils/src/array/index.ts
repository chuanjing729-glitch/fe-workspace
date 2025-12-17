/**
 * 数组工具函数
 */

/**
 * 数组去重
 * @param array - 原数组
 * @returns 去重后的数组
 */
export function unique<T>(array: T[]): T[] {
  if (!Array.isArray(array)) return []
  return [...new Set(array)]
}

/**
 * 根据指定键去重
 * @param array - 原数组
 * @param keyGetter - 获取键的函数
 * @returns 去重后的数组
 */
export function uniqueBy<T>(array: T[], keyGetter: (item: T) => any): T[] {
  if (!Array.isArray(array)) return []
  
  const seen = new Set()
  return array.filter(item => {
    const key = keyGetter(item)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

/**
 * 数组分组
 * @param array - 原数组
 * @param keyGetter - 获取分组键的函数
 * @returns 分组后的对象
 */
export function groupBy<T>(array: T[], keyGetter: (item: T) => string | number): Record<string, T[]> {
  if (!Array.isArray(array)) return {}
  
  const map = new Map<string | number, T[]>()
  array.forEach(item => {
    const key = keyGetter(item)
    const collection = map.get(key)
    if (!collection) {
      map.set(key, [item])
    } else {
      collection.push(item)
    }
  })
  
  return Object.fromEntries(map)
}

/**
 * 数组扁平化
 * @param array - 原数组
 * @param depth - 扁平化深度，默认为1
 * @returns 扁平化后的数组
 */
export function flatten<T>(array: any[], depth: number = 1): T[] {
  if (!Array.isArray(array)) return []
  
  if (depth <= 0) return array.slice()
  
  return array.reduce((acc, val) => {
    return acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val)
  }, [])
}

/**
 * 数组乱序（洗牌算法）
 * @param array - 原数组
 * @returns 乱序后的新数组
 */
export function shuffle<T>(array: T[]): T[] {
  if (!Array.isArray(array)) return []
  
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 获取数组最大值
 * @param array - 数字数组
 * @returns 最大值
 */
export function max(array: number[]): number | undefined {
  if (!Array.isArray(array) || array.length === 0) return undefined
  return Math.max(...array)
}

/**
 * 获取数组最小值
 * @param array - 数字数组
 * @returns 最小值
 */
export function min(array: number[]): number | undefined {
  if (!Array.isArray(array) || array.length === 0) return undefined
  return Math.min(...array)
}

/**
 * 数组求和
 * @param array - 数字数组
 * @returns 总和
 */
export function sum(array: number[]): number {
  if (!Array.isArray(array) || array.length === 0) return 0
  return array.reduce((acc, val) => acc + val, 0)
}

/**
 * 数组平均值
 * @param array - 数字数组
 * @returns 平均值
 */
export function average(array: number[]): number {
  if (!Array.isArray(array) || array.length === 0) return 0
  return sum(array) / array.length
}

/**
 * 数组交集
 * @param arrays - 多个数组
 * @returns 交集数组
 */
export function intersection<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return []
  if (arrays.length === 1) return [...arrays[0]]
  
  const [first, ...rest] = arrays
  return first.filter(item => 
    rest.every(arr => arr.includes(item))
  )
}

/**
 * 数组并集
 * @param arrays - 多个数组
 * @returns 并集数组
 */
export function union<T>(...arrays: T[][]): T[] {
  if (arrays.length === 0) return []
  return unique(arrays.flat())
}

/**
 * 数组差集（在第一个数组中但不在其他数组中的元素）
 * @param array - 第一个数组
 * @param arrays - 其他数组
 * @returns 差集数组
 */
export function difference<T>(array: T[], ...arrays: T[][]): T[] {
  if (!Array.isArray(array)) return []
  
  const others = arrays.flat()
  return array.filter(item => !others.includes(item))
}

/**
 * 数组分块
 * @param array - 原数组
 * @param size - 每块大小
 * @returns 分块后的二维数组
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (!Array.isArray(array) || size <= 0) return []
  
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

/**
 * 数组分页
 * @param array - 原数组
 * @param page - 页码（从1开始）
 * @param pageSize - 每页大小
 * @returns 分页数据
 */
export function paginate<T>(array: T[], page: number, pageSize: number): {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
} {
  if (!Array.isArray(array)) {
    return { data: [], total: 0, page, pageSize, totalPages: 0 }
  }
  
  const total = array.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = array.slice(start, end)
  
  return { data, total, page, pageSize, totalPages }
}
