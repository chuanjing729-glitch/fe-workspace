import * as http from 'http';
import * as https from 'https';
import { JSDOM } from 'jsdom';
import { ApiTrackerPluginOptions } from '../types';

/**
 * HTTP爬虫类，用于发现API端点
 * 通过爬取网页内容来发现潜在的API端点
 */
export class HttpCrawler {
  /** 插件配置选项 */
  private readonly options: ApiTrackerPluginOptions;
  /** 已爬取的URL集合，用于防止无限循环 */
  private readonly crawledUrls: Set<string> = new Set();
  /** 发现的API端点集合 */
  private readonly apiEndpoints: Set<string> = new Set();

  /**
   * 构造函数
   * @param options 插件配置选项
   */
  constructor(options: ApiTrackerPluginOptions) {
    this.options = options;
  }

  /**
   * 爬取URL以发现API端点
   * @returns 包含发现的端点和已爬取URL的对象
   */
  async crawl(): Promise<any> {
    try {
      // 检查是否配置了要爬取的URL
      if (!this.options.crawler?.urls || this.options.crawler.urls.length === 0) {
        throw new Error('未配置要爬取的URL');
      }

      // 重置集合
      this.crawledUrls.clear();
      this.apiEndpoints.clear();

      // 爬取每个URL
      for (const url of this.options.crawler.urls) {
        await this.crawlUrl(url);
      }

      // 返回收集到的API信息
      return {
        endpoints: Array.from(this.apiEndpoints),
        crawledUrls: Array.from(this.crawledUrls)
      };
    } catch (error) {
      // 错误处理
      console.error('爬取过程中出错:', error);
      throw error;
    }
  }

  /**
   * 爬取单个URL
   * @param url 要爬取的URL
   */
  private async crawlUrl(url: string): Promise<void> {
    // 防止无限循环
    if (this.crawledUrls.has(url)) {
      return;
    }

    // 限制URL数量以防止过度爬取
    if (this.crawledUrls.size > 100) {
      console.warn('达到爬取限制，停止爬取');
      return;
    }

    // 将URL添加到已爬取集合中
    this.crawledUrls.add(url);
    console.log(`正在爬取URL: ${url}`);

    try {
      // 获取页面内容
      const htmlContent = await this.fetchPage(url);
      
      // 从页面中提取API端点
      this.extractApiEndpoints(htmlContent, url);
      
      // 提取链接以进行进一步爬取（如果启用）
      if (this.shouldFollowLinks()) {
        const links = this.extractLinks(htmlContent, url);
        for (const link of links) {
          // 限制并发爬取
          await this.crawlUrl(link);
        }
      }
    } catch (error) {
      // 爬取失败时打印警告信息
      console.warn(`爬取 ${url} 失败:`, error);
    }
  }

  /**
   * 获取页面内容
   * @param url 要获取内容的URL
   * @returns 页面HTML内容
   */
  private async fetchPage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // 设置超时时间
      const timeout = this.options.crawler?.timeout || 10000;
      // 是否跟随重定向
      const followRedirects = this.options.crawler?.followRedirects ?? true;

      // 根据URL协议选择客户端
      const client = url.startsWith('https') ? https : http;
      
      // 发送HTTP GET请求
      const req = client.get(url, { timeout }, (res) => {
        // 处理重定向
        if (followRedirects && (res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
          // 处理重定向
          this.crawlUrl(new URL(res.headers.location, url).href).then(() => resolve(''), reject);
          return;
        }

        // 检查响应状态码
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }

        // 收集响应数据
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        // 响应结束时解析数据
        res.on('end', () => {
          resolve(data);
        });
      });

      // 处理请求错误
      req.on('error', (error) => {
        reject(error);
      });

