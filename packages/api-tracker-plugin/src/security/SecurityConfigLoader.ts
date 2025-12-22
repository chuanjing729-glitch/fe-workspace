import * as fs from 'fs';
import * as path from 'path';
import { ApiTrackerPluginOptions } from '../types';

/**
 * 安全配置加载器和管理器
 * 负责加载、保存和管理API跟踪插件的安全配置
 */
export class SecurityConfigLoader {
  /** 安全配置文件路径 */
  private readonly configPath: string;
  /** 安全配置对象 */
  private config: any = {};

  /**
   * 构造函数
   * @param options 插件配置选项
   */
  constructor(private readonly options: ApiTrackerPluginOptions) {
    // 设置安全配置文件路径，默认为 './.api-tracker/security-config.json'
    this.configPath = options.securityConfigPath || './.api-tracker/security-config.json';
  }

  /**
   * 从文件加载安全配置
   * 如果配置文件不存在，则创建默认配置
   */
  async load(): Promise<void> {
    try {
      // 确保配置文件所在目录存在
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 如果配置文件不存在，则创建默认配置
      if (!fs.existsSync(this.configPath)) {
        await this.createDefaultConfig();
      }

      // 读取配置文件内容
      const configFileContent = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(configFileContent);
    } catch (error) {
      // 加载配置失败时，使用默认配置并打印警告信息
      console.warn('加载安全配置失败，使用默认配置:', error);
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * 将安全配置保存到文件
   */
  async save(): Promise<void> {
    try {
      // 确保配置文件所在目录存在
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 将配置写入文件
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      // 保存配置失败时，打印错误信息
      console.error('保存安全配置失败:', error);
    }
  }

  /**
   * 根据键获取配置值
   * @param key 配置键
   * @param defaultValue 默认值
   * @returns 配置值或默认值
   */
  get(key: string, defaultValue?: any): any {
    return this.config[key] !== undefined ? this.config[key] : defaultValue;
  }

  /**
   * 根据键设置配置值
   * @param key 配置键
   * @param value 配置值
   */
  set(key: string, value: any): void {
    this.config[key] = value;
  }

  /**
   * 获取整个配置对象
   * @returns 配置对象
   */
  getConfig(): any {
    return this.config;
  }

  /**
   * 创建默认配置文件
   */
  private async createDefaultConfig(): Promise<void> {
    // 获取默认配置
    this.config = this.getDefaultConfig();
    // 保存配置到文件
    await this.save();
  }

  /**
   * 获取默认配置
   * @returns 默认配置对象
   */
  private getDefaultConfig(): any {
    return {
      // 在报告中应该被掩盖的API密钥
      maskedKeys: [
        'authorization',
        'auth',
        'token',
        'password',
        'secret',
        'key'
      ],
      
      // 应该被过滤的敏感头部
      sensitiveHeaders: [
        'authorization',
        'cookie',
        'x-api-key',
        'x-auth-token'
      ],
      
      // 数据掩盖模式
      maskingPatterns: [
        // 掩盖信用卡号码
        {
          pattern: '\\b(?:\\d[ -]*?){13,16}\\b',
          replacement: '****-****-****-****'
        },
        // 掩盖邮箱地址
        {
          pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
          replacement: '***@***.***'
        }
      ],
      
      // API验证的安全规则
      validationRules: {
        // 最大响应时间(毫秒)
        maxResponseTime: 5000,
        
        // 允许的HTTP方法
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        
        // 受限的响应头部
        restrictedResponseHeaders: [
          'server',
          'x-powered-by'
        ]
      }
    };
  }
}