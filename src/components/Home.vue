<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 左侧栏区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleBtn">|||</div>
        <!-- 
           :collapse 是否开启菜单折叠 
           collapse-transition 是否开启折叠动画
           unique-opened 只打开一个子菜单
           router 开启router模式
           default-active 激活(高亮)当前菜单的index
        -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#ffd04b" unique-opened :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
          <!-- 一级菜单区域 -->
          <!-- :index API规定只接收字符串 不接受数值 -->
          <el-submenu :index="item.id + ''" :key="item.id" v-for="item in menulist">
            <!-- 一级菜单模板 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconlist[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" @click="saveNavstatus('/' + subItem.path)" :key="subItem.id" v-for="subItem in item.children">
              <!-- 二级菜单模板 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体区域 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      // 定义字体图标和id对应的数组
      iconlist: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-baobiao',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-shangpin'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  // 生命周期函数 页面一打开就获取数据
  created() {
    this.getMenuList()
    // 获取sessionStorage存储的地址
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      // 清除token
      window.sessionStorage.clear()
      // 强制跳转至登陆页面
      this.$router.push('./login')
    },
    async getMenuList() {
      // 请求数据
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      // 请求失败
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 成功
      this.menulist = res.data
      // console.log(this.menulist)
    },
    // 切换折叠按钮
    toggleBtn() {
      this.isCollapse = !this.isCollapse
    },
    saveNavstatus(activePath) {
      // 保存路径在sessionStorage
      window.sessionStorage.setItem('activePath', activePath)
      // 重新赋值
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  // 横轴上向左右两边对齐
  justify-content: space-between;
  // 纵轴上居中对齐
  align-items: center;
  // el-header 默认存在 padding
  padding-left: 0;
  font-size: 20px;
  color: #fff;
  > div {
    display: flex;
    align-items: center;
    > span {
      margin-left: 20px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: 0;
  }
  .toggle-button {
    background-color: #475163;
    font-size: 10px;
    height: 24px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
}
.el-main {
  background-color: #eee;
}
.iconfont {
  margin-right: 10px;
}
</style>
