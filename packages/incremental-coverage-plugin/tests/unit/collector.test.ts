import { describe, it, expect, beforeEach } from 'vitest';
import { CoverageCollector } from '../../src/collector';

describe('CoverageCollector', () => {
    let collector: CoverageCollector;

    beforeEach(() => {
        collector = new CoverageCollector();
    });

    it('should merge new coverage data correctly', () => {
        const data1 = {
            'file1.ts': {
                path: 'file1.ts',
                s: { '0': 1 },
                f: { '0': 0 },
                b: { '0': [1, 0] },
                statementMap: {},
                fnMap: {},
                branchMap: {}
            }
        };

        const data2 = {
            'file1.ts': {
                path: 'file1.ts',
                s: { '0': 2 },
                f: { '0': 1 },
                b: { '0': [0, 1] },
                statementMap: {},
                fnMap: {},
                branchMap: {}
            }
        };

        collector.merge(data1 as any);
        const result = collector.merge(data2 as any);

        expect(result['file1.ts'].s['0']).toBe(3);
        expect(result['file1.ts'].f['0']).toBe(1);
        expect(result['file1.ts'].b['0']).toEqual([1, 1]);
    });

    it('should handle new files in merge', () => {
        const data1 = { 'file1.ts': { s: { '0': 1 }, f: {}, b: {} } };
        const data2 = { 'file2.ts': { s: { '0': 5 }, f: {}, b: {} } };

        collector.merge(data1 as any);
        const result = collector.merge(data2 as any);

        expect(Object.keys(result)).toHaveLength(2);
        expect(result['file2.ts'].s['0']).toBe(5);
    });

    it('should reset data properly', () => {
        collector.merge({ 'file1.ts': { s: { '0': 1 }, f: {}, b: {} } } as any);
        collector.reset();
        expect(collector.getCoverage()).toEqual({});
    });
});
