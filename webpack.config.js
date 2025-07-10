const { override, adjustStyleLoaders } = require('customize-cra');

module.exports = override(
  // 调整样式加载器配置
  adjustStyleLoaders(({ use }) => {
    // 找到sass-loader
    const sassLoader = use.find(
      (loader) => loader.loader && loader.loader.includes('sass-loader')
    );

    // 如果找到sass-loader，配置使用现代API
    if (sassLoader) {
      if (!sassLoader.options) {
        sassLoader.options = {};
      }

      // 使用现代API（推荐的长期解决方案）
      sassLoader.options.api = 'modern-compiler';
    }
  })
);