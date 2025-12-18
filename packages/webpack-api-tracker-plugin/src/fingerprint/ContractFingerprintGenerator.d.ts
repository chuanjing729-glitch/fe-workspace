import { ApiContract } from '../diff/SmartDiffEngine';
export declare class ContractFingerprintGenerator {
    generate(contract: ApiContract): string;
    private normalizeContract;
    private normalizeOperation;
    private normalizeParameter;
    private normalizeRequestBody;
    private normalizeResponses;
    private normalizeSchema;
    compare(fingerprint1: string, fingerprint2: string): boolean;
}
//# sourceMappingURL=ContractFingerprintGenerator.d.ts.map