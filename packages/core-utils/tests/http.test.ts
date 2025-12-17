import { HttpClient, createHttpClient } from '../src/http'

// Mock fetch
global.fetch = jest.fn()

describe('http模块测试', () => {
  let client: HttpClient

  beforeEach(() => {
    client = new HttpClient({
      baseURL: 'https://api.example.com',
      timeout: 5000
    })
    ;(fetch as jest.Mock).mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('GET请求', () => {
    test('基本GET请求', async () => {
      const mockResponse = { data: 'test', code: 200 }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      })

      const result = await client.get('/test')
      
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockResponse)
    })

    test('GET请求带参数', async () => {
      const mockResponse = { code: 200 }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      })

      await client.get('/test', { id: 1, name: 'test' })
      
      const callUrl = (fetch as jest.Mock).mock.calls[0][0]
      expect(callUrl).toContain('id=1')
      expect(callUrl).toContain('name=test')
    })
  })

  describe('POST请求', () => {
    test('基本POST请求', async () => {
      const mockResponse = { code: 200 }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      })

      const postData = { name: 'test' }
      await client.post('/test', postData)
      
      expect(fetch).toHaveBeenCalledTimes(1)
      const callConfig = (fetch as jest.Mock).mock.calls[0][1]
      expect(callConfig.method).toBe('POST')
      expect(callConfig.body).toBe(JSON.stringify(postData))
    })
  })

  describe('PUT请求', () => {
    test('基本PUT请求', async () => {
      const mockResponse = { code: 200 }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      })

      await client.put('/test', { id: 1 })
      
      const callConfig = (fetch as jest.Mock).mock.calls[0][1]
      expect(callConfig.method).toBe('PUT')
    })
  })

  describe('DELETE请求', () => {
    test('基本DELETE请求', async () => {
      const mockResponse = { code: 200 }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      })

      await client.delete('/test')
      
      const callConfig = (fetch as jest.Mock).mock.calls[0][1]
      expect(callConfig.method).toBe('DELETE')
    })
  })

  describe('错误处理', () => {
    test('HTTP错误', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Headers()
      })

      await expect(client.get('/test')).rejects.toThrow('HTTP Error')
    })

    test('业务错误', async () => {
      const mockResponse = { code: 500, message: 'Business Error' }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      })

      await expect(client.get('/test')).rejects.toThrow('Business Error')
    })

    test('网络错误', async () => {
      ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'))

      await expect(client.get('/test')).rejects.toThrow('Network Error')
    })
  })

  describe('createHttpClient', () => {
    test('创建HTTP客户端', () => {
      const customClient = createHttpClient({
        baseURL: 'https://custom.com'
      })
      
      expect(customClient).toBeInstanceOf(HttpClient)
    })
  })

  describe('请求拦截器', () => {
    test('添加时间戳到GET请求', async () => {
      const mockResponse = { code: 200 }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse
      })

      await client.get('/test')
      
      const callUrl = (fetch as jest.Mock).mock.calls[0][0]
      expect(callUrl).toContain('_t=')
    })
  })
})
