// 项目发布阶段需要使用的插件 babel-plugins-transform-remove-console
const prodPlugins = []
// 如果编译模式为 生产模式 则移除所有console
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}


module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 产品发布的时候的插件数组
    ...prodPlugins,
    // 配置路由懒加载
    '@babel/plugin-syntax-dynamic-import'
  ]
}
