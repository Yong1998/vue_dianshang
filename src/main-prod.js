import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入element-ui组件
// import './plugins/element.js'
// 导入 css全局样式
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 配置axios
import axios from 'axios'
// 导入 树形表格 vue-table-with-tree-grid
import Tree from 'vue-table-with-tree-grid'

// 导入富文本编辑器组件
import VueQuillEditor from 'vue-quill-editor'

// 导入 进度条 nprogress组件
import NProgress from 'nprogress'

// 配置基本请求路径
axios.defaults.baseURL = 'http://112.74.35.211:8888/api/private/v1/'
// 配置axios请求拦截
// 1.在发起 request 请求时 展示进度条  NProgress.start();
axios.interceptors.request.use(config => {
  NProgress.start()
  // console.log(config);
  // 在发送请求前 给Authorization添加token令牌
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须 return config
  return config
})
// 2.在响应 response 时 隐藏进度条  NProgress.done();
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

// 将axios全局挂载在Vue的原型对象上，this.$http就可以直接发起axios请求
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 将树形表格挂载在全局
Vue.component('tree-table', Tree)

// 自定义格式化时间全局过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)
  // 年
  const y = dt.getFullYear()
  // 月 月份加一
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  // 日
  const d = (dt.getDate() + '').padStart(2, '0')

  // 时分秒
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

// 全局定义富文本编辑器
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
