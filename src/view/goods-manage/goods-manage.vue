<style scoped>
  .search-list{
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between
  }
  .search-div{
    width: 200px;
    margin-right: 5px;
  }
</style>
<template>
  <div>

    <div class="search-list" >
      <div>
        <span>商品名称：</span>
        <Input clearable placeholder="输入关键字搜索" class="search-div" v-model="searchList.name"/>
        <span>创建时间：</span>
        <DatePicker  type="date" format="yyyy-MM-dd" placeholder="请选择创建时间" class="search-div" v-model="searchList.date"></DatePicker>
        <span>商品状态：</span>
        <Select v-model="searchList.status" class="search-div">
          <Option v-for="item in selectList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Button style="margin-left: 10px" @click="queryEventList" class="search-btn"  type="primary"><Icon type="search"/>&nbsp;&nbsp;搜索</Button>
        <Button style="margin-left: 10px" @click="resetSearch" class="search-btn"  type="primary">&nbsp;&nbsp;重置</Button>
      </div>
      <div>
        <Button type="primary" @click="addGoods()">添加商品</Button>
      </div>
    </div>
    <div style="margin-bottom: 15px;">
      <Table border :columns="columns" :data="data" @on-sort-change="setSortChange"></Table>
    </div>
    <div style="text-align: center">
      <Page :total="totalCount" :current.sync="current" show-total show-elevator  show-sizer @on-change="changePageNo" @on-page-size-change="changePageSize"/>
    </div>
    <!--    添加商品-->
    <Modal
      v-model="eventModal"
      :title="editFlg?'修改商品':'新增商品'"
      @on-cancel="cancel"
      :width="900"
    >
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
        <FormItem label="商品名称" prop="name">
          <Input v-model="formValidate.name" placeholder="请输入商品名称"></Input>
        </FormItem>

        <FormItem label="商品价格" prop="price">
          <Input v-model="formValidate.price" placeholder="请输入商品价格"></Input>
        </FormItem>
        <FormItem label="商品状态">
          <Select v-model="formValidate.status">
            <Option value="0">上架</Option>
            <Option value="1">下架</Option>
          </Select>
        </FormItem>
      </Form>

      <div slot="footer">
        <Button type="default"  @click="reset" v-if="!editFlg">重置</Button>
        <Button type="primary"  @click="ok">确定</Button>
      </div>
    </Modal>

    <!--    删除确认框-->
    <Modal v-model="delModal" width="360">
      <p slot="header" style="color:#f60;text-align:center">
        <Icon type="ios-information-circle"></Icon>
        <span>删除商品</span>
      </p>
      <div style="text-align:center">
        <p>确定删除该商品吗</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long @click="delGoods">删除</Button>
      </div>
    </Modal>

    <Modal
      v-model="imgModal"
      footer-hide
      title="图片预览"
    >
      <div >
        <img :src="formValidate.img" style="width: 100%;height: 100%;">
      </div>

    </Modal>

  </div>
