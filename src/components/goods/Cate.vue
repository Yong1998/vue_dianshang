<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <!-- 添加分类 -->
      <el-row>
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        :data="goodsCateList"
        :columns="columns"
        :selection-type="false"
        border
        stripe
        :expand-type="false"
        class="fontSize martop"
        :show-row-hover="false"
        show-index
        index-text="#"
      >
        <!-- 是否有效模板 -->
        <template slot="youXiao" slot-scope="scope">
          <i
            class="el-icon-success"
            style="color: lightgreen;"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color: red;" v-else></i>
        </template>

        <!-- 排序 -->
        <template slot="level" slot-scope="scope">
          <el-tag type="success" size="mini" v-if="scope.row.cat_level == 0">等级一</el-tag>
          <el-tag type="danger" size="mini" v-else-if="scope.row.cat_level == 1">等级二</el-tag>
          <el-tag type="warning" size="mini" v-else>等级三</el-tag>
        </template>

        <!-- 操作模板 -->
        <template slot="caoZuo" slot-scope="scope">
          <!-- <pre>{{scope.row.cat_id}}</pre> -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5 ,10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog @close="addCateFormClose" title="添加分类" :visible.sync="AddDialogVisible" width="50%">
      <!-- 表单 -->
      <el-form
        :model="AddCateForm"
        :rules="AddCateFormRules"
        ref="AddCateFormFormRef"
        label-width="100px"
      >
        <!-- 分类名称 -->
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="AddCateForm.cat_name"></el-input>
        </el-form-item>
        <!-- 父级分类 -->
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            v-model="selectCateKeys"
            @change="keysChange"
            :props="cascaderProps"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="AddDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateKey">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog title="修改分类名称" :visible.sync="editDialogVisible" width="50%">
      <!-- 表单 -->
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 获取商品分类数据参数
      queryInfo: {
        type: 3,
        // 当前页码
        pagenum: 1,
        // 当前页显示多少数据
        pagesize: 5
      },
      // 总的数据条数
      total: 30,
      //   商品分类数据
      goodsCateList: [],
      // 表格各列配置
      columns: [
        // 商品分类
        {
          label: '分类名称',
          prop: 'cat_name',
          width: '400px'
        },
        // 是否有效
        {
          label: '是否有效',
          type: 'template',
          template: 'youXiao'
        },
        // 排序
        {
          label: '排序',
          type: 'template',
          template: 'level'
        },
        // 操作
        {
          label: '操作',
          type: 'template',
          template: 'caoZuo'
        }
      ],
      // 控制添加对话框的显示和隐藏
      AddDialogVisible: false,
      // 添加分类表单数据
      AddCateForm: {
        // 父级分类id ，如果要添加1级分类，则父分类Id应该设置为  `0`
        // 默认为0
        cat_pid: 0,
        // 分类名称
        cat_name: '',
        // 分类等级 `0`表示一级分类；`1`表示二级分类；`2`表示三级分类
        // 默认为0
        cat_level: 0
      },
      // 添加分类的验证规则
      AddCateFormRules: {
        cat_name: [
          { required: true, message: '请填写分类名称', tirgger: 'blur' }
        ]
      },
      // 父级分类数据
      parentCateList: [],
      // 选中的父级id
      selectCateKeys: [],
      // 配置级联选择器的 props
      cascaderProps: {
        // 名称
        label: 'cat_name',
        // id
        value: 'cat_id',
        // 分类节点
        children: 'children'
      },
      // 控制编辑对话框的显示和隐藏
      editDialogVisible: false,
      // 编辑分类名称表单
      editCateForm: {
        // 分类名称
        cat_name: ''
      },
      // 修改分类id
      cat_id: '',
      // 编辑分类名称验证规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请填写分类名称', tirgger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //   获取商品分类数据
    async getGoodsList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败！')
      }
      // 获取当前页显示的数据
      this.goodsCateList = res.data.result
      // 获取总的数据条数
      this.total = res.data.total

      // console.log(res)
    },
    // 监听 当前页显示多少数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 监听 当前页码
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // 显示添加分类对话框
    showAddDialog() {
      this.getParentCateList()
      this.AddDialogVisible = true
    },
    // 获取父级分类数据(前两级)
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }

      this.parentCateList = res.data
      // console.log(this.parentCateList)
    },
    // 监听 父级分类id的改变
    keysChange() {
      // console.log(this.selectCateKeys.length)
      // 当 selectCateKeys 数组的length大于0的时候，证明选中父级分类
      // 否则 则没选中
      if (this.selectCateKeys.length > 0) {
        // 将 AddCateForm 的 cat_pid 赋值 选中数组的最后一个id
        this.AddCateForm.cat_pid = this.selectCateKeys[
          this.selectCateKeys.length - 1
        ]
        // console.log('pid：' + this.AddCateForm.cat_pid)

        // 将 AddCateForm 的 cat_level 赋值 等级为数组的长度
        this.AddCateForm.cat_level = this.selectCateKeys.length
        return
      } else {
        // 没选中 cat_pid和cat_level 都为零
        // 父级分类id
        this.AddCateForm.cat_pid = 0
        // 分类等级
        this.AddCateForm.cat_level = 0
      }
    },
    // 点击确定
    addCateKey() {
      // 表单预验证
      this.$refs.AddCateFormFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填入分类名称')
        }
        const { data: res } = await this.$http.post(
          'categories',
          this.AddCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        console.log(res)

        this.getGoodsList()
        console.log(this.AddCateForm)
        this.AddDialogVisible = false
      })
    },
    // 监听 添加分类对话框关闭事件 重置表单数据
    addCateFormClose() {
      this.$refs.AddCateFormFormRef.resetFields()
      this.selectCateKeys = []
      this.AddCateForm.cat_level = 0
      this.AddCateForm.cat_pid = 0
    },
    // 显示编辑对话框
    async showEditDialog(id) {
      this.editDialogVisible = true
      // 赋值分类id
      this.cat_id = id
      // console.log(id)
      // return
      // 根据id获取当前分类的数据
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200)
        return this.$message.error('查询当前分类失败！')
      this.editCateForm.cat_name = res.data.cat_name
      this.editCateForm.cat_id = res.data.cat_id
    },
    // 提交编辑表单
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'categories/' + this.cat_id,
          this.editCateForm
        )
        if (res.meta.status !== 200)
          return this.$message.error('更新分类失败！')
        this.$message.success('更新成功！')
        // console.log('更新成功！')
        // 刷新页面
        this.getGoodsList()
        // 关闭对话框
        this.editDialogVisible = false
      })
    },
    // 删除分类
    async deleteCate(id) {
      const isConfirm = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // console.log(isConfirm)
      // return
      if (isConfirm !== 'confirm') return this.$message.info('已取消删除！')
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除失败！')
      this.$message.success('删除成功！')
      // 刷新页面
      this.getGoodsList()
    }
  }
}
</script>

<style lang="less">
.fontSize {
  font-size: 14px;
}
.el-cascader {
  width: 100%;
}
.el-cascader-panel {
  height: 200px !important;
}
.martop {
  margin-top: 15px;
}
</style>