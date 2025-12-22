import { defineConfig } from 'vite';
import coverage from '../../src/vite';

export default defineConfig({
    plugins: [
        coverage({
            enabled: true,
            enableOverlay: true,
            enableImpactAnalysis: false // Simplify test deps
        })
    ]
});
