import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { ApiTrackerPluginOptions } from '../types';

/**
 * OpenAPI规范收集器
 * 负责从OpenAPI规范中收集API数据
 */
export class OpenApiCollector {
  /**
   * 构造函数
   * @param options 插件配置选项
   */
  constructor(private readonly options: ApiTrackerPluginOptions) {}

  /**
   * 从OpenAPI规范中收集API数据
   * 支持从URL或本地文件读取OpenAPI规范，并解析JSON或YAML格式
   * @returns 解析后的API信息
   */
  async collect(): Promise<any> {
    try {
      // 检查是否配置了OpenAPI规范路径或URL
      if (!this.options.openApiSpec) {
        throw new Error('未配置OpenAPI规范路径或URL');
      }

      let specData: any;

      // 检查是URL还是文件路径
      if (this.options.openApiSpec.startsWith('http')) {
        // 从URL获取数据
        const response = await axios.get(this.options.openApiSpec);
        specData = response.data;
      } else {
        // 从本地文件读取
        const fullPath = path.resolve(this.options.openApiSpec);
        // 检查文件是否存在
        if (!fs.existsSync(fullPath)) {
          throw new Error(`找不到OpenAPI规范文件: ${fullPath}`);
        }
        
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        // 首先尝试解析为JSON，然后尝试解析为YAML
        try {
          specData = JSON.parse(fileContent);
        } catch (jsonError) {
          // 如果JSON解析失败，尝试解析为YAML
          try {
            const yaml = await import('js-yaml');
            specData = yaml.load(fileContent);
          } catch (yamlError) {
            throw new Error('无法将OpenAPI规范解析为JSON或YAML格式');
          }
        }
      }

      // 验证规范
      this.validateOpenApiSpec(specData);

      // 提取相关信息
      return this.extractApiInfo(specData);
    } catch (error) {
      // 错误处理
      console.error('收集OpenAPI数据时出错:', error);
      throw error;
    }
  }

  /**
   * 验证OpenAPI规范
   * 检查必需的字段是否存在
   * @param spec OpenAPI规范对象
   */
  private validateOpenApiSpec(spec: any): void {
    // 检查openapi字段
    if (!spec.openapi) {
      throw new Error('无效的OpenAPI规范: 缺少"openapi"字段');
    }

    // 检查info字段
    if (!spec.info) {
      throw new Error('无效的OpenAPI规范: 缺少"info"字段');
    }

    // 检查paths字段
    if (!spec.paths) {
      throw new Error('无效的OpenAPI规范: 缺少"paths"字段');
    }
  }

  /**
   * 从OpenAPI规范中提取API信息
   * @param spec OpenAPI规范对象
   * @returns 提取的API信息
   */
  private extractApiInfo(spec: any): any {
    // 初始化API信息对象
    const apiInfo: any = {
      openapi: spec.openapi,
      info: spec.info,
      servers: spec.servers || [],
      paths: {},
      components: spec.components || {}
    };

    // 提取路径和操作
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      apiInfo.paths[path] = {};

      // 处理每个HTTP方法
      for (const [method, operation] of Object.entries(pathItem as any)) {
        if (this.isHttpMethod(method)) {
          apiInfo.paths[path][method.toUpperCase()] = this.extractOperationInfo(operation as any);
        }
      }
    }

    return apiInfo;
  }

  /**
   * 提取操作信息
   * @param operation 操作对象
   * @returns 提取的操作信息
   */
  private extractOperationInfo(operation: any): any {
    return {
      operationId: operation.operationId,
      summary: operation.summary,
      description: operation.description,
      parameters: operation.parameters || [],
      requestBody: operation.requestBody,
      responses: operation.responses || {},
      tags: operation.tags || []
    };
  }

  /**
   * 检查字符串是否为HTTP方法
   * @param method 方法字符串
   * @returns 是否为HTTP方法
   */
  private isHttpMethod(method: string): boolean {
    const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'];
    return httpMethods.includes(method.toLowerCase());
  }
}