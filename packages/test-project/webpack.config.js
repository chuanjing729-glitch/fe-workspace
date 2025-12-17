const path = require("path");
const SpecPlugin = require("@51jbs/webpack-spec-plugin");

console.log(SpecPlugin);
module.exports = {
  mode: "development",
  entry: "./src/utils/ApiClient.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  plugins: [
    new SpecPlugin({
      mode: "full", // 全量检查测试
      severity: "normal",
      rules: {
        naming: true,
        comments: true,
        performance: true,
      },
      performanceBudget: {
        maxImageSize: 500,
        maxJsSize: 300,
        maxCssSize: 100,
        maxFontSize: 200,
      },
      htmlReport: true, // 启用 HTML 报告
      reportPath: "spec-report.html",
      rootDir: __dirname,
      exclude: ["**/node_modules/**", "**/dist/**"],
    }),
  ],
};
