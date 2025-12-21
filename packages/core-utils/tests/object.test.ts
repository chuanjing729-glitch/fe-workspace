import { safeGet, deepClone, shallowClone, merge, isEmpty } from '../src/object'

describe('Object模块测试', () => {
    describe('safeGet', () => {
        const obj = {
            a: {
                b: {
                    c: 1,
                    d: [1, 2, 3]
                },
                e: null,
                f: false
            }
        }

        test('正常获取深层属性', () => {
            expect(safeGet(obj, 'a.b.c')).toBe(1)
            expect(safeGet(obj, 'a.f')).toBe(false)
        })

        test('获取不存在的路径', () => {
            expect(safeGet(obj, 'a.b.x')).toBeUndefined()
            expect(safeGet(obj, 'x.y.z')).toBeUndefined()
        })

        test('带默认值的获取', () => {
            expect(safeGet(obj, 'a.b.x', 'default')).toBe('default')
            expect(safeGet(obj, 'x.y.z', 100)).toBe(100)
        })

        test('处理 null 或 undefined 路径', () => {
            expect(safeGet(obj, 'a.e.x')).toBeUndefined()
            expect(safeGet(obj, 'a.e.x', 'empty')).toBe('empty')
        })

        test('数组索引获取', () => {
            expect(safeGet(obj, 'a.b.d.0')).toBe(1)
            expect(safeGet(obj, 'a.b.d.2')).toBe(3)
            expect(safeGet(obj, 'a.b.d.5')).toBeUndefined()
        })

        test('空对象或空路径', () => {
            expect(safeGet(null as any, 'a.b')).toBeUndefined()
            expect(safeGet(obj, '')).toBeUndefined()
            expect(safeGet(obj, null as any)).toBeUndefined()
        })
    })

    describe('deepClone', () => {
        test('基本类型拷贝', () => {
            expect(deepClone(1)).toBe(1)
            expect(deepClone('test')).toBe('test')
            expect(deepClone(null)).toBeNull()
            expect(deepClone(undefined)).toBeUndefined()
        })

        test('对象深度拷贝', () => {
            const obj = {
                a: 1,
                b: { c: 2 },
                d: [1, 2],
                e: new Date('2023-01-01'),
                f: /test/gi
            }
            const clone = deepClone(obj)

            expect(clone).not.toBe(obj)
            expect(clone).toEqual(obj)
            expect(clone.b).not.toBe(obj.b)
            expect(clone.d).not.toBe(obj.d)
            expect(clone.e).not.toBe(obj.e)
            expect(clone.e.getTime()).toBe(obj.e.getTime())
            expect(clone.f).not.toBe(obj.f)
            expect(clone.f.source).toBe(obj.f.source)
        })

        test('循环引用处理', () => {
            const obj: any = { a: 1 }
            obj.self = obj

            const clone = deepClone(obj)
            expect(clone.a).toBe(1)
            expect(clone.self).toBe(clone)
        })

        test('Symbol 属性拷贝', () => {
            const sym = Symbol('test')
            const obj = { [sym]: 'value' }
            const clone = deepClone(obj)

            expect(clone[sym]).toBe('value')
        })

        test('数组深度拷贝', () => {
            const arr = [1, { a: 2 }, [3]]
            const clone = deepClone(arr)

            expect(clone).not.toBe(arr)
            expect(clone).toEqual(arr)
            expect(clone[1]).not.toBe(arr[1])
            expect(clone[2]).not.toBe(arr[2])
        })
    })

    describe('shallowClone', () => {
        test('浅拷贝对象', () => {
            const obj = { a: 1, b: { c: 2 } }
            const clone = shallowClone(obj)

            expect(clone).not.toBe(obj)
            expect(clone).toEqual(obj)
            expect(clone.b).toBe(obj.b) // 引用相同
        })

        test('浅拷贝数组', () => {
            const arr = [1, { a: 2 }]
            const clone = shallowClone(arr)

            expect(clone).not.toBe(arr)
            expect(clone).toEqual(arr)
            expect(clone[1]).toBe(arr[1]) // 引用相同
        })

        test('基本类型返回原值', () => {
            expect(shallowClone(1)).toBe(1)
            expect(shallowClone(null)).toBeNull()
        })
    })

    describe('merge', () => {
        test('深度合并对象', () => {
            const target: any = { a: 1, b: { c: 1 } }
            const source = { b: { d: 2 }, e: 3 }
            const result = merge(target, source)

            expect(result).toEqual({ a: 1, b: { c: 1, d: 2 }, e: 3 })
        })

        test('合并数组', () => {
            const target = { a: [1] }
            const source = { a: [2] }
            // 数组会被替换而不是合并
            expect(merge(target, source)).toEqual({ a: [2] })
        })

        test('空源对象', () => {
            const target = { a: 1 }
            expect(merge(target)).toBe(target)
            expect(merge(target, undefined as any)).toBe(target)
        })
    })

    describe('isEmpty', () => {
        test('检查各种空值', () => {
            expect(isEmpty(null)).toBe(true)
            expect(isEmpty(undefined)).toBe(true)
            expect(isEmpty('')).toBe(true)
            expect(isEmpty([])).toBe(true)
            expect(isEmpty({})).toBe(true)
        })

        test('检查非空值', () => {
            expect(isEmpty(' ')).toBe(false)
            expect(isEmpty([1])).toBe(false)
            expect(isEmpty({ a: 1 })).toBe(false)
            expect(isEmpty(0)).toBe(false)
        })
    })
})
