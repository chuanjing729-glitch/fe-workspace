/**
 * 智能差异引擎，用于API契约比较
 * 提供API契约的比较和差异分析功能
 */

/** API端点接口 */
export interface ApiEndpoint {
  /** 路径 */
  path: string;
  /** HTTP方法 */
  method: string;
  /** 操作ID */
  operationId?: string;
  /** 摘要 */
  summary?: string;
  /** 描述 */
  description?: string;
  /** 参数 */
  parameters?: any[];
  /** 请求体 */
  requestBody?: any;
  /** 响应 */
  responses?: any;
  /** 标签 */
  tags?: string[];
}

/** API契约接口 */
export interface ApiContract {
  /** OpenAPI版本 */
  openapi?: string;
  /** 信息 */
  info?: any;
  /** 服务器 */
  servers?: any[];
  /** 路径 */
  paths: Record<string, Record<string, ApiEndpoint>>;
  /** 组件 */
  components?: any;
}

/** 差异结果接口 */
export interface DiffResult {
  /** 新增的变更 */
  added: ApiChange[];
  /** 移除的变更 */
  removed: ApiChange[];
  /** 修改的变更 */
  modified: ApiChange[];
}

/** API变更接口 */
export interface ApiChange {
  /** 路径 */
  path: string;
  /** HTTP方法 */
  method: string;
  /** 变更类型 */
  type: 'added' | 'removed' | 'modified';
  /** 详细信息 */
  details: any;
}

/**
 * 智能差异引擎类
 * 用于比较API契约并生成差异报告
 */
export class SmartDiffEngine {
  /**
   * 比较两个API契约并生成差异报告
   * @param oldContract 旧的API契约
   * @param newContract 新的API契约
   * @returns 差异结果
   */
  diff(oldContract: ApiContract, newContract: ApiContract): DiffResult {
    // 初始化差异结果
    const result: DiffResult = {
      added: [],
      removed: [],
      modified: []
    };

    // 比较路径
    const allPaths = new Set([
      ...Object.keys(oldContract.paths),
      ...Object.keys(newContract.paths)
    ]);

    // 遍历所有路径
    for (const path of allPaths) {
      const oldPathItem = oldContract.paths[path];
      const newPathItem = newContract.paths[path];

      if (!oldPathItem && newPathItem) {
        // 新增路径
        this.addPathChanges(result.added, path, newPathItem);
      } else if (oldPathItem && !newPathItem) {
        // 移除路径
        this.addPathChanges(result.removed, path, oldPathItem);
      } else if (oldPathItem && newPathItem) {
        // 路径在两者中都存在，比较操作
        this.comparePathItems(result, path, oldPathItem, newPathItem);
      }
    }

    return result;
  }

  /**
   * 将路径变更添加到结果中
   * @param changes 变更数组
   * @param path 路径
   * @param pathItem 路径项
   */
  private addPathChanges(changes: ApiChange[], path: string, pathItem: Record<string, ApiEndpoint>): void {
    for (const [method, operation] of Object.entries(pathItem)) {
      changes.push({
        path,
        method,
        type: changes === changes ? 'added' : 'removed',
        details: operation
      });
    }
  }

  /**
   * 比较路径项（操作）
   * @param result 差异结果
   * @param path 路径
   * @param oldPathItem 旧的路径项
   * @param newPathItem 新的路径项
   */
  private comparePathItems(result: DiffResult, path: string, oldPathItem: Record<string, ApiEndpoint>, newPathItem: Record<string, ApiEndpoint>): void {
    // 获取所有方法
    const allMethods = new Set([
      ...Object.keys(oldPathItem),
      ...Object.keys(newPathItem)
    ]);

    // 遍历所有方法
    for (const method of allMethods) {
      const oldOperation = oldPathItem[method];
      const newOperation = newPathItem[method];

      if (!oldOperation && newOperation) {
        // 新增操作
        result.added.push({
          path,
          method,
          type: 'added',
          details: newOperation
        });
      } else if (oldOperation && !newOperation) {
        // 移除操作
        result.removed.push({
          path,
          method,
          type: 'removed',
          details: oldOperation
        });
      } else if (oldOperation && newOperation) {
        // 操作在两者中都存在，比较详细信息
        this.compareOperations(result, path, method, oldOperation, newOperation);
      }
    }
  }

  /**
   * 比较操作的详细变更
   * @param result 差异结果
   * @param path 路径
   * @param method HTTP方法
   * @param oldOperation 旧的操作
   * @param newOperation 新的操作
   */
  private compareOperations(result: DiffResult, path: string, method: string, oldOperation: ApiEndpoint, newOperation: ApiEndpoint): void {
    // 检查重要变更
    const changes: any = {};

    // 比较操作ID
    if (oldOperation.operationId !== newOperation.operationId) {
      changes.operationId = {
        from: oldOperation.operationId,
        to: newOperation.operationId
      };
    }

    // 比较摘要
    if (oldOperation.summary !== newOperation.summary) {
      changes.summary = {
        from: oldOperation.summary,
        to: newOperation.summary
      };
    }

    // 比较参数
    if (JSON.stringify(oldOperation.parameters) !== JSON.stringify(newOperation.parameters)) {
      changes.parameters = {
        from: oldOperation.parameters,
        to: newOperation.parameters
      };
    }

    // 比较请求体
    if (JSON.stringify(oldOperation.requestBody) !== JSON.stringify(newOperation.requestBody)) {
      changes.requestBody = {
        from: oldOperation.requestBody,
        to: newOperation.requestBody
      };
    }

    // 比较响应
    if (JSON.stringify(oldOperation.responses) !== JSON.stringify(newOperation.responses)) {
      changes.responses = {
        from: oldOperation.responses,
        to: newOperation.responses
      };
    }

    // 如果有变更，添加到修改列表中
    if (Object.keys(changes).length > 0) {
      result.modified.push({
        path,
        method,
        type: 'modified',
        details: changes
      });
    }
  }

  /**
   * 生成人类可读的差异报告
   * @param diffResult 差异结果
   * @returns 格式化的差异报告
   */
  generateReport(diffResult: DiffResult): string {
    let report = '# API契约差异报告\n\n';

    // 处理新增的端点
    if (diffResult.added.length > 0) {
      report += '## 新增的端点\n\n';
      for (const change of diffResult.added) {
        report += `- **${change.method.toUpperCase()}** \`${change.path}\` - 新端点\n`;
      }
      report += '\n';
    }

    // 处理移除的端点
    if (diffResult.removed.length > 0) {
      report += '## 移除的端点\n\n';
      for (const change of diffResult.removed) {
        report += `- **${change.method.toUpperCase()}** \`${change.path}\` - 端点已移除\n`;
      }
      report += '\n';
    }

    // 处理修改的端点
    if (diffResult.modified.length > 0) {
      report += '## 修改的端点\n\n';
      for (const change of diffResult.modified) {
        report += `- **${change.method.toUpperCase()}** \`${change.path}\`\n`;
        for (const [field, diff] of Object.entries(change.details)) {
          report += `  - ${field}: \`${(diff as any).from}\` → \`${(diff as any).to}\`\n`;
        }
      }
      report += '\n';
    }

    // 如果没有变更，添加提示信息
    if (report === '# API契约差异报告\n\n') {
      report += '未检测到变更。\n';
    }

    return report;
  }
}