      // 处理超时
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('请求超时'));
      });
    });
  }

  /**
   * 从HTML内容中提取API端点
   * @param htmlContent HTML内容
   * @param baseUrl 基础URL
   */
  private extractApiEndpoints(htmlContent: string, baseUrl: string): void {
    try {
      // 使用JSDOM解析HTML
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;

      // 在script标签中查找常见的API端点模式
      const scriptTags = document.querySelectorAll('script');
      scriptTags.forEach((script: any) => {
        if (script.textContent) {
          this.findApiEndpointsInText(script.textContent, baseUrl);
        }
      });

      // 在内联脚本中查找fetch/XHR调用中的API端点
      const inlineScripts = Array.from(document.querySelectorAll('script:not([src])'));
      inlineScripts.forEach((script: any) => {
        if (script.textContent) {
          this.findApiEndpointsInText(script.textContent, baseUrl);
        }
      });

      // 查找可能包含API端点的数据属性
      const elementsWithDataAttrs = document.querySelectorAll('[data-api], [data-endpoint]');
      elementsWithDataAttrs.forEach((el) => {
        const apiAttr = el.getAttribute('data-api') || el.getAttribute('data-endpoint');
        if (apiAttr) {
          this.apiEndpoints.add(new URL(apiAttr, baseUrl).href);
        }
      });
    } catch (error) {
      // 提取API端点出错时打印警告信息
      console.warn('从HTML中提取API端点时出错:', error);
    }
  }

  /**
   * 在文本内容中查找API端点
   * @param text 文本内容
   * @param baseUrl 基础URL
   */
  private findApiEndpointsInText(text: string, baseUrl: string): void {
    // 常见的API端点模式
    const patterns = [
      // REST API模式
      /\/api\/[a-zA-Z0-9\-_\/.]*/g,
      /\/rest\/[a-zA-Z0-9\-_\/.]*/g,
      /\/v\d+\/[a-zA-Z0-9\-_\/.]*/g,
      
      // GraphQL端点
      /\/graphql/g,
      
      // AJAX URL模式
      /url\s*:\s*['"][^'"]*\/api[^'"]*['"]/g,
      /fetch\(['"][^'"]*\/api[^'"]*['"]\)/g,
      /xhr\.open\([^,]*,\s*['"][^'"]*\/api[^'"]*['"]\)/g
    ];

    // 遍历所有模式
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          // 从匹配中提取实际的URL
          const urlMatch = match.match(/['"]([^'"]*\/api[^'"]*)['"]|\/(api|rest|v\d+|graphql)[^\s'")}]*/);
          if (urlMatch && urlMatch[1]) {
            try {
              const fullUrl = new URL(urlMatch[1], baseUrl).href;
              this.apiEndpoints.add(fullUrl);
            } catch (e) {
              // 忽略无效的URL
            }
          } else if (urlMatch && urlMatch[0]) {
            try {
              const fullUrl = new URL(urlMatch[0], baseUrl).href;
              this.apiEndpoints.add(fullUrl);
            } catch (e) {
              // 忽略无效的URL
            }
          }
        });
      }
    }
  }

  /**
   * 从HTML内容中提取链接以进行进一步爬取
   * @param htmlContent HTML内容
   * @param baseUrl 基础URL
   * @returns 提取的链接数组
   */
  private extractLinks(htmlContent: string, baseUrl: string): string[] {
    const links: string[] = [];
    
    try {
      // 使用JSDOM解析HTML
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;
      
      // 查找所有带href属性的a标签
      const anchorTags = document.querySelectorAll('a[href]');
      anchorTags.forEach((anchor) => {
        const href = anchor.getAttribute('href');
        if (href) {
          try {
            const fullUrl = new URL(href, baseUrl).href;
            // 只跟随相同来源的链接
            if (new URL(baseUrl).origin === new URL(fullUrl).origin) {
              links.push(fullUrl);
            }
          } catch (e) {
            // 忽略无效的URL
          }
        }
      });
    } catch (error) {
      // 提取链接出错时打印警告信息
      console.warn('从HTML中提取链接时出错:', error);
    }
    
    return links;
  }

  /**
   * 确定是否应该跟随链接
   * @returns 是否应该跟随链接
   */
  private shouldFollowLinks(): boolean {
    // 目前禁用链接跟随以防止过度爬取
    // 未来可能会使其可配置
    return false;
  }
}