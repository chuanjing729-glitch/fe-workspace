
import * as fs from 'fs';
import * as path from 'path';
import { ReportService } from '../src/services/report.service';
import { IGitService } from '../src/core/interfaces';

// Mock GitService
const mockGitService: IGitService = {
    getChangedFiles: jest.fn().mockResolvedValue([]),
    getFileDiff: jest.fn().mockResolvedValue([]),
    getGitInfo: jest.fn().mockResolvedValue({
        name: 'Test User',
        email: 'test@example.com',
        branch: 'test-branch',
        hash: 'abc1234'
    })
};

describe('ReportService Integration Test', () => {
    const outputDir = path.resolve(__dirname, '../.coverage_test');

    beforeAll(() => {
        if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
        }
    });

    afterAll(() => {
        if (fs.existsSync(outputDir)) {
            fs.rmSync(outputDir, { recursive: true, force: true });
        }
    });

    it('should generate report with environment info', async () => {
        const reportService = new ReportService(outputDir, {});

        await reportService.generate({
            gitService: mockGitService,
            incrementalResult: {
                overall: { coverageRate: 85, totalChangedLines: 10, coveredChangedLines: 8.5 },
                files: []
            },
            impactResult: {
                affectedPages: ['PageA'],
                affectedComponents: ['CompB'],
                impactLevel: 'low',
                propagationPaths: []
            }
        });

        const reportPath = path.join(outputDir, 'latest.html');
        expect(fs.existsSync(reportPath)).toBe(true);

        const content = fs.readFileSync(reportPath, 'utf-8');

        // Verify JSON injection
        expect(content).toContain('"gitEmail":"test@example.com"');
        expect(content).toContain('"cpu":');

        // Verify HTML placeholders (if any)
        // Since we rely on JS to render, we check if the JS logic is present
        expect(content).toContain('document.getElementById(\'env-git\')');
    });
});
