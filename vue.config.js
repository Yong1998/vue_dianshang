// vue-cli 3.0 默认隐藏webpack的配置项
// 如需修改配置webpack 需要创建vue.config.js 文件

module.exports = {
  // 设置是否在开发环境下每次保存代码时都启用 eslint验证。
  lintOnSave: false,
  // 自定义打包入口 判断如果时开发模式 则用main-dev.js 入口  若为生产模式 则用main-prod.js入口
  chainWebpack: config => {
    // 生产模式
    config.when(process.env.NODE_ENV === 'production', config => {
      config
        .entry('app')
        .clear()
        .add('./src/main-prod.js')

      // 通过import语法导入的依赖包都会被打包到一个文件上，为防止单文件体积过大
      // 通过设置externals节点，来配置加载外部的CND资源，凡声明在节点的 依赖包都不回被打包
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })
      // 在index.html文件中 用于判断是生产模式
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })

    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config
        .entry('app')
        .clear()
        .add('./src/main-dev.js')

      // 在index.html文件中 用于判断是开发模式
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
}
