
import * as fs from 'fs';
import * as path from 'path';
import { AnalysisService } from '../src/services/analysis.service';
import { FileStorage } from '../src/infra/storage';

// Mock fs and storage
jest.mock('fs');
jest.mock('../src/infra/storage');

describe('AnalysisService', () => {
    let analysisService: AnalysisService;
    let mockStorage: jest.Mocked<FileStorage>;

    beforeEach(() => {
        mockStorage = new FileStorage('/tmp', 'test') as any;
        mockStorage.load = jest.fn().mockReturnValue({});
        mockStorage.save = jest.fn();

        analysisService = new AnalysisService('/project', mockStorage);
    });

    it('should compute hash correctly', () => {
        // Access private method via any
        const hash = (analysisService as any).computeHash('content');
        expect(hash).toBeDefined();
        expect(hash.length).toBeGreaterThan(0);
    });

    it('should resolve local paths', () => {
        // Mock fs.existsSync to return true
        (fs.existsSync as jest.Mock).mockReturnValue(true);

        const resolved = (analysisService as any).resolvePath('/project/src/a.ts', './b');
        expect(resolved).toContain('/project/src/b');
    });

    it('should resolve alias paths', () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);

        const resolved = (analysisService as any).resolvePath('/project/src/a.ts', '@/utils/c');
        expect(resolved).toContain('/project/src/utils/c');
    });
});
