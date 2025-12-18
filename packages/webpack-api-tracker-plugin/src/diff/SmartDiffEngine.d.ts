export interface ApiEndpoint {
    path: string;
    method: string;
    operationId?: string;
    summary?: string;
    description?: string;
    parameters?: any[];
    requestBody?: any;
    responses?: any;
    tags?: string[];
}
export interface ApiContract {
    openapi?: string;
    info?: any;
    servers?: any[];
    paths: Record<string, Record<string, ApiEndpoint>>;
    components?: any;
}
export interface DiffResult {
    added: ApiChange[];
    removed: ApiChange[];
    modified: ApiChange[];
}
export interface ApiChange {
    path: string;
    method: string;
    type: 'added' | 'removed' | 'modified';
    details: any;
}
export declare class SmartDiffEngine {
    diff(oldContract: ApiContract, newContract: ApiContract): DiffResult;
    private addPathChanges;
    private comparePathItems;
    private compareOperations;
    generateReport(diffResult: DiffResult): string;
}
//# sourceMappingURL=SmartDiffEngine.d.ts.map