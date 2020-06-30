<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="6">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单表格区域 -->
      <el-table :data="orderList.goods" border stripe>
        <el-table-column type="index" label="#" width="50px"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="100px"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="100px">
          <template slot-scope="scope">
            <el-tag type="primary" v-if="scope.row.pay_status === 1">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="100px"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="200px">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template>
            <el-tooltip
              effect="dark"
              content="修改地址"
              placement="top"
              :enterable="false"
              :open-delay="500"
            >
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showAddress"></el-button>
            </el-tooltip>
            <el-tooltip
              effect="dark"
              content="物流信息"
              placement="top"
              :enterable="false"
              :open-delay="500"
            >
              <el-button
                type="success"
                icon="el-icon-location-outline"
                size="mini"
                @click="showProgress"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
      <!-- 修改地址对话框 -->
      <el-dialog @close="addressClose" title="修改地址" :visible.sync="addressDialog" width="50%">
        <el-form
          :model="addressForm"
          :rules="addressRules"
          ref="addressFormRef"
          label-width="100px"
        >
          <el-form-item label="省市区" prop="address1">
            <el-cascader
              expandTrigger="hover"
              v-model="addressForm.address1"
              :options="cityData"
              :props="cascaderProps"
              @change="selectCateChange"
              clearable
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addressDialog = false">取 消</el-button>
          <el-button type="primary" @click="addressDialog = false">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 物流信息对话框 -->
      <el-dialog title="物流信息" :visible.sync="progressDialog" width="50%">
        <!-- 时间线组件 -->
        <el-timeline :reverse="true">
          <el-timeline-item
            v-for="(activity, index) in progressInfo"
            :key="index"
            :timestamp="activity.time"
          >{{activity.context}}</el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
// 导入 省市区 数据
import cityData from './citydata.js'
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 当前页显示条数
        pagesize: 10
      },
      // 总的数据条数
      total: 0,
      // 订单数据列表
      orderList: [],
      // 省市区数据
      cityData,
      // 控制修改地址对话框显示与隐藏
      addressDialog: false,
      // 修改地址表单
      addressForm: {
        address1: [],
        address2: ''
      },
      // 修改地址表单验证规则
      addressRules: {
        address1: [
          {
            type: 'array',
            required: true,
            message: '请选择省市区',
            tigger: 'blur'
          }
        ],
        address2: [
          { required: true, message: '请填写详细地址', tigger: 'blur' }
        ]
      },
      // 配置选择器 props
      cascaderProps: {
        // 名称
        label: 'label',
        // id
        value: 'value',
        // 分类节点
        children: 'children'
      },
      // 物流信息
      progressInfo: [],
      progressDialog: false
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    //   获取订单数据列表
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取订单数据失败')
      }
      this.orderList = res.data
      this.total = res.data.total
      //   console.log(res.data)
    },
    // 监听 页面显示条数的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 修改地址
    showAddress() {
      this.addressDialog = true
    },
    // 监听 省市区选择改变事件
    selectCateChange() {
      console.log(this.addressForm.address1)
    },
    // 监听 修改地址对话框关闭事件
    addressClose() {
      this.addressForm.address1 = []
      this.addressForm.address2 = ''
    },
    // 显示物流信息
    async showProgress() {
      // 发起请求物流信息数据
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.progressInfo = res.data
      //   console.log(this.progressInfo)
      this.progressDialog = true
    }
  }
}
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>