import { ApiTrackerPluginOptions } from '../types';
export declare class CoverageCollaborationManager {
    private readonly options;
    constructor(options: ApiTrackerPluginOptions);
    notifyApiChange(changeInfo: any): Promise<void>;
    isCoveragePluginAvailable(): boolean;
    getCoveragePluginConfig(): Promise<any>;
    sendApiChangeData(changeData: any): Promise<void>;
}
//# sourceMappingURL=CoverageCollaborationManager.d.ts.map