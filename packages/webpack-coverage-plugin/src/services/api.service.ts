import { IApiService } from '../core/interfaces';
import { ApiInterface } from '../core/types';

/**
 * API 服务
 * 负责与 YAPI 等接口管理平台交互
 * 监控接口契约变更
 */
export class ApiService implements IApiService {
    private apiUrl: string;
    private token: string;
    private projectId: string;

    constructor(apiUrl: string, token: string, projectId: string) {
        this.apiUrl = apiUrl;
        this.token = token;
        this.projectId = projectId;
    }

    /**
     * 获取 API 列表
     */
    async fetchApiList(): Promise<ApiInterface[]> {
        if (!this.token) return [];

        // 模拟实现: 实际应使用 axios/fetch 请求 apiUrl
        console.log(`[ApiService] 获取项目 ${this.projectId} 的 API 列表`);
        return [
            {
                _id: 1,
                method: 'POST',
                path: '/api/user/login',
                title: '用户登录',
                up_time: Date.now()
            },
            {
                _id: 2,
                method: 'GET',
                path: '/api/user/info',
                title: '获取用户信息',
                up_time: Date.now()
            }
        ];
    }

    /**
     * 检查 API 变更
     */
    async checkApiChanges(currentApis: ApiInterface[]): Promise<any> {
        // 简单对比逻辑
        return {
            message: '暂无变更',
            diff: []
        };
    }
}
