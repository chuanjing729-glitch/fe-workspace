import * as fs from 'fs';
import * as path from 'path';

/**
 * 简单的文件存储服务
 * 用于持久化缓存数据
 */
export class FileStorage {
    private storageDir: string;

    constructor(baseDir: string, namespace: string) {
        this.storageDir = path.join(baseDir, namespace);
        this.ensureDir();
    }

    private ensureDir() {
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true });
        }
    }

    /**
     * 保存数据到 JSON 文件
     */
    save(key: string, data: any): void {
        try {
            const filePath = path.join(this.storageDir, `${key}.json`);
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.warn(`[FileStorage] 保存失败 ${key}:`, error);
        }
    }

    /**
     * 读取 JSON 文件数据
     */
    load<T>(key: string): T | null {
        try {
            const filePath = path.join(this.storageDir, `${key}.json`);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                return JSON.parse(content) as T;
            }
        } catch (error) {
            console.warn(`[FileStorage] 读取失败 ${key}:`, error);
        }
        return null;
    }

    /**
     * 检查文件是否存在
     */
    has(key: string): boolean {
        return fs.existsSync(path.join(this.storageDir, `${key}.json`));
    }
}
