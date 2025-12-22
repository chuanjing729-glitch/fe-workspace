import * as fs from 'fs';
import * as path from 'path';
import { ApiTrackerPluginOptions } from '../types';

/**
 * 覆盖率插件协作管理器
 * 负责与coverage-plugin的集成和协作
 */
export class CoverageCollaborationManager {
  /**
   * 构造函数
   * @param options API跟踪插件配置选项
   */
  constructor(private readonly options: ApiTrackerPluginOptions) {}

  /**
   * 通知coverage-plugin关于API变更
   * @param changeInfo 变更信息
   */
  async notifyApiChange(changeInfo: any): Promise<void> {
    // 检查覆盖率插件是否启用
    if (!this.options.coveragePlugin?.enabled) {
      return;
    }

    try {
      // 将API变更通知写入coverage-plugin可以读取的文件
      const notificationPath = path.join(
        process.cwd(), 
        '.api-tracker', 
        'api-change-notification.json'
      );
      
      // 确保目录存在
      const dir = path.dirname(notificationPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // 写入通知
      fs.writeFileSync(
        notificationPath, 
        JSON.stringify({
          timestamp: new Date().toISOString(),
          changeInfo,
          plugin: 'api-tracker-plugin'
        }, null, 2)
      );

      console.log('[ApiTrackerPlugin] 已通知coverage-plugin关于API变更');
    } catch (error) {
      console.error('[ApiTrackerPlugin] 通知coverage-plugin失败:', error);
    }
  }

  /**
   * 检查coverage-plugin是否已安装并可用
   * @returns 插件是否可用
   */
  isCoveragePluginAvailable(): boolean {
    try {
      // 检查插件是否在项目中安装
      const coveragePluginPath = path.join(
        process.cwd(), 
        'node_modules', 
        'coverage-plugin'
      );
      
      return fs.existsSync(coveragePluginPath);
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取覆盖率插件配置
   * @returns 配置对象或null
   */
  async getCoveragePluginConfig(): Promise<any> {
    // 检查是否配置了配置路径
    if (!this.options.coveragePlugin?.configPath) {
      return null;
    }

    try {
      const configPath = path.resolve(this.options.coveragePlugin.configPath);
      // 检查配置文件是否存在
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configContent);
      }
    } catch (error) {
      console.warn('[ApiTrackerPlugin] 读取覆盖率插件配置失败:', error);
    }

    return null;
  }

  /**
   * 发送API变更数据到覆盖率插件
   * @param changeData 变更数据
   */
  async sendApiChangeData(changeData: any): Promise<void> {
    // 检查覆盖率插件是否启用
    if (!this.options.coveragePlugin?.enabled) {
      return;
    }

    try {
      // 将API变更数据写入覆盖率目录中的文件
      const coverageDir = path.join(process.cwd(), '.coverage');
      // 确保覆盖率目录存在
      if (!fs.existsSync(coverageDir)) {
        fs.mkdirSync(coverageDir, { recursive: true });
      }

      const apiChangeFile = path.join(coverageDir, 'api-changes.json');
      // 写入API变更数据
      fs.writeFileSync(
        apiChangeFile,
        JSON.stringify({
          timestamp: new Date().toISOString(),
          changes: changeData
        }, null, 2)
      );

      console.log('[ApiTrackerPlugin] 已发送API变更数据到覆盖率插件');
    } catch (error) {
      console.error('[ApiTrackerPlugin] 发送API变更数据失败:', error);
    }
  }
}