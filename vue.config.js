const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    module: {
      rules: [
        // 其他规则...
        {
          test: /\.(hdr)$/,
          use: 'file-loader'
        }
      ]
    }
  }
})
