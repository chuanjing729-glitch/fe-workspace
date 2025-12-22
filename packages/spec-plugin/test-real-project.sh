#!/bin/bash

# 真实项目集成测试脚本
# 在 mall-portal-front 项目中测试插件的实际表现

echo "========================================="
echo "真实项目集成测试"
echo "========================================="
echo ""

# 项目路径
REAL_PROJECT="/Users/chuanjiing.li/Documents/51jbs/project/mall-portal-front"
PLUGIN_PATH="/Users/chuanjiing.li/Documents/51jbs/project/fe-efficiency/packages/spec-plugin"

# 检查项目是否存在
if [ ! -d "$REAL_PROJECT" ]; then
  echo "❌ 错误: 项目不存在: $REAL_PROJECT"
  exit 1
fi

echo "📁 测试项目: $REAL_PROJECT"
echo "🔧 插件路径: $PLUGIN_PATH"
echo ""

# 步骤 1: 构建插件
echo "步骤 1/5: 构建插件..."
cd "$PLUGIN_PATH"
npm run build
if [ $? -ne 0 ]; then
  echo "❌ 插件构建失败"
  exit 1
fi
echo "✅ 插件构建成功"
echo ""

# 步骤 2: 在真实项目中链接插件
echo "步骤 2/5: 链接插件到项目..."
cd "$REAL_PROJECT"

# 检查是否已有 node_modules
if [ ! -d "node_modules" ]; then
  echo "⚠️  项目未安装依赖，请先运行 npm install"
  echo "   cd $REAL_PROJECT && npm install"
  exit 1
fi

# 创建软链接
npm link "$PLUGIN_PATH" 2>/dev/null || {
  echo "⚠️  链接失败，尝试直接复制..."
  mkdir -p node_modules/@fe-efficiency
  cp -r "$PLUGIN_PATH" node_modules/@51jbs/spec-plugin
}
echo "✅ 插件链接成功"
echo ""

# 步骤 3: 备份原配置
echo "步骤 3/5: 备份配置文件..."
if [ -f "webpack.config.js" ]; then
  cp webpack.config.js webpack.config.js.backup
  echo "✅ 已备份 webpack.config.js"
else
  echo "⚠️  未找到 webpack.config.js，跳过备份"
fi
echo ""

# 步骤 4: 生成测试配置
echo "步骤 4/5: 生成测试配置..."
cat > webpack.spec-test.js << 'EOF'
// Spec Plugin (工程规范助手)测试配置
const SpecPlugin = require('@51jbs/spec-plugin')

module.exports = {
  plugins: [
    new SpecPlugin({
      mode: 'incremental',
      severity: 'normal',
      rules: {
        vue: true,
        javascript: true,
        naming: true,
        security: true,
        performance: true
      }
    })
  ]
}
EOF
echo "✅ 已生成测试配置: webpack.spec-test.js"
echo ""

# 步骤 5: 提示手动测试步骤
echo "步骤 5/5: 手动测试步骤"
echo "========================================="
echo ""
echo "请按以下步骤进行测试:"
echo ""
echo "1️⃣  合并测试配置到主配置:"
echo "   编辑 webpack.config.js，添加插件配置"
echo "   或者使用环境变量: WEBPACK_CONFIG=webpack.spec-test.js"
echo ""
echo "2️⃣  执行构建（无插件 - 基准测试）:"
echo "   cd $REAL_PROJECT"
echo "   time npm run build"
echo "   记录构建时间和内存占用"
echo ""
echo "3️⃣  执行构建（有插件 - 性能测试）:"
echo "   cd $REAL_PROJECT"
echo "   # 修改 webpack.config.js 启用插件"
echo "   time npm run build"
echo "   记录构建时间和内存占用"
echo ""
echo "4️⃣  查看检测报告:"
echo "   cat .spec-cache/report.html"
echo "   或在浏览器中打开查看"
echo ""
echo "5️⃣  评估指标:"
echo "   - 构建时间增加 < 10%？"
echo "   - 检测到的问题是否准确？"
echo "   - 是否有误报？"
echo "   - 报告是否清晰？"
echo ""
echo "6️⃣  恢复原配置:"
echo "   mv webpack.config.js.backup webpack.config.js"
echo ""
echo "========================================="
echo "✅ 准备工作完成！"
echo ""
echo "📝 测试清单:"
echo "  [ ] 基准构建时间: _____ms"
echo "  [ ] 插件构建时间: _____ms"
echo "  [ ] 时间增加百分比: _____%"
echo "  [ ] 检测到问题数: _____个"
echo "  [ ] 误报数: _____个"
echo "  [ ] 漏报数: _____个"
echo "  [ ] 报告质量评分: _____/10"
echo ""
echo "完成测试后，请在评估报告中填写结果。"
