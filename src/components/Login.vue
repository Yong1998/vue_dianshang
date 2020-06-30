<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 登陆表单区域 -->
      <!-- ref引用，获取表单的实例对象 -->
      <el-form ref="loginFormRef" class="login_form" :model="loginForm" :rules="loginFormRules">
        <!-- 登陆用户 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 登陆密码 -->
        <el-form-item prop="password">
          <el-input
            type="password"
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
          ></el-input>
        </el-form-item>
        <!-- 登陆按钮 -->
        <el-form-item class="bts">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 绑定登陆表单数据
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          // 鼠标离开触发验证
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          // 鼠标离开触发验证
          { required: true, message: '请输入登陆密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '密码长度在 6 到 5 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 点击重置，触发重置方法
    resetLoginForm() {
      // this 指向当前组件
      // console.log(this);
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      // 实现表单预验证 符合验证规则返回true
      this.$refs.loginFormRef.validate(async valid => {
        // 如果为flase，则终止登陆
        if (!valid) return
        // 成功 发送axios请求返回一个promise对象
        const { data: res } = await this.$http.post('login', this.loginForm)
        // console.log(res);
        if (res.meta.status !== 200) return this.$message.error('登陆失败！')
        this.$message.success('恭喜！登陆成功')
        // 1.登陆成功后 token保存在客户端的 sessionStorage 中
        // 2.token 只应在当前网站打开期间生效，所以将 token 保存在 sessionStorage 中
        // console.log(res);
        window.sessionStorage.setItem('token', res.data.token)
        // 3.通过变编程式导航跳转到 /home 页面
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  width: 100%;
  background-color: #2b4b6b;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 130px;
    height: 130px;
    padding: 10px;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 50%;
    box-shadow: 0 0 10px #fff;
    img {
      height: 100%;
      width: 100%;
      border: 1px solid #eee;
      border-radius: 50%;
      background-color: #ccc;
    }
  }
}
.bts {
  display: flex;
  // 横轴右对齐
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>
