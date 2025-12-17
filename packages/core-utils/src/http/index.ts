/**
 * HTTP 请求工具（基于原生 fetch）
 */

export interface RequestConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  credentials?: RequestCredentials
  mode?: RequestMode
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, any>
  timeout?: number
}

/**
 * HTTP 客户端类
 */
export class HttpClient {
  private config: RequestConfig
  
  constructor(config: RequestConfig = {}) {
    this.config = {
      baseURL: config.baseURL || '',
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      credentials: config.credentials || 'same-origin',
      mode: config.mode || 'cors'
    }
  }
  
  /**
   * 构建完整URL
   */
  private buildURL(url: string, params?: Record<string, any>): string {
    const fullURL = url.startsWith('http') ? url : `${this.config.baseURL}${url}`
    
    if (!params) return fullURL
    
    const queryString = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')
    
    return queryString ? `${fullURL}?${queryString}` : fullURL
  }
  
  /**
   * 请求拦截器
   */
  private requestInterceptor(config: RequestOptions): RequestOptions {
    // 添加认证 token
    const token = this.getToken()
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      }
    }
    
    // GET请求添加时间戳防止缓存
    if (config.method === 'GET' && !config.params) {
      config.params = {}
    }
    if (config.method === 'GET') {
      config.params!._t = Date.now()
    }
    
    return config
  }
  
  /**
   * 响应拦截器
   */
  private async responseInterceptor(response: Response): Promise<any> {
    if (!response.ok) {
      await this.handleError(response)
      throw new Error(`HTTP Error: ${response.status}`)
    }
    
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const data = await response.json()
      
      // 统一业务错误处理
      if (data.code && data.code !== 200) {
        this.handleBusinessError(data)
        throw new Error(data.message || 'Business Error')
      }
      
      return data
    }
    
    return response.text()
  }
  
  /**
   * 获取Token
   */
  private getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token')
    }
    return null
  }
  
  /**
   * 处理HTTP错误
   */
  private async handleError(response: Response): Promise<void> {
    const status = response.status
    
    switch (status) {
      case 401:
        // 未授权，清除token
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('token')
          // 可以在这里触发登录跳转
          console.warn('[HTTP] 未授权，请重新登录')
        }
        break
      case 403:
        console.warn('[HTTP] 权限不足')
        break
      case 404:
        console.warn('[HTTP] 请求资源不存在')
        break
      case 500:
        console.error('[HTTP] 服务器内部错误')
        break
      default:
        console.error(`[HTTP] 错误: ${status}`)
    }
  }
  
  /**
   * 处理业务错误
   */
  private handleBusinessError(error: any): void {
    console.error('[HTTP] 业务错误:', error.message)
  }
  
  /**
   * 发起请求
   */
  private async request(url: string, options: RequestOptions = {}): Promise<any> {
    // 请求拦截
    const config = this.requestInterceptor(options)
    
    // 构建URL
    const fullURL = this.buildURL(url, config.params)
    
    // 构建请求配置
    const fetchConfig: RequestInit = {
      method: config.method || 'GET',
      headers: {
        ...this.config.headers,
        ...config.headers
      },
      credentials: this.config.credentials,
      mode: this.config.mode,
      body: config.body
    }
    
    // 超时处理
    const timeout = config.timeout || this.config.timeout!
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(fullURL, {
        ...fetchConfig,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      // 响应拦截
      return await this.responseInterceptor(response)
    } catch (error) {
      clearTimeout(timeoutId)
      
      if ((error as Error).name === 'AbortError') {
        throw new Error(`请求超时 (${timeout}ms)`)
      }
      
      throw error
    }
  }
  
  /**
   * GET 请求
   */
  get<T = any>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<T> {
    return this.request(url, {
      ...options,
      method: 'GET',
      params
    })
  }
  
  /**
   * POST 请求
   */
  post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
  
  /**
   * PUT 请求
   */
  put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }
  
  /**
   * DELETE 请求
   */
  delete<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.request(url, {
      ...options,
      method: 'DELETE'
    })
  }
  
  /**
   * PATCH 请求
   */
  patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }
}

/**
 * 创建HTTP客户端
 * @param config - 配置
 * @returns HTTP客户端实例
 */
export function createHttpClient(config?: RequestConfig): HttpClient {
  return new HttpClient(config)
}

/**
 * 默认HTTP客户端实例
 */
export const http = new HttpClient()
