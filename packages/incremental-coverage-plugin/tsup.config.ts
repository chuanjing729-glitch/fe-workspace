import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        index: 'src/index.ts',
        webpack: 'src/webpack.ts',
        vite: 'src/vite.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    splitting: false,
    sourcemap: true,
    external: ['webpack', 'vite', 'webpack-sources'],
});
