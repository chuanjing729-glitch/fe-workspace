import { describe, it, expect } from 'vitest';
import { parseDiff } from '../../src/git';

describe('Git Diff Parser', () => {
    it('should parse simple single hunk diff correctly', () => {
        const diffText = [
            '@@ -10,3 +10,4 @@',
            ' context',
            '-old line',
            '+new line 1',
            '+new line 2'
        ].join('\n');

        const { additions, deletions } = parseDiff(diffText);

        // Context line (10) -> currentLine 11
        // -old line (11) -> deletions includes 11, currentLine remains 11
        // +new line 1 (11) -> additions includes 11, currentLine becomes 12
        // +new line 2 (12) -> additions includes 12, currentLine becomes 13
        expect(additions).toEqual([11, 12]);
        expect(deletions).toEqual([11]);
    });

    it('should handle multiple hunks in one file', () => {
        const diffText = [
            '@@ -1,2 +1,2 @@',
            ' line 1',
            '-old line 2',
            '+new line 2',
            '@@ -10,1 +10,1 @@',
            '-old line 10',
            '+new line 10',
            '+new line 11',
            '+new line 12'
        ].join('\n');

        const { additions } = parseDiff(diffText);

        // Hunk 1: starts at 1. line 1 context. line 2 is addition.
        // Hunk 2: starts at 10. line 10, 11, 12 are additions.
        expect(additions).toEqual([2, 10, 11, 12]);
    });

    it('should skip file headers and metadata', () => {
        const diffText = [
            'diff --git a/src/index.ts b/src/index.ts',
            'index e69de29..d00491f 100644',
            '--- a/src/index.ts',
            '+++ b/src/index.ts',
            '@@ -1,1 +1,2 @@',
            '+import path from "path";',
            ' export const a = 1;'
        ].join('\n');

        const { additions } = parseDiff(diffText);
        expect(additions).toEqual([1]);
    });

    it('should handle empty diff', () => {
        const { additions, deletions } = parseDiff('');
        expect(additions).toEqual([]);
        expect(deletions).toEqual([]);
    });

    it('should handle diff with only deletions', () => {
        const diffText = [
            '@@ -5,2 +5,0 @@',
            '-line 5',
            '-line 6'
        ].join('\n');

        const { additions, deletions } = parseDiff(diffText);
        expect(additions).toEqual([]);
        expect(deletions).toEqual([5, 5]); // Deletions happen at the same "new" position
    });

    it('should handle consecutive hunks without context between them', () => {
        const diffText = [
            '@@ -1,1 +1,1 @@',
            '-a',
            '+b',
            '@@ -2,1 +2,2 @@',
            '-c',
            '+d',
            '+e'
        ].join('\n');

        const { additions } = parseDiff(diffText);
        expect(additions).toEqual([1, 2, 3]);
    });
});
