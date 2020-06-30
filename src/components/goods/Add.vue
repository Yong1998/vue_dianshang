<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 警告区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>

      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeStep - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 表单区域 -->
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-position="top" label-width="100px">
        <!-- tab 标签页-->
        <el-tabs v-model="activeStep" @tab-click="tabsClick" :tab-position="'left'" :before-leave="beforeLeave">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器只允许绑定数组 -->
              <el-cascader expandTrigger="hover" v-model="addForm.goods_cat" :options="cateList" :props="cascaderProps" @change="selectCateChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="(item, i) in manyParamsList" :key="i">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyParamsList" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 
              action 表示将图片上传到后台API 
              upload组件 使用的是本身内部配置axios请求 该请求没有携带本项目需要的token令牌 所以需要重新设置请求头
            -->
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headersObj" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addBtn" @click="add">添加按钮</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 上传图片的预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img :src="imgPath" class="preview" />
    </el-dialog>
  </div>
</template>
<script>
// lodash 组件
import _ from 'lodash'

export default {
  data() {
    return {
      // 步骤条和标签页选中
      activeStep: '0',
      // 表单数据对象
      addForm: {
        goods_name: '',
        goods_price: '0',
        goods_number: '0',
        goods_weight: '0',
        // 商品分类id数组 需要是以，分割的字符串
        goods_cat: [],
        // 上传图片的临时图片路径
        pics: [],
        // 商品描述内容
        goods_introduce: '',
        // 商品参数
        attrs: []
      },
      // 添加表单数据校验规则
      addRules: {
        goods_name: [{ required: true, message: '请填入商品名称', tigger: 'blur' }],
        goods_price: [
          {
            required: true,
            message: '请填入商品价格',
            tigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            message: '请填入商品数量',
            tigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: '请填入商品重量',
            tigger: 'blur'
          }
        ],
        goods_cat: [
          {
            type: 'array',
            required: true,
            message: '请选择商品分类',
            tigger: 'change'
          }
        ]
      },
      // 商品分类数据
      cateList: [],
      // 配置 选择器 props
      cascaderProps: {
        // 名称
        label: 'cat_name',
        // id
        value: 'cat_id',
        // 分类节点
        children: 'children'
      },
      // 动态商品参数数据
      manyParamsList: [],
      // 静态属性数据
      onlyParamsList: [],
      // 图片上传路径
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 请求头设置
      headersObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 上传图片的访问地址
      imgPath: '',
      // 控制图片预览对话框的显示和隐藏
      previewDialogVisible: false
    }
  },
  created() {
    this.getCateList()
    console.log(typeof this.addForm.goods_cat)
    // console.log(this.addForm.goods_cat)
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      // 将分类数据传入 cateList
      this.cateList = res.data
      // console.log(res)
    },
    // 处理选择器id改变事件
    selectCateChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        return (this.addForm.goods_cat = [])
      }
    },
    // 监听 标签页切换
    beforeLeave(activeName, oldActiveName) {
      // console.log('下一标签页' + activeName)
      // console.log('上一标签页' + oldActiveName)
      // 如果上一标签页为0 并且未选择三级商品分类 返回false
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // 监听 标签页 activeStep 改变
    async tabsClick() {
      // 商品参数面板
      if (this.activeStep === '1') {
        // 根据三级分类id发起获取商品动态参数请求
        const { data: res } = await this.$http.get('categories/' + this.cateId + '/attributes', { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品参数失败')
        }
        // 处理 数据中的attr_vals 循环res.data
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyParamsList = res.data
        // console.log(res.data)
      } else if (this.activeStep === '2') {
        // 商品属性面板
        // 根据三级分类id发起获取静态属性请求
        const { data: res } = await this.$http.get('categories/' + this.cateId + '/attributes', { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品属性失败')
        }
        this.onlyParamsList = res.data
        console.log(res.data)
      }
    },
    // 处理图片预览功能
    handlePreview(file) {
      this.previewDialogVisible = true
      // console.log(file)
      this.imgPath = file.response.data.url
    },
    // 监听 删除图片事件
    handleRemove(file) {
      // console.log(file)
      const fileInfo = file.response.data.tmp_path
      // 查找图片临时路径的索引
      const i = this.addForm.pics.findIndex(x => x.pic === fileInfo)
      // 根据索引删除该路径
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
      console.log('删除上传图片路径成功')
    },
    // 监听 图片上传成功事件
    handleSuccess(response) {
      // console.log(response)
      const picInfo = {
        pic: response.data.tmp_path
      }
      this.addForm.pics.push(picInfo)
      console.log(this.addForm)
      console.log('上传图片成功')
    },
    // 发送添加商品请求
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写完整的基本信息')
        }
        // lodash 深复制一次表单数据 防止将表单中goods_cat处理为字符串后报错
        const Form = _.cloneDeep(this.addForm)
        // 处理goods_cat 按照接口文档将数组处理为以，分割的字符串
        Form.goods_cat = Form.goods_cat.join(',')
        // 处理 动态参数 按照接口文档将数组 attr_vals 以空格分割为字符串
        this.manyParamsList.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          Form.attrs.push(newInfo)
        })
        // 处理 静态属性
        this.onlyParamsList.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_vals: item.attr_vals }
          Form.attrs.push(newInfo)
        })
        // console.log(Form)
        // 发起请求
        const { data: res } = await this.$http.post('goods', Form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        // 返回数组的最后一项（三级分类id）
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less">
.el-steps {
  margin: 10px !important;
}
.el-step__title {
  font-size: 14px !important;
}
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.preview {
  width: 100%;
}
.addBtn {
  margin-top: 15px !important;
}
</style>
