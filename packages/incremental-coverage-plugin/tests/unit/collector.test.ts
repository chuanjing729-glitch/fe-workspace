import { describe, it, expect, beforeEach } from 'vitest';
import { CoverageCollector } from '../../src/collector';
import * as path from 'path';

describe('CoverageCollector', () => {
    let collector: CoverageCollector;
    const projectRoot = process.cwd();

    beforeEach(() => {
        collector = new CoverageCollector();
    });

    it('should merge new coverage data correctly', () => {
        const file1 = path.resolve(projectRoot, 'file1.ts');
        const data1 = {
            [file1]: {
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
            [file1]: {
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

        expect(result[file1].s['0']).toBe(3);
        expect(result[file1].f['0']).toBe(1);
        expect(result[file1].b['0']).toEqual([1, 1]);
    });

    it('should handle new files in merge', () => {
        const file1 = path.resolve(projectRoot, 'file1.ts');
        const file2 = path.resolve(projectRoot, 'file2.ts');
        const data1 = { [file1]: { s: { '0': 1 }, f: {}, b: {} } };
        const data2 = { [file2]: { s: { '0': 5 }, f: {}, b: {} } };

        collector.merge(data1 as any);
        const result = collector.merge(data2 as any);

        expect(Object.keys(result)).toHaveLength(2);
        expect(result[file2].s['0']).toBe(5);
    });

    it('should reset data properly', () => {
        const file1 = path.resolve(projectRoot, 'file1.ts');
        collector.merge({ [file1]: { s: { '0': 1 }, f: {}, b: {} } } as any);
        collector.reset();
        expect(collector.getCoverage()).toEqual({});
    });
});
