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
    shims: true,
    target: 'node14',
    noExternal: [
        'simple-git',
        'istanbul-diff',
        'unplugin',
        'babel-plugin-istanbul',
        'istanbul-lib-coverage',
        'istanbul-lib-report',
        'istanbul-reports'
    ],
    external: ['webpack', 'vite', 'webpack-sources'],
});