</template>
<script>
import { getGoodsList, addGoods, editGoods, delGoods, getUserinfo,getGoodsById } from '@/api/data'
import Editor from '_c/editor'
import { formatDate } from '@/libs/util'
export default {
  components: {
    Editor
  },
  data () {
    const validateName = (rule, value, callback) => {
      if (value === '' || value.trim() === '') {
        callback(new Error('商品标题不能为空'))
      } else if (value.length > 20) {
        callback(new Error('商品标题长度不能超过20'))
      } else {
        callback()
      }
    }

    const validatePrice = (rule, value, callback) => {
      let re = new RegExp("^(([1-9]{1}\\d*)|(0{1}))(\\.\\d{1,2})?$");
      if (re.test(value)) {
        callback()
      }else {
        callback(new Error('请输入正确的商品价格,且小数位不能超过两位'))
      }
    }

    return {
      selectList: [
        {
          value: '99',
          label: '全部'
        },
        {
          value: '1',
          label: '下架'
        },
        {
          value: '0',
          label: '上架'
        }
      ],
      searchList: {
        name: '',
        date: '',
        status: '99',
        userId: ''
      },
      searchValue: '',
      imgModal: false,
      sortProp: null,
      selectRow: {},
      delModal: false,
      modalTitle: '',
      editFlg: '',
      formValidate: {
        id: '',
        name: '',
        price: '',
        status: '0'
      },
      ruleValidate: {
        name: [
          { validator: validateName, trigger: 'blur', required: true }
        ],
        price: [
          { validator: validatePrice, trigger: 'blur', required: true }
        ]
      },
      options3: {
        disabledDate (date) {
          return date && date.valueOf() < Date.now() - 86400000
        }
      },
      eventModal: false,
      data: [],
      pageSize: 10,
      pageNo: 1,
      current: 1,
      totalCount: 0,
      columns: [
        {
          title: '商品名称',
          key: 'name',
          align: 'center'
        },
        {
          title: '商品价格',
          key: 'price',
          align: 'center'
        },
        {
          title: '商品状态',
          key: 'status',
          align: 'center'
        },
        {
          title: '创建时间',
          key: 'createDate',
          align: 'center'
        },
        {
          title: '操作',
          key: 'action',
          width: 400,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  click: () => {
                    this.editGoods(params)
                  }
                }
              }, '修改'),

              h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.remove(params)
                  }
                }
              }, '删除')
            ])
          }
        }
      ],
      userInfo:''

    }
  },
  mounted () {
    this.userInfo = getUserinfo();
    this.searchList.userId = this.userInfo.id
    this.getGoodsList()
  },
  methods: {

    TimeComparison (date) {
      let aData = new Date()
      let bData = new Date(date + ' 00:00:00')
      let cData = new Date(aData.getFullYear() + '-' + (aData.getMonth() + 1) + '-' + aData.getDate())
      return cData > bData
    },

    queryEventList () {
      this.pageSize = 10
      this.pageNo = 1
      this.getGoodsList()
    },
    clearImg () {
      this.formValidate.img = ''
      this.formValidate.imgName = ''
    },
    showImgModal () {
      this.imgModal = true
    },
    handleUpload (file) {
      const fileExt = file.name.split('.').pop().toLocaleLowerCase()
      if (fileExt === 'jpg' || fileExt === 'jepg' || fileExt === 'png') {
        if (file.size > 1024 * 1024) {
          this.$Notice.warning({
            title: '文件大小超出限制',
            desc: '文件：' + file.name + '大小超出限制，最大不能超过1M'
          })
        } else {
          this.imageToBase64(file)
        }
      } else {
        this.$Notice.warning({
          title: '文件类型错误',
          desc: '文件：' + file.name + '不是图片文件，请选择后缀为.jpg或者.jepg或者.png的文件。'
        })
      }
      return false
    },
    setSortChange (sort) {
      this.sortProp = sort
    },
    editGoods (params) {
      let row = params.row
      this.formValidate.name = row.name
      this.formValidate.id = row.id
      this.formValidate.price = row.price
      if(row.status == '上架'){
        this.formValidate.status = '0'
      }else{
        this.formValidate.status = '1'
      }
      this.editFlg = true
      this.eventModal = true
    },
    handleChange (html, text) {
      this.formValidate.description = text
      this.formValidate.htmlDesc = html
      this.$refs.formValidate.validateField('description')
    },
    cancel () {
      this.reset()
      this.eventModal = false
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (this.editFlg) {
            this.editGoodsInfo() // 编辑商品提交
          } else {
            this.addGoodsInfo() // 新增提交
          }
        } else {

        }
      })
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    },
    ok () {
      this.handleSubmit('formValidate')
    },
    reset () {
      this.handleReset('formValidate')
      // this.resetChangeContent()
      this.clearImg()
    },
    resetSearch () {
      this.searchList.name = ''
      this.searchList.date = ''
      this.searchList.status = '99'
    },
    addGoods () {
      this.editFlg = false
      this.reset()
      this.eventModal = true
    },
    getGoodsList () {
      if (this.searchList.date) {
        let dt = new Date(this.searchList.date).toLocaleString()
        this.searchList.date = dt
      }
      let params = {
        pageSize: this.pageSize,
        pageNo: this.pageNo,
        searchList: this.searchList
      }
      if (this.sortProp) {
        if (this.sortProp.order != 'normal') {
          params.orderBy = this.sortProp.key + ' ' + this.sortProp.order
        } else {
          this.sortProp = null
        }
      }

      getGoodsList(params).then(res => {
        this.data = res.data.result
        this.totalCount = res.data.totalCount
      }).catch(e => {})
    },
    changePageNo (pageNo) {
      this.pageNo = pageNo
      this.getGoodsList()
    },
    changePageSize (pageSize) {
      this.pageSize = pageSize
      this.getGoodsList()
    },
    show (index) {
      this.$Modal.info({
        title: 'User Info',
        content: `Name：${this.data[index].name}<br>Age：${this.data[index].age}<br>Address：${this.data[index].address}`
      })
    },
    remove (param) { // 删除数据
      this.selectRow = param.row
      this.delModal = true
    },
    delGoods () {
      let params = {
        id: this.selectRow.id
      }
      delGoods(params).then(res => {
        this.$Message.success({
          content: `删除成功`
        })
        this.getGoodsList()
        this.delModal = false
      }).catch(e => {
        this.$Message.success({
          content: `删除失败`
        })
        this.getGoodsList()
        this.delModal = false
      })
    },
    addGoodsInfo () {
      let params = {
        name: this.formValidate.name,
        price: this.formValidate.price,
        status: this.formValidate.status,
        userId: this.userInfo.id
      }
      addGoods(params).then(res => {
        if (res.data.msg != null) {
          this.$Message.error({
            content: res.data.msg
          })
        } else {
          this.eventModal = false
          // 添加成功
          this.$Message.success({
            content: `添加成功`
          })
          this.reset()
          this.pageNo = 1
          this.pageSize = 10
          this.current = 1
          this.getGoodsList()
        }
      }).catch(e => {
        this.$Message.error('添加失败!')
      })
    },
    editGoodsInfo () {
      let params = {
        id: this.formValidate.id,
        name: this.formValidate.name,
        price: this.formValidate.price,
        status: this.formValidate.status
      }
      editGoods(params).then(res => {
        if (res.data.msg != null) {
          this.$Message.error(res.data.msg)
        } else {
          // 添加成功
          this.$Message.success(`修改成功`)
          this.reset()
          this.eventModal = false
          this.getGoodsList()
        }
      }).catch(e => {
        this.$Message.error('修改失败!')
      })
    },
    imageToBase64 (file) {
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        this.formValidate.imgName = file.name
        this.formValidate.img = reader.result
        this.$refs.formValidate.validateField('imgName')
      }
      reader.onerror = function (error) {
        console.log('Error: ', error)
      }
    }

  },
  watch: {
    sortProp: {
      handler (val) {
        this.getGoodsList()
      },
      deep: true
    }
  }
}
</script>
