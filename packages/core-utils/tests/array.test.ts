/**
 * Array 模块测试用例
 */

import {
  unique, uniqueBy, groupBy, flatten, shuffle,
  max, min, sum, average,
  intersection, union, difference,
  chunk, paginate
} from '../src/array'

describe('Array 模块测试', () => {
  // 1. unique - 数组去重
  test('unique: 基本去重', () => {
    expect(unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4])
    expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c'])
  })

  test('unique: 空数组和非数组', () => {
    expect(unique([])).toEqual([])
    expect(unique(null as any)).toEqual([])
  })

  // 2. uniqueBy - 根据键去重
  test('uniqueBy: 按属性去重', () => {
    const arr = [
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
      { id: 1, name: 'c' }
    ]
    expect(uniqueBy(arr, item => item.id)).toEqual([
      { id: 1, name: 'a' },
      { id: 2, name: 'b' }
    ])
  })

  // 3. groupBy - 分组
  test('groupBy: 按属性分组', () => {
    const arr = [
      { type: 'fruit', name: 'apple' },
      { type: 'fruit', name: 'banana' },
      { type: 'vegetable', name: 'carrot' }
    ]
    expect(groupBy(arr, item => item.type)).toEqual({
      fruit: [
        { type: 'fruit', name: 'apple' },
        { type: 'fruit', name: 'banana' }
      ],
      vegetable: [{ type: 'vegetable', name: 'carrot' }]
    })
  })

  // 4. flatten - 扁平化
  test('flatten: 默认深度1', () => {
    expect(flatten([1, [2, 3], [4, [5]]])).toEqual([1, 2, 3, 4, [5]])
  })

  test('flatten: 深度2', () => {
    expect(flatten([1, [2, [3, [4]]]], 2)).toEqual([1, 2, 3, [4]])
  })

  // 5. shuffle - 乱序（测试长度不变）
  test('shuffle: 长度不变', () => {
    const arr = [1, 2, 3, 4, 5]
    const shuffled = shuffle(arr)
    expect(shuffled.length).toBe(5)
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5])
  })

  // 6-9. 数学运算
  test('max: 最大值', () => {
    expect(max([1, 5, 3, 9, 2])).toBe(9)
    expect(max([])).toBeUndefined()
  })

  test('min: 最小值', () => {
    expect(min([1, 5, 3, 9, 2])).toBe(1)
  })

  test('sum: 求和', () => {
    expect(sum([1, 2, 3, 4, 5])).toBe(15)
    expect(sum([])).toBe(0)
  })

  test('average: 平均值', () => {
    expect(average([1, 2, 3, 4, 5])).toBe(3)
    expect(average([])).toBe(0)
  })

  // 10-12. 集合运算
  test('intersection: 交集', () => {
    expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3])
  })

  test('union: 并集', () => {
    expect(union([1, 2], [2, 3])).toEqual([1, 2, 3])
  })

  test('difference: 差集', () => {
    expect(difference([1, 2, 3], [2, 3, 4])).toEqual([1])
  })

  // 13. chunk - 分块
  test('chunk: 分块', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })

  // 14. paginate - 分页
  test('paginate: 分页', () => {
    const result = paginate([1, 2, 3, 4, 5, 6, 7], 1, 3)
    expect(result.data).toEqual([1, 2, 3])
    expect(result.total).toBe(7)
    expect(result.totalPages).toBe(3)
  })

  test('paginate: 非法输入', () => {
    const result = paginate(null as any, 1, 10)
    expect(result.data).toEqual([])
    expect(result.total).toBe(0)
  })
})
