<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 添加角色区域 -->
      <el-row>
        <el-col :span="4">
          <el-button type="primary" @click="showAddRoleDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 扩展列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['db_bottom',i1 == 0 ? 'bd_top':'','vcentet']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- for循环嵌套渲染二级和三级列表权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 !== 0 ? 'bd_top' : '' ,'vcentet']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag type="warning">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--  for循环 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                      type="success"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号" width="50px"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <!-- 操作区域 -->
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 编辑 -->
            <el-button
              @click="showEditDailog(scope.row.id)"
              type="primary"
              icon="el-icon-edit"
              size="small"
            >编辑</el-button>
            <!-- 删除 -->
            <el-button
              @click="deleteRole(scope.row.id)"
              type="danger"
              icon="el-icon-delete"
              size="small"
            >删除</el-button>
            <!-- 角色分配 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="角色分配"
              placement="top"
              :enterable="false"
            >
              <el-button
                @click="showRigthsDialog(scope.row)"
                type="warning"
                icon="el-icon-setting"
                size="small"
              >权限分配</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 角色分配对话框 -->
    <el-dialog
      @close="rightsDialogClose"
      title="分配权限"
      :visible.sync="RightsDialogVisible"
      width="50%"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rigthsList"
        :props="TreeProps"
        show-checkbox
        default-expand-all
        node-key="id"
        :default-checked-keys="defaultKey"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="RightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRights">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色对话框 -->
    <el-dialog @close="addRoleDialogClose" title="提示" :visible.sync="addDialogVisible" width="50%">
      <!-- 添加表单区域 -->
      <el-form :model="addRoleForm" :rules="addRules" ref="addRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框-->
    <el-dialog title="提示" :visible.sync="editDialogVisible" width="50%">
      <!-- 编辑表单 -->
      <el-form :model="editRoleForm" :rules="editRules" ref="editRuleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 角色列表数据
      roleList: [],
      // 控制分配权限对话框的隐藏与显示
      RightsDialogVisible: false,
      // 角色权限数据
      rigthsList: [],
      // 树形控件的属性绑定
      TreeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认勾选的节点的 key 的数组
      defaultKey: [],
      // 点击分配权限 当前角色下的id
      NowRoleId: '',
      // 控制添加角色对话框的显示和隐藏
      addDialogVisible: false,
      // 添加角色表单数据
      addRoleForm: {
        // 角色名称
        roleName: '',
        // 角色描述
        roleDesc: ''
      },
      // 添加角色规则
      addRules: {
        roleName: [
          { required: true, message: '请输入角色名称', tirgger: 'blur' },
          { min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur' }
        ]
      },
      // 编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 编辑角色表单信息
      editRoleForm: {
        // 角色名称
        roleName: '',
        // 角色描述
        roleDesc: ''
      },
      // 添加角色规则
      editRules: {
        roleName: [
          { required: true, message: '请输入角色名称', tirgger: 'blur' },
          { min: 2, max: 6, message: '长度在 1 到 6 个字符', trigger: 'blur' }
        ]
      },
      // 点击编辑 当前角色下的id
      editRoleId: ''
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表数据
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('请求角色列表数据失败')
      }
      this.roleList = res.data
    },
    // 根据id删除指定权限
    async removeRightById(role, rightId) {
      // console.log(role, rightId)
      const isConfirm = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(isConfirm)
      // return
      if (isConfirm !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      this.$message.success('删除成功')
      // 更新角色权限数据
      role.children = res.data
    },
    // 分配权限对话框的显示与隐藏 获取权限数据
    async showRigthsDialog(role) {
      // 获取当前角色的id
      this.NowRoleId = role.id
      // 调用递归函数，获取三级权限的id值
      this.getNodeId(role, this.defaultKey)
      this.RightsDialogVisible = true
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败')
      }
      this.rigthsList = res.data
      console.log(res.data)
    },
    // 监听 分配角色对话框关闭
    rightsDialogClose() {
      // 对话框关闭时，重置defaultKey 防止存储的id值越来越多
      this.defaultKey = []
    },
    // 点击确定 发送角色授权请求
    async setRights() {
      // console.log(this.$refs.treeRef.getCheckedKeys())
      // getCheckedKeys() 选中节点的id值
      // getHalfCheckedKeys() 半选择节点的id值
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const keyStr = keys.join(',')
      // console.log(keyStr)
      // return
      // 发送授权请求
      const { data: res } = await this.$http.post('roles/' + this.NowRoleId + '/rights', { rids: keyStr })
      if (res.meta.status !== 200) {
        return this.$message.error('角色授权失败！')
      }
      this.$message.success('分配角色成功')
      // 关闭对话框
      this.RightsDialogVisible = false
      // 重新渲染页面
      this.getRoleList()
    },
    // 递归函数 获取该角色下的所有三级节点的权限id
    getNodeId(node, arr) {
      // 如果传入的节点不存在 children属性 则是三级节点
      if (!node.children) {
        // 将该节点的id值存储在数组
        return arr.push(node.id)
      }
      // 如果存在 则循环该数组
      node.children.forEach(item => {
        // 再次调用该方法筛选出三级节点 item 为循环的节点
        this.getNodeId(item, arr)
      })
    },
    // 监听 添加角色事件
    showAddRoleDialog() {
      this.addDialogVisible = true
    },
    // 点击确定 添加角色
    addRoles() {
      // 预验证
      this.$refs.addRoleFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) {
          return this.$message.error('请输入正确的角色名称')
        }
        // 发送添加角色请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败！')
        }
        this.$message.success('添加角色成功！')
        // 关闭对话框
        this.addDialogVisible = false
        // 更新页面数据
        this.getRoleList()
      })
    },
    // 监听 添加角色对话框关闭事件
    addRoleDialogClose() {
      // 关闭后重置对话框
      this.$refs.addRoleFormRef.resetFields()
    },
    // 点击编辑 打开编辑对话框
    async showEditDailog(id) {
      this.editRoleId = id
      this.editDialogVisible = true
      // 根据id查询角色信息
      const { data: res } = await this.$http.get('roles/' + id)
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error('获取角色信息失败！')
      // 成功
      this.editRoleForm = res.data
    },
    // 点击确定 修改角色
    editRole() {
      // 预验证
      this.$refs.editRuleFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return this.$message.error('请输入正确的角色名称')
        // 发送修改请求
        const { data: res } = await this.$http.put('roles/' + this.editRoleId, this.editRoleForm)
        if (res.meta.status !== 200) return this.$message.error('修改失败！')
        this.$message.success('更新成功！')
        // 关闭对话框
        this.editDialogVisible = false
        // 更新页面数据
        this.getRoleList()
      })
    },
    // 点击删除 删除角色
    async deleteRole(id) {
      const isConfirm = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (isConfirm !== 'confirm') return this.$message.info('已取消删除')
      // 发送删除请求
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('角色删除失败！')
      }
      this.$message.success('角色删除成功！')
      // 更新页面数据
      this.getRoleList()
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.db_bottom {
  border-bottom: 1px solid #eee;
}
.bd_top {
  border-top: solid 1px #eee;
}
.vcentet {
  display: flex;
  align-items: center;
}
</style>