// 路由模块
import Vue from 'vue'
import VueRouter from 'vue-router'


// 导入login组件 
// import Login from '../components/Login.vue'
const Login = () => import(/* webpackChunkName: "Login-Home-Welcome" */ '../components/Login.vue')
// 导入home组件
// import Home from '../components/Home.vue'
const Home = () => import(/* webpackChunkName: "Login-Home-Welcome" */ '../components/Home.vue')
// 导入 welcome子组件
// import Welcome from '../components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "Login-Home-Welcome" */ '../components/Welcome.vue')


// 导入用户列表子组件
// import Users from '../components/user/Users.vue'
const Users = () => import(/* webpackChunkName: "Users-Rights-Roles" */ '../components/user/Users.vue')
// 导入权限列表组件
// import Rights from '../components/rights/rights.vue'
const Rights = () => import(/* webpackChunkName: "Users-Rights-Roles" */ '../components/rights/rights.vue')
// 导入角色列表组件
// import Roles from '../components/rights/roles.vue'
const Roles = () => import(/* webpackChunkName: "Users-Rights-Roles" */ '../components/rights/roles.vue')


// 导入商品分类组件
// import Cate from '../components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "Cate-Params" */ '../components/goods/Cate.vue')
// 导入分类参数组件
// import Params from '../components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "Cate-Params" */ '../components/goods/Params.vue')


// 导入商品列表组件
// import List from '../components/goods/List.vue'
const List = () => import(/* webpackChunkName: "List-Add" */ '../components/goods/List.vue')
// 导入商品列表-添加商品组件
// import Add from '../components/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "List-Add" */ '../components/goods/Add.vue')


// 导入订单管理组件
// import Order from '../components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "Order-Reports" */ '../components/order/Order.vue')
// 导入数据统计组件
// import Reports from '../components/report/Report.vue'
const Reports = () => import(/* webpackChunkName: "Order-Reports" */ '../components/report/Report.vue')


Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home', component: Home, redirect: './welcome', children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Reports },
    ]
  }
]

const router = new VueRouter({
  routes
})
// 实现导航守卫（在没有token时，不允许进入别的页面）
router.beforeEach((to, from, next) => {
  // to 表示将要访问的路径
  // from 表示从那个路径跳转而来
  // next() 表示放行 next('/login') 表示强制跳转至登陆页面
  // 1.如果登陆路径为/login 放行
  if (to.path === '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  // 如果tokenStr不存在，强制跳转至登陆页面
  if (!tokenStr) return next('/login');
  // 存在放行
  next();

})
export default router
