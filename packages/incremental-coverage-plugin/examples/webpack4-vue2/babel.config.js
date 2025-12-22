module.exports = {
    presets: [
        ['@babel/preset-env', {
            modules: false,
            targets: { browsers: ['> 1%', 'last 2 versions'] }
        }]
    ]
    // 注意：不需要手动添加 babel-plugin-istanbul
    // 插件会自动注入
};
