import { describe, it, expect, vi } from 'vitest';
import { CoverageDiffer } from '../../src/differ';
import * as gitUtils from '../../src/git';

// Mock git utils
vi.mock('../../src/git', () => ({
    getGitDiff: vi.fn()
}));

describe('CoverageDiffer', () => {
    const options = {
        gitDiffBase: 'main',
        threshold: 80,
        autoSaveBaseline: false
    };

    it('should calculate incremental coverage correctly', async () => {
        const differ = new CoverageDiffer(options as any);

        // Mock Git diff: 1 file changed, lines 10 and 11 added
        (gitUtils.getGitDiff as any).mockResolvedValue({
            files: ['src/index.ts'],
            additions: { 'src/index.ts': [10, 11] },
            deletions: {}
        });

        // Mock current coverage: line 10 covered, line 11 not covered
        const currentCoverage = {
            'src/index.ts': {
                statementMap: {
                    '0': { start: { line: 10 }, end: { line: 10 } },
                    '1': { start: { line: 11 }, end: { line: 11 } }
                },
                s: { '0': 1, '1': 0 }, // 0: covered, 1: not covered
            }
        };

        const result = await differ.calculate(currentCoverage as any);

        expect(result.overall.totalLines).toBe(2);
        expect(result.overall.coveredLines).toBe(1);
        expect(result.overall.coverageRate).toBe(50);
        expect(result.files[0].uncoveredLines).toEqual([11]);
    });

    it('should handle multi-line statements', async () => {
        const differ = new CoverageDiffer(options as any);

        (gitUtils.getGitDiff as any).mockResolvedValue({
            files: ['src/long.ts'],
            additions: { 'src/long.ts': [5] },
            deletions: {}
        });

        const currentCoverage = {
            'src/long.ts': {
                statementMap: {
                    '0': { start: { line: 1 }, end: { line: 10 } }
                },
                s: { '0': 5 }, // Statement covered
            }
        };

        const result = await differ.calculate(currentCoverage as any);

        expect(result.overall.coverageRate).toBe(100);
        expect(result.files[0].uncoveredLines).toEqual([]);
    });

    it('should handle files with no coverage data', async () => {
        const differ = new CoverageDiffer(options as any);

        (gitUtils.getGitDiff as any).mockResolvedValue({
            files: ['src/new.ts'],
            additions: { 'src/new.ts': [1, 2, 3] },
            deletions: {}
        });

        const result = await differ.calculate({} as any);

        expect(result.overall.totalLines).toBe(3);
        expect(result.overall.coverageRate).toBe(0);
        expect(result.files[0].uncoveredLines).toEqual([1, 2, 3]);
    });
});
