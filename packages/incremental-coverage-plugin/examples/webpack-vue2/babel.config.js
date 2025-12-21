module.exports = {
    presets: [
        ['@babel/preset-env', { targets: { esmodules: true } }]
    ]
    // babel-plugin-istanbul 将由 WebpackIncrementalCoveragePlugin 自动注入
};
