'use strict'
const isProductoin = process.env.NODE_ENV === 'production'
const outputName = 'xdf-report-auth-web'
const path = require('path')
const resolve = dir => path.join(__dirname, dir)
// 首先需要引入filemanager-webpack-plugin插件
const FileManagerPlugin = require('filemanager-webpack-plugin')

module.exports = {
  runtimeCompiler: true,
  publicPath: './',
  outputDir: `./${outputName}/${outputName}`,
  lintOnSave: false,
  //   单点登录所需配置
  devServer: {
    port: 80,
    disableHostCheck: true
  },
  css: {
    loaderOptions: {
      // 给 sass-loader 传递选项
      scss: {
        // @/ 是 src/ 的别名
        // 所以这里假设你有 `src/variables.scss` 这个文件
        prependData: '@import "~@/styles/variables.scss";'
      }
    }
  },
  // 打包时不生成.map文件
  productionSourceMap: false,
  configureWebpack: config => {
    if (isProductoin) {
      const plugins = [
        new FileManagerPlugin({ // 初始化 filemanager-webpack-plugin 插件实例
          onEnd: {
            delete: [ // 首先需要删除项目根目录下的dist.zip
              `./${outputName}.zip`
            ],
            archive: [ // 然后我们选择dist文件夹将之打包成dist.zip并放在根目录
              {
                source: `./${outputName}`,
                destination: `./${outputName}.zip`
              }
            ]
          }
        })
      ]
      config.plugins = [
        ...config.plugins,
        ...plugins
      ]
    }
  },
  chainWebpack(config) {
    // it can improve the speed of the first screen, it is recommended to turn on preload
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // to ignore runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ])
    
    // when there are many pages, it will cause too many meaningless requests
    config.plugins.delete('prefetch')

    config.when(isProductoin, config => {
      config
        .plugin('ScriptExtHtmlWebpackPlugin')
        .after('html')
        .use('script-ext-html-webpack-plugin', [{
        // `runtime` must same as runtimeChunk name. default is `runtime`
          inline: /runtime\..*\.js$/
        }])
        .end()
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial' // only package third parties that are initially dependent
          },
          elementUI: {
            name: 'chunk-elementUI', // split elementUI into a single package
            priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true
          }
          // vendor: {
          //   test: /node_modules/,
          //   chunks: 'all',
          //   name: 'vendor',
          //   priority: 2,
          //   enforce: true // 猜测因优化机制入口文件包和同步包不让拆分过多，强制将剩余依赖分包
          // },
          // element: {
          //   test: /element-ui/,
          //   chunks: 'all',
          //   name: 'element',
          //   priority: 3
          // },
          // vxeTable: {
          //   test: /(vxe-table|xe-utils)/,
          //   chunks: 'all',
          //   name: 'vxeTable',
          //   priority: 3
          // },
          // echarts: { // 异步加载echarts包
          //   test: /(echarts|zrender)/,
          //   priority: 3, // 高于async-commons优先级
          //   name: 'echarts',
          //   chunks: 'async'
          // },
          // commons: {
          //   test: /[\\/]src[\\/]components[\\/]/,
          //   name: 'commons',
          //   minSize: 30000,
          //   minChunks: 3,
          //   chunks: 'initial',
          //   priority: -1,
          //   reuseExistingChunk: true // 这个配置允许我们使用已经存在的代码块
          // }
        }
      })
    })

    // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
    config.optimization.runtimeChunk('single')
  }
}
