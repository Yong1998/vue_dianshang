<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 搜索和添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryList.query" clearable @clear="getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="序号" width="50px"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <!-- 状态 -->
        <el-table-column label="状态">
          <!-- 
            作用域插槽   
            slot-scope属性 
            scope.row 可以获得该行的用户数据
          -->
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-switch v-model="scope.row.mg_state" @change="stateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 编辑 -->
            <el-button
              type="primary"
              @click="showEditDialog(scope.row.id)"
              icon="el-icon-edit"
              size="mini"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              @click="deleteUser(scope.row.id)"
              icon="el-icon-delete"
              size="mini"
            ></el-button>
            <!-- 角色分配 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="角色分配"
              placement="top"
              :enterable="false"
            >
              <el-button
                @click="setRole(scope.row)"
                type="warning"
                icon="el-icon-setting"
                size="mini"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryList.pagenum"
        :page-sizes="[1,5,10,15]"
        :page-size="queryList.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 添加用户对话框 -->
      <!-- 
        close 当对话框关闭触发这个事件
      -->
      <el-dialog title="添加用户" @close="dialogClose" :visible.sync="addDialogVisible" width="50%">
        <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑用户对话框 -->
      <el-dialog title="修改用户" @close="editClose" :visible.sync="editDialogVisible" width="50%">
        <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机号" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUser">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>

    <!-- 分配角色对话框 -->
    <el-dialog
      @close="setRoleDialogClose"
      title="角色分配"
      :visible.sync="setRoleDialogVisible"
      width="50%"
    >
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>
          分配角色：
          <!-- 选择器 -->
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 自定义邮箱验证规则
    var checkEamil = (rule, value, cb) => {
      const checkEamil = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      // 验证邮箱是否合法
      if (checkEamil.test(value)) {
        return cb()
      }
      // 验证通过执行回调函数
      cb(new Error('邮箱不符合验证规则！'))
    }
    // 自定义手机验证规则
    var checkMobile = (rule, value, cb) => {
      const checkMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (checkMobile.test(value)) {
        return cb()
      }
      // 验证通过执行回调函数
      cb(new Error('手机号码不符合验证规则！'))
    }

    return {
      // get请求参数
      queryList: {
        // 查询参数
        query: '',
        // 当前页码
        pagenum: 1,
        //每页显示条数
        pagesize: 5
      },
      userList: [],
      total: 0,
      // 控制添加对话框的显示和隐藏
      addDialogVisible: false,
      // 添加对话框表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加对话框的表单验证规则
      addRules: {
        // 用户名验证
        username: [
          { required: true, message: '请输入用户名', tirgger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', tirgger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '密码长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', tirgger: 'blur' },
          { validator: checkEamil, tirgger: 'blue' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', tirgger: 'blur' },
          { validator: checkMobile, tirgger: 'blue' }
        ]
      },
      // 控制编辑对话框显示和隐藏
      editDialogVisible: false,
      // 编辑对话框表单数据
      editForm: {},
      // 编辑对话框表单验证规则
      editRules: {
        email: [
          { required: true, message: '请输入邮箱', tirgger: 'blur' },
          { validator: checkEamil, tirgger: 'blue' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', tirgger: 'blur' },
          { validator: checkMobile, tirgger: 'blue' }
        ]
      },
      // 控制角色分配对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 角色分配当前用户信息
      userInfo: {},
      // 所有角色列表
      roleList: [],
      // 已选择的角色id
      selectRoleId: ''
    }
  },
  // 生命周期 页面一打开就执行
  created() {
    this.getUsersList()
  },
  methods: {
    // 获取数据
    async getUsersList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryList
      })
      console.log(res)
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据列表失败')
      }
      // 成功
      this.userList = res.data.users
      this.total = res.data.total
    },
    // switch状态发生改变时
    async stateChange(userInfo) {
      // console.log(userInfo)
      // 发送修改用户状态请求
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        // 保证更新状态失败的时候，原状态不变
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新状态失败！')
      }
      this.$message.success('更新成功！')
    },
    // 监听 每页显示条数
    handleSizeChange(newSize) {
      console.log(newSize)
      this.queryList.pagesize = newSize
      // 再次渲染数据
      this.getUsersList()
    },
    // 监听 当前页码
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryList.pagenum = newPage
      // 再次渲染数据
      this.getUsersList()
    },
    // 监听添加用户对话框关闭事件
    dialogClose() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户对话框进行预验证
    addUser() {
      // 预验证 返回 布尔值
      this.$refs.addFormRef.validate(async valid => {
        // console.log(vaild)
        // 验证不通过，终止提交表单
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        // console.log(res);
        if (res.meta.status !== 201) return this.$message.error('添加用户失败!')
        this.$message.success('添加用户成功！')
        // 关闭对话框
        this.addDialogVisible = false
        // 再次渲染数据
        this.getUsersList()
      })
    },
    // 修改用户对话框
    async showEditDialog(id) {
      this.editDialogVisible = true
      // console.log(id)
      // 根据id查询用户
      const { data: res } = await this.$http.get('users/' + id)
      console.log(res)
      if (res.meta.status !== 200) return this.$message.error('查询失败')
      // 成功将数据渲染在对话框
      this.editForm = res.data
    },
    // 监听用户编辑对话框关闭重置对话框
    editClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑用户对话框进行预验证
    editUser() {
      // 预验证 返回 布尔值
      this.$refs.editFormRef.validate(async vaild => {
        // console.log(this.editForm, 123)
        // return
        // 验证不通过，终止提交表单
        if (!vaild) return
        // 发送更新请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          this.editForm
        )
        // console.log(res)
        // return
        if (res.meta.status !== 200) return this.$message.error('更新用户失败!')
        this.$message.success('更新用户成功！')
        // 关闭对话框
        this.editDialogVisible = false
        // 再次渲染数据
        this.getUsersList()
      })
    },
    // 删除用户
    async deleteUser(id) {
      // console.log(id)
      const confirmRes = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // console.log(res)  返回 cancel 或 confirm 字符串
      if (confirmRes !== 'confirm') return this.$message.info('已取消删除')
      // 发送删除请求
      const { data: res } = await this.$http.delete('users/' + id)
      // console.log(res)
      // 请求失败
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      // 请求成功
      this.$message.success('删除用户成功！')
      // 再次渲染数据
      this.getUsersList()
    },
    async setRole(role) {
      // 拿到当前用户的数据
      this.userInfo = role
      // 拿到所有角色数据
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data

      this.setRoleDialogVisible = true
    },
    // 点击确定 分配角色
    async saveRole() {
      // 如果角色id为空
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }

      console.log(this.selectRoleId)
      const { data: res } = await this.$http.put(
        'users/' + this.userInfo.id + '/role',
        { rid: this.selectRoleId }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败！')
      }
      this.$message.success('分配角色为成功！')

      // 刷新页面数据
      this.getUsersList()
      // 关闭对话框
      this.setRoleDialogVisible = false
    },
    // 监听 对话框关闭事件
    setRoleDialogClose() {
      this.selectRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
</style>