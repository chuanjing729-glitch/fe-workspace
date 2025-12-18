import * as crypto from 'crypto';
import { ApiContract } from '../diff/SmartDiffEngine';

/**
 * 契约指纹生成器
 * 用于生成API契约的唯一指纹，便于比较和检测变更
 */
export class ContractFingerprintGenerator {
  /**
   * 为API契约生成指纹
   * @param contract API契约对象
   * @returns 契约的SHA-256哈希指纹
   */
  generate(contract: ApiContract): string {
    // 标准化契约数据以确保一致性哈希
    const normalizedData = this.normalizeContract(contract);
    
    // 转换为JSON字符串
    const jsonString = JSON.stringify(normalizedData);
    
    // 生成SHA-256哈希
    return crypto.createHash('sha256').update(jsonString).digest('hex');
  }

  /**
   * 标准化契约数据以确保一致性哈希
   * @param contract API契约对象
   * @returns 标准化后的契约数据
   */
  private normalizeContract(contract: ApiContract): any {
    // 创建副本以避免修改原始数据
    const normalized: any = {
      paths: {}
    };

    // 复制非路径字段
    if (contract.openapi) normalized.openapi = contract.openapi;
    if (contract.info) normalized.info = contract.info;
    if (contract.servers) normalized.servers = contract.servers;
    if (contract.components) normalized.components = contract.components;

    // 标准化路径 - 按路径和方法排序
    const sortedPaths = Object.keys(contract.paths).sort();
    
    for (const path of sortedPaths) {
      const pathItem = contract.paths[path];
      normalized.paths[path] = {};
      
      // 排序方法
      const sortedMethods = Object.keys(pathItem).sort();
      
      for (const method of sortedMethods) {
        const operation = pathItem[method];
        normalized.paths[path][method] = this.normalizeOperation(operation);
      }
    }

    return normalized;
  }

  /**
   * 标准化操作数据
   * @param operation 操作对象
   * @returns 标准化后的操作数据
   */
  private normalizeOperation(operation: any): any {
    // 创建副本，只包含我们想要包含在指纹中的字段
    const normalized: any = {};

    // 总是包含这些字段
    if (operation.operationId) normalized.operationId = operation.operationId;
    if (operation.summary) normalized.summary = operation.summary;
    if (operation.description) normalized.description = operation.description;
    if (operation.tags) normalized.tags = [...operation.tags].sort();

    // 标准化参数
    if (operation.parameters) {
      normalized.parameters = operation.parameters
        .map((param: any) => this.normalizeParameter(param))
        .sort((a: any, b: any) => {
          // 按名称和位置排序
          if (a.name !== b.name) return a.name.localeCompare(b.name);
          return a.in.localeCompare(b.in);
        });
    }

    // 标准化请求体
    if (operation.requestBody) {
      normalized.requestBody = this.normalizeRequestBody(operation.requestBody);
    }

    // 标准化响应
    if (operation.responses) {
      normalized.responses = this.normalizeResponses(operation.responses);
    }

    return normalized;
  }

  /**
   * 标准化参数数据
   * @param parameter 参数对象
   * @returns 标准化后的参数数据
   */
  private normalizeParameter(parameter: any): any {
    const normalized: any = {
      name: parameter.name,
      in: parameter.in
    };

    if (parameter.required !== undefined) normalized.required = parameter.required;
    if (parameter.description) normalized.description = parameter.description;
    if (parameter.schema) normalized.schema = this.normalizeSchema(parameter.schema);

    return normalized;
  }

  /**
   * 标准化请求体数据
   * @param requestBody 请求体对象
   * @returns 标准化后的请求体数据
   */
  private normalizeRequestBody(requestBody: any): any {
    const normalized: any = {};

    if (requestBody.description) normalized.description = requestBody.description;
    if (requestBody.required !== undefined) normalized.required = requestBody.required;

    if (requestBody.content) {
      normalized.content = {};
      // 排序内容类型
      const sortedContentTypes = Object.keys(requestBody.content).sort();
      
      for (const contentType of sortedContentTypes) {
        const mediaType = requestBody.content[contentType];
        normalized.content[contentType] = {};
        
        if (mediaType.schema) {
          normalized.content[contentType].schema = this.normalizeSchema(mediaType.schema);
        }
      }
    }

    return normalized;
  }

  /**
   * 标准化响应数据
   * @param responses 响应对象
   * @returns 标准化后的响应数据
   */
  private normalizeResponses(responses: any): any {
    const normalized: any = {};
    
    // 排序响应码
    const sortedCodes = Object.keys(responses).sort();
    
    for (const code of sortedCodes) {
      const response = responses[code];
      normalized[code] = {};
      
      if (response.description) normalized[code].description = response.description;
      
      if (response.content) {
        normalized[code].content = {};
        // 排序内容类型
        const sortedContentTypes = Object.keys(response.content).sort();
        
        for (const contentType of sortedContentTypes) {
          const mediaType = response.content[contentType];
          normalized[code].content[contentType] = {};
          
          if (mediaType.schema) {
            normalized[code].content[contentType].schema = this.normalizeSchema(mediaType.schema);
          }
        }
      }
    }

    return normalized;
  }

  /**
   * 标准化模式数据
   * @param schema 模式对象
   * @returns 标准化后的模式数据
   */
  private normalizeSchema(schema: any): any {
    // 目前，我们只是原样返回模式
    // 在更高级的实现中，我们可能想要标准化模式属性
    return schema;
  }

  /**
   * 比较两个指纹
   * @param fingerprint1 第一个指纹
   * @param fingerprint2 第二个指纹
   * @returns 两个指纹是否相等
   */
  compare(fingerprint1: string, fingerprint2: string): boolean {
    return fingerprint1 === fingerprint2;
  }
}