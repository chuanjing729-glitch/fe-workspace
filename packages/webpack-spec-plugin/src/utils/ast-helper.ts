import * as ts from 'typescript'

/**
 * AST 辅助工具类
 */
export class ASTHelper {
    /**
     * 解析代码为 AST
     */
    static parse(content: string, fileName: string = 'temp.ts'): ts.SourceFile {
        return ts.createSourceFile(
            fileName,
            content,
            ts.ScriptTarget.Latest,
            true
        )
    }

    /**
     * 遍历 AST 节点
     */
    static traverse(node: ts.Node, visitor: (node: ts.Node) => void) {
        visitor(node)
        ts.forEachChild(node, child => this.traverse(child, visitor))
    }

    /**
     * 检查节点是否为方法调用
     */
    static isMethodCall(node: ts.Node, objectName: string | null, methodName: string): boolean {
        if (!ts.isCallExpression(node)) return false

        const expression = node.expression
        if (!ts.isPropertyAccessExpression(expression)) return false

        // 如果指定了对象名（如 'window' 或 'this'）
        if (objectName) {
            if (expression.expression.getText() !== objectName) return false
        }

        return expression.name.getText() === methodName
    }

    /**
     * 检查节点是否为全局函数调用 (如 setTimeout)
     */
    static isGlobalCall(node: ts.Node, funcName: string): boolean {
        if (!ts.isCallExpression(node)) return false
        return node.expression.getText() === funcName
    }

    /**
     * 获取节点所在的行号
     */
    static getLine(node: ts.Node, sourceFile: ts.SourceFile): number {
        return sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
    }
}
