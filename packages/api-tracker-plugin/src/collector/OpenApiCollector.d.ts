import { ApiTrackerPluginOptions } from '../types';
export declare class OpenApiCollector {
    private readonly options;
    constructor(options: ApiTrackerPluginOptions);
    collect(): Promise<any>;
    private validateOpenApiSpec;
    private extractApiInfo;
    private extractOperationInfo;
    private isHttpMethod;
}
//# sourceMappingURL=OpenApiCollector.d.ts.map