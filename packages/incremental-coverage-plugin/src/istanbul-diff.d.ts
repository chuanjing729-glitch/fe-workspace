/**
 * istanbul-diff 类型声明文件
 * 
 * 为 istanbul-diff 库提供 TypeScript 类型定义
 * 
 * 为什么需要这个文件？
 * - istanbul-diff 库没有提供官方的 TypeScript 类型定义
 * - TypeScript 编译器需要类型信息才能正确编译
 * - 这个文件声明了我们使用的 API 的类型
 * 
 * @module istanbul-diff
 */

declare module 'istanbul-diff' {
    /**
     * 计算两个覆盖率数据之间的差异
     * 
     * @param baseline - 基准覆盖率数据
     * @param current - 当前覆盖率数据
     * @param options - 配置选项
     * @param options.pick - 选择要比较的维度（'lines' | 'statements' | 'functions' | 'branches'）
     * @returns 差异结果
     */
    export function diff(baseline: any, current: any, options?: { pick?: string }): any;
}
