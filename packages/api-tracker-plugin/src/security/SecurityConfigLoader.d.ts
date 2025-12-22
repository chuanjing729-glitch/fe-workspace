import { ApiTrackerPluginOptions } from '../types';
export declare class SecurityConfigLoader {
    private readonly options;
    private readonly configPath;
    private config;
    constructor(options: ApiTrackerPluginOptions);
    load(): Promise<void>;
    save(): Promise<void>;
    get(key: string, defaultValue?: any): any;
    set(key: string, value: any): void;
    getConfig(): any;
    private createDefaultConfig;
    private getDefaultConfig;
}
//# sourceMappingURL=SecurityConfigLoader.d.ts.map