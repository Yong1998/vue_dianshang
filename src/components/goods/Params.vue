<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 警告区域 -->
      <el-row>
        <el-col>
          <el-alert :closable="false" show-icon title="注意：只允许为第三级分类设置相关参数" type="warning"></el-alert>
        </el-col>
      </el-row>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择器区域 -->
          <span>
            <el-cascader
              ref="cascaderRef"
              expand-trigger="hover"
              :options="CateList"
              v-model="selectCateKeys"
              @change="selectChange"
              :props="cascaderProps"
              clearable
              change-on-select
            ></el-cascader>
          </span>
        </el-col>
      </el-row>

      <!-- Tabs页签区域 -->
      <el-tabs v-model="selectActiveName" @tab-click="selectClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            size="mini"
            @click="showAddDialog"
          >添加参数</el-button>

          <!-- 动态参数表格 -->
          <el-table :data="manyCateList" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 参数 -->
                <el-tag
                  closable
                  @close="removeVals(i, scope.row)"
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                >{{ item }}</el-tag>
                <!-- 添加新参数 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="$event.target.blur"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 序号 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="动态参数" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            :disabled="isBtnDisabled"
            size="mini"
            @click="showAddDialog"
          >添加属性</el-button>

          <!-- 静态属性表格 -->
          <el-table :data="onlyCateList" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 参数 -->
                <el-tag
                  closable
                  @close="removeVals(i, scope.row)"
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                >{{ item }}</el-tag>
                <!-- 添加新参数 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="$event.target.blur"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="静态属性" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数/属性的对话框 -->
    <el-dialog
      @close="addDialogClose"
      :title="'添加' + textTitle"
      :visible.sync="addDialog"
      width="50%"
    >
      <!-- 表单区域 -->
      <el-form :model="addParamsForm" :rules="addRules" ref="addParamsFormRef" label-width="100px">
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialog = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数/属性对话框 -->
    <el-dialog
      @close="editDialogClose"
      :title="'修改' + textTitle"
      :visible.sync="editDialog"
      width="50%"
    >
      <!-- 表单区域 -->
      <el-form
        :model="editParamsForm"
        :rules="editRules"
        ref="editParamsFormRef"
        label-width="100px"
      >
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类数据列表
      CateList: [],
      // 商品分类id
      selectCateKeys: [],
      // 配置 选择菜单的 props
      cascaderProps: {
        // 名称
        label: 'cat_name',
        // id
        value: 'cat_id',
        // 分类节点
        children: 'children'
      },
      // 选中页签的双向数据绑定 默认第一个页签选中
      selectActiveName: 'many',
      // many 动态参数面板数据
      manyCateList: [],
      // only 静态属性面板数据
      onlyCateList: [],
      // 控制参数/属性对话框的显示和隐藏
      addDialog: false,
      // 表单参数
      addParamsForm: {
        attr_name: ''
      },
      // 添加表单验证规则
      addRules: {
        attr_name: [{ required: true, message: '请填写内容', trigger: 'blur' }]
      },
      // 控制编辑参数/属性对话框的显示和隐藏
      editDialog: false,
      // 编辑表单参数
      editParamsForm: {}, // 添加表单验证规则
      editRules: {
        attr_name: [{ required: true, message: '请填写内容', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类数据列表失败！')
      // console.log(res)
      this.CateList = res.data
      console.log(this.CateList)
    },
    // 监听 选择商品分类id改变事件
    selectChange() {
      // console.log(this.selectCateKeys)
      this.getParamslist()
      // 选中后关闭下拉框
      this.$refs.cascaderRef.dropDownVisible = false
    },
    // 监听 选中当前页签事件
    selectClick() {
      // 选中不同页签时，请求的数据也不同
      this.getParamslist()
    },
    // 获取选中的三级分类数据
    async getParamslist() {
      // 如果选中不是三级分类 重置商品分类id
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = []
        // 清空表格数据
        this.manyCateList = []
        this.onlyCateList = []
        return
      }
      // 发起请求
      const { data: res } = await this.$http.get('categories/' + this.cateId + '/attributes', { params: { sel: this.selectActiveName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取三级分类列表失败！')
      }

      // 循环获取的参数，将 attr_vals(以空格的字符串) 转换为数组
      res.data.forEach(item => {
        // 如果 attr_vals 为空字符串 split 后会产生一个空格数组
        // 应该有个三元表达式
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制添加新参数文本框和按钮的切换 默认不显示
        item.inputVisible = false
        // 文本框的值 默认为空
        item.inputValue = ''
      })

      console.log(res.data)
      if (this.selectActiveName === 'many') {
        this.manyCateList = res.data
        return
      } else {
        this.onlyCateList = res.data
        return
      }
    },
    showAddDialog() {
      this.addDialog = true
    },
    // 监听 添加对话框关闭事件 重置表单内容
    addDialogClose() {
      this.$refs.addParamsFormRef.resetFields()
    },
    // 点击确定 发送添加参数请求
    addParams() {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addParamsForm.attr_name,
          attr_sel: this.selectActiveName
        })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功！')
        // 更新数据
        this.getParamslist()
        // 关闭对话框
        this.addDialog = false
      })
    },
    // 点击编辑 显示编辑对话框
    async showEditDialog(attrId) {
      // 根据 ID 查询参数
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
        params: {
          attr_sel: this.selectActiveName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败！')
      }
      this.editParamsForm = res.data
      this.editDialog = true
    },
    // 监听 修改对话框关闭事件 重置表单内容
    editDialogClose() {
      this.$refs.editParamsFormRef.resetFields()
    },
    // 点击确定 发送修改请求
    editParams() {
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`, {
          attr_name: this.editParamsForm.attr_name,
          attr_sel: this.selectActiveName
        })
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }
        this.$message.success('修改参数成功！')
        // 更新数据
        this.getParamslist()
        // 关闭对话框
        this.editDialog = false
      })
    },
    // 点击删除 发送删除请求
    async removeParams(attrId) {
      const isConfirm = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (isConfirm !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败！')
      }
      this.$message.success('已删除该参数')
      this.getParamslist()
    },
    // 切换文本框
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // 点击按钮时，有段时间还未渲染出文本框，此时直接调用this.saveTagInput是不存在input 所以会报错
      // $nextTick 当页面上元素被重新渲染后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 监听 添加参数文本框键盘抬起事件
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return 证明文本框输入了内容 后续处理
      // 将文本框的值存入attr_vals
      row.attr_vals.push(row.inputValue)
      // 关闭和请客文本框
      row.inputValue = ''
      row.inputVisible = false
      this.saveVals(row)
    },
    // 保存参数可选项至数据库
    async saveVals(row) {
      // 发送添加参数请求
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('更新参数失败！')
      }
      this.$message.success('成功修改参数可选项')
    },
    // 点击删除 删除参数可选项
    removeVals(i, row) {
      // 删除attr_vals数组中的第i项
      row.attr_vals.splice(i, 1)
      this.saveVals(row)
    }
  },
  // 计算属性
  computed: {
    // 判断 没选中了三级分类 添加属性按钮禁用 返回布尔值 true
    isBtnDisabled() {
      if (this.selectCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 返回三级分类id
    cateId() {
      if (this.selectCateKeys.length === 3) {
        // 返回数组的最后一项（三级分类id）
        return this.selectCateKeys[2]
      }
      return null
    },

    textTitle() {
      if (this.selectActiveName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>
<style lang="less">
.cat_opt {
  margin: 10px;
}
// 覆盖选择菜单的高度 需要去除 scope属性才能生效
.el-cascader-panel {
  height: 200px !important;
}
// 覆盖选择菜单的宽度
.el-cascader {
  width: 250px;
}
.el-cascader-panel .el-radio {
  width: 100%;
  height: 100%;
  z-index: 10;
  position: absolute;
  top: 10px;
  right: 10px;
}

.el-cascader-panel .el-radio__input {
  visibility: hidden;
}
/* 这个样式针对IE有用，不考虑IE的可以不用管*/
.el-cascader-panel .el-cascader-node__postfix {
  top: 10px;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 150px !important;
}
</style>
