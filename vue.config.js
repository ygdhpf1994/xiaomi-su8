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
        },
        {
          test: /\.ts$/,
          use: 'ts-loader'
        }
      ]
    },
    devtool: 'source-map'
  },
  parallel: false
})
