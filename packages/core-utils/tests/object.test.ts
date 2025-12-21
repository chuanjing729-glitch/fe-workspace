import { safeGet } from '../src/object'

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
})
