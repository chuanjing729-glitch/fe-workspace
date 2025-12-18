export interface ApiTrackerPluginOptions {
  /**
   * 是否启用插件
   * @default true
   */
  enabled?: boolean;

  /**
   * 数据采集模式
   * @default 'openapi'
   */
  mode?: 'openapi' | 'crawler';

  /**
   * 存储API快照的路径
   * @default './.api-tracker/api-snapshot.json'
   */
  snapshotPath?: string;

  /**
   * 存储差异报告的路径
   * @default './.api-tracker/diff-report.json'
   */
  diffReportPath?: string;

  /**
   * 存储安全配置的路径
   * @default './.api-tracker/security-config.json'
   */
  securityConfigPath?: string;

  /**
   * OpenAPI规范的URL或文件路径
   */
  openApiSpec?: string;

  /**
   * 爬虫配置
   */
  crawler?: {
    /**
     * 要爬取的URL列表
     */
    urls?: string[];

    /**
     * 爬虫超时时间(毫秒)
     * @default 10000
     */
    timeout?: number;

    /**
     * 是否跟随重定向
     * @default true
     */
    followRedirects?: boolean;
  };

  /**
   * 与webpack-coverage-plugin集成的配置
   */
  coveragePlugin?: {
    /**
     * 是否启用集成
     * @default false
     */
    enabled?: boolean;

    /**
     * 覆盖率插件配置的路径
     */
    configPath?: string;
  };

  /**
   * 运行时通知配置
   */
  notifications?: {
    /**
     * 是否显示通知
     * @default true
     */
    enabled?: boolean;

    /**
     * 通知位置
     * @default 'top-right'
     */
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

    /**
     * 通知超时时间(毫秒)
     * @default 5000
     */
    timeout?: number;
  };
}