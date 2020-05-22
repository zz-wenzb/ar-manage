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
        <Input clearable placeholder="输入关键字搜索" class="search-div" v-model="searchList.goodsName"/>
        <span>订单状态：</span>
        <Select v-model="searchList.status" class="search-div">
          <Option v-for="item in selectList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>


        <Button style="margin-left: 10px" @click="queryUserList" class="search-btn"  type="primary"><Icon type="search"/>&nbsp;&nbsp;搜索</Button>
        <Button style="margin-left: 10px" @click="resetSearch" class="search-btn"  type="primary">&nbsp;&nbsp;重置</Button>
      </div>
      <!--<div>-->
      <!--<Button type="primary" @click="addUser()">添加用户</Button>-->
      <!--</div>-->
    </div>

    <div style="margin-bottom: 15px;">
      <Table border :columns="columns" :data="data" @on-sort-change="setSortChange"></Table>
    </div>
    <div style="text-align: center">
      <Page :total="totalCount" :current.sync="pageNo" show-total show-elevator  show-sizer @on-change="changePageNo" @on-page-size-change="changePageSize"/>
    </div>

  </div>
</template>



<script>
  import {getOrderList, getUserinfo} from '@/api/data'
  export default {
    data () {
      return {
        selectList: [
          {
            value: '99',
            label: '全部'
          },
          {
            value: '1',
            label: '已付款'
          },
          {
            value: '0',
            label: '未付款'
          }
        ],
        searchList:{
          goodsName:'',
          status:'',
          userId:''
        },
        sortProp:null,
        selectRow:{},
        modalTitle:'',
        data: [],
        pageSize:10,
        pageNo:1,
        totalCount:0,
        columns: [
          {
            title: '商品名称',
            key: 'goodsName',
            align:'center'
          },
          {
            title: '图片',
            key: 'photo',
            align:'center'
          },
          {
            title: '买家名称',
            key: 'userName',
            align:'center'
          },
          {
            title: '单价',
            key: 'price',
            align:'center'
          },
          {
            title: '创建时间 ',
            key: 'createDate',
            align:'center'
          },
          {
            title: '订单状态',
            key: 'status',
            align:'center'
          },
          {
            title: '订单支付时间',
            key: 'paymentDate',
            align:'center'
          }

        ],
        userinfo:''
      }
    },
    mounted(){
      this.userinfo = getUserinfo();
      this.searchList.userId =this.userinfo.id
      this.getOrderList()
    },
    methods: {
      queryUserList(){
        this.pageSize = 10;
        this.pageNo = 1;
        this.getOrderList()
      },
      setSortChange(sort){
        this.sortProp = sort
      },
      cancel(){
        this.reset()
        this.eventModal = false
      },
      resetSearch(){
        this.searchList.goodsName = ''
        this.searchList.status = ''
      },
      getOrderList(){

        let params = {
          pageSize:this.pageSize,
          pageNo:this.pageNo,
          searchList:this.searchList
        }
        if (this.sortProp){
          if (this.sortProp.order != 'normal'){
            params.orderBy = "o." + this.sortProp.key + " " +this.sortProp.order
          }else{
            this.sortProp = null
          }
        }
        getOrderList(params).then(res=>{
          this.data = res.data.result
          this.totalCount = res.data.totalCount
        }).catch(e=>{})
      },
      changePageNo(pageNo){
        this.pageNo = pageNo
        this.getOrderList()
      },
      changePageSize(pageSize){
        this.pageSize = pageSize
        this.getOrderList()
      }

    },
    watch: {
      sortProp : {
        handler(val){
          this.getOrderList()
        },
        deep: true
      }
    }
  }
</script>
