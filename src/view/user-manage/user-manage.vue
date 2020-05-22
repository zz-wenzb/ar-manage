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
        <span>用户名：</span>
        <Input clearable placeholder="输入关键字搜索" class="search-div" v-model="searchList.loginName"/>
        <span>昵称：</span>
        <Input clearable placeholder="输入关键字搜索" class="search-div" v-model="searchList.nickName"/>
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
  import {getUserList, getUserinfo} from '@/api/data'
  export default {
    data () {
      return {
        searchList:{
          loginName:'',
          nickName:'',
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
            title: '用户名',
            key: 'loginName',
            align:'center'
          },
          {
            title: '昵称',
            key: 'nickName',
            align:'center'
          },
          {
            title: '性别 ',
            key: 'sex',
            align:'center'
          },
          {
            title: '头像',
            key: 'headimgurl',
            align:'center'
          }

        ],
        userinfo:''
      }
    },
    mounted(){
      this.userinfo = getUserinfo();
      this.searchList.userId =this.userinfo.id
      this.getUserList()
    },
    methods: {
      queryUserList(){
        this.pageSize = 10;
        this.pageNo = 1;
        this.getUserList()
      },
      setSortChange(sort){
        this.sortProp = sort
      },
      cancel(){
        this.reset()
        this.eventModal = false
      },
      resetSearch(){
        this.searchList.loginName = ''
        this.searchList.nickName = ''
      },
      getUserList(){

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
        getUserList(params).then(res=>{
          this.data = res.data.result
          this.totalCount = res.data.totalCount
        }).catch(e=>{})
      },
      changePageNo(pageNo){
        this.pageNo = pageNo
        this.getUserList()
      },
      changePageSize(pageSize){
        this.pageSize = pageSize
        this.getUserList()
      }

    },
    watch: {
      sortProp : {
        handler(val){
          this.getUserList()
        },
        deep: true
      }
    }
  }
</script>
