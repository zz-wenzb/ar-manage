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
        <span>活动名称：</span>
        <Input clearable placeholder="输入关键字搜索" class="search-div" v-model="searchList.name"/>
        <span>活动时间：</span>
        <DatePicker  type="date" format="yyyy-MM-dd" placeholder="请选择活动时间" class="search-div" v-model="searchList.date"></DatePicker>
        <span>首页推荐：</span>
        <Select v-model="searchList.isRecommend" class="search-div">
          <Option v-for="item in selectList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <span>最近推荐：</span>
        <Select v-model="searchList.isRecommendLately" class="search-div">
          <Option v-for="item in selectList" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
        <Button style="margin-left: 10px" @click="queryEventList" class="search-btn"  type="primary"><Icon type="search"/>&nbsp;&nbsp;搜索</Button>
        <Button style="margin-left: 10px" @click="resetSearch" class="search-btn"  type="primary">&nbsp;&nbsp;重置</Button>
      </div>
      <div>
        <Button type="primary" @click="addEvent()">添加活动</Button>
      </div>
    </div>
    <div style="margin-bottom: 15px;">
      <Table border :columns="columns" :data="data" @on-sort-change="setSortChange"></Table>
    </div>
    <div style="text-align: center">
      <Page :total="totalCount" :current.sync="current" show-total show-elevator  show-sizer @on-change="changePageNo" @on-page-size-change="changePageSize"/>
    </div>
<!--    添加活动-->
    <Modal
      v-model="eventModal"
      :title="editFlg?'修改活动':'新增活动'"
      @on-cancel="cancel"
      :width="900"
    >
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="100">
        <FormItem label="活动名称" prop="name">
          <Input v-model="formValidate.name" placeholder="请输入活动名称"></Input>
        </FormItem>
        <FormItem label="活动总名额" prop="counttotal">
          <Input v-model="formValidate.counttotal" placeholder="请输入活动总名额"></Input>
        </FormItem>
        <FormItem label="活动时间" prop="date">
          <DatePicker type="daterange" :options="options3" placeholder="请选择活动时间" v-model="formValidate.date"></DatePicker>
        </FormItem>
        <FormItem label="活动规则" prop="rule">
          <Input v-model="formValidate.rule" placeholder="请输入活动规则"></Input>
        </FormItem>
        <FormItem label="首张图片" prop="imgName">
          <Upload action="" :before-upload="handleUpload" v-model="formValidate.imgName" show-message="false">
            <Button icon="ios-cloud-upload-outline">上传首张图片</Button>
          </Upload>
          <div v-show="formValidate.img">
            <span style="margin-right: 10px;">{{formValidate.imgName}}</span>
            <Button style="margin-right: 10px;"  @click="showImgModal">预览</Button>
            <!--<Button  @click="clearImg">清除</Button>-->
          </div>
        </FormItem>

        <FormItem label="活动内容" prop="description">
          <div>
            <editor ref="editor" :value="formValidate.description" @on-change="handleChange"/>
          </div>

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
        <span>删除活动</span>
      </p>
      <div style="text-align:center">
        <p>确定删除该活动吗</p>
      </div>
      <div slot="footer">
        <Button type="error" size="large" long @click="delEvent">删除</Button>
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
  import {getEventList, addEvent, editEvent, delEvent, editRecommend,viewContent} from '@/api/data'
  import Editor from '_c/editor'
  import { formatDate } from '@/libs/util'
  export default {
    components: {
      Editor
    },
    data () {

      const validateName = (rule, value, callback) => {
        if (value === '' || value.trim()== '') {
          callback(new Error('活动标题不能为空'));
        }else if(value.length > 20){
          callback(new Error('活动标题长度不能超过20'));
        }
        else {
          callback();
        }
      };
      const validateCounttotal = (rule, value, callback) => {
        if (value === '' || value.trim()== '') {
          callback(new Error('活动人数不能为空'));
        }
        let re = new RegExp("^[1-9][0-9]{0,4}$");

        if (re.test(value)) {
          callback()
        } else {
          callback(new Error('请输入正确的活动人数，且活动人数最多不超过100000！'));
        }
        // if(parseInt(value )== 0 ){
        //   callback(new Error('活动人数不能为0'));
        // }
      };
      const validateImgName = (rule, value, callback) => {
        if (value === '' || value.trim()== '') {
          callback(new Error('活动图片不能为空'));
        } else {
          callback();
        }
      };
      const validateDescription = (rule, value, callback) => {
        if (value === '' || value.trim()== '') {
          callback(new Error('活动内容不能为空'));
        } else {
          callback();
        }
      };

      const validateRule = (rule, value, callback) => {
        if (value === '' || value.trim()== '') {
          callback(new Error('活动规则不能为空'));
        } else if(value.length > 50){
          callback(new Error('活动规则长度不能超过50'));
        }else {
          callback();
        }
      };

      return {
        selectList:[
          {
            value: '99',
            label: '全部'
          },
          {
            value: '1',
            label: '是'
          },
          {
            value: '0',
            label: '否'
          }
        ],
        searchList:{
          name:'',
          date:'',
          isRecommend:'99',
          isRecommendLately:'99',
        },
        searchValue:'',
        imgModal:false,
        sortProp:null,
        selectRow:{},
        delModal:false,
        modalTitle:'',
        editFlg:'',
        formValidate: {
          id:'',
          name: '',
          date: '',
          description: '',
          rule:'',
          htmlDesc: '',
          counttotal:'',
          img:'',//第一张图片位置
          imgName:''
        },
        ruleValidate: {
          name: [
            { validator: validateName, trigger: 'blur',required:true }
          ],
          date: [{ required: true, type: 'array', message: '活动时间不能为空', trigger: 'blur' }
            ,{ validator (rule, value, callback, source, options) {
                const errors = []
                if (value[0] === '') { errors.push('活动时间不能为空') }
                callback(errors)
              } }
              ]
          ,counttotal:[{ required: true, type:'string', message: '活动人数不能为空', trigger: 'blur' },
            { validator: validateCounttotal, trigger: 'blur'  }
          ],
          rule: [
            { required: true, type:'string', message: '活动规则不能为空', trigger: 'blur' },
            { validator: validateRule, trigger: 'blur' }
          ],
          description: [
            { validator: validateDescription, trigger: 'blur',required:true }
          ],
          imgName: [
            { required: true, type:'string', message: '活动图片不能为空', trigger: 'blur' }
          ],
        },
        options3: {
          disabledDate (date) {
            return date && date.valueOf() < Date.now() - 86400000;
          }
        },
        eventModal:false,
        data: [],
        pageSize:10,
        pageNo:1,
        current:1,
        totalCount:0,
        columns: [
          {
            title: '活动名称',
            key: 'name',
            align:'center'
          },
          {
            title: '活动总名额',
            key: 'counttotal',
            align:'center'
          },
          {
            title: '活动开始时间',
            key: 'dateActivityStart',
            align:'center'
          },
          {
            title: '活动结束时间',
            key: 'dateActivityEnd',
            align:'center'
          },
          {
            title: '是否首页推荐',
            key: 'isRecommend',
            sortable:'custom',
            render:(h, params) =>{
              let text = params.row.isRecommend
              if (text == '1'){
                text = "是"
              } else {
                text =  "否"
              }
              return h('span', text);
            },
            align:'center'
          },
          {
            title: '是否最近推荐',
            key: 'isRecommendLately',
            sortable:'custom',
            render:(h, params) =>{
              let text = params.row.isRecommendLately
              if (text == '1'){
                text = "是"
              } else {
                text =  "否"
              }
              return h('span', text);
            },
            align:'center'
          },
          {
            title: '操作',
            key: 'action',
            width: 400,
            align: 'center',
            render: (h, params) => {
              let isRecommendText = params.row.isRecommend=='0'?"设置首页推荐":"取消首页推荐"
              let isRecommendLatelyText = params.row.isRecommendLately=='0'?"设置最近推荐":"取消最近推荐"
              return h('div', [

                h('Button', {
                  props: {
                    type: params.row.isRecommend=='0'?'primary':"success",
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.setRecommend(params, "isRecommend") //首页推荐
                    }
                  }
                }, isRecommendText),
                h('Button', {
                  props: {
                    type: params.row.isRecommendLately=='0'?'primary':"success",
                    size: 'small',
                    disabled:this.TimeComparison(params.row.dateActivityEnd)
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.setRecommend(params, "isRecommendLately") //最近推荐
                    }
                  }
                }, isRecommendLatelyText),

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
                      this.editEvent(params)
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
              ]);
            }
          }
        ]

      }
    },
    mounted(){
      this.getEventList()
    },
    methods: {

      TimeComparison(date){
        let aData = new Date();
        let bData = new Date(date + ' 00:00:00');
        let cData = new Date(aData.getFullYear() + "-" + (aData.getMonth() + 1) + "-" + aData.getDate());
        return cData > bData
      },

      queryEventList(){
        this.pageSize = 10;
        this.pageNo = 1;
        this.getEventList()
      },
      clearImg(){
        this.formValidate.img = ''
        this.formValidate.imgName= ''
      },
      showImgModal(){
        this.imgModal = true
      },
      handleUpload (file) {
        const fileExt = file.name.split('.').pop().toLocaleLowerCase()
        if (fileExt === 'jpg' || fileExt === 'jepg' || fileExt === 'png') {
          if(file.size > 1024*1024){
            this.$Notice.warning({
              title: '文件大小超出限制',
              desc: '文件：' + file.name + '大小超出限制，最大不能超过1M'
            })
          }else{
            this.imageToBase64(file)
          }
        } else {
          this.$Notice.warning({
            title: '文件类型错误',
            desc: '文件：' + file.name + '不是图片文件，请选择后缀为.jpg或者.jepg或者.png的文件。'
          })
        }
        return false;
      },
      // 更改推荐标志位
      setRecommend(param, field){
        let row = param.row
        let params= {
          id : row.id,
          [field]:1-parseInt(row[field])
        }
        editRecommend(params).then(res=>{
          if (res.data.msg != null){
            this.$Message.error(res.data.msg)
          }else{
            this.$Message.success("修改成功")
            this.getEventList()
          }
        }).catch(e=>{
          this.$Message.error("修改失败")
          this.getEventList()
        })

      },
      setSortChange(sort){
        this.sortProp = sort
      },
      editEvent(params){
        let row = params.row
        let param = {'id':row.id}
        viewContent(param).then(res=>{
          this.formValidate.img = res.data.result.img
          this.formValidate.htmlDesc =  res.data.result.htmlDesc
          let eventDate = [ new Date(row.dateActivityStart),new Date(row.dateActivityEnd)]
          this.formValidate.date = eventDate
          this.formValidate.imgName = row.imgName
          this.formValidate.counttotal = row.counttotal.toString()
          this.formValidate.name = row.name
          this.formValidate.description =  row.description
          this.formValidate.rule =  row.rule
          this.formValidate.id =  row.id
          this.changeContent()
          this.editFlg = true
          this.eventModal = true
        })


      },
      handleChange (html, text) {
        this.formValidate.description = text
        this.formValidate.htmlDesc = html
        this.$refs.formValidate.validateField('description')
        // if (html.indexOf("data:image")>-1){
        //   let imgIndex = html.indexOf("data:image") //查找第一个图片开始位置
        //   let partHtml = html.substring(imgIndex,html.length) //截取第一个图片后字符
        //   let quoteIndex = partHtml.indexOf("\"")+imgIndex //查找第一个图片的结束位置
        //   let firstImg = html.substring(html.indexOf("data:image"),quoteIndex)
        //   this.formValidate.img = firstImg
        // }
      },
      resetChangeContent () { //修改富文本内容
        this.$refs.editor.setHtml('')
      },
      changeContent () { //修改富文本内容
        this.$refs.editor.setHtml(this.formValidate.htmlDesc)
      },
      cancel(){
        this.reset()
        this.eventModal = false
      },
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            if (this.editFlg){
              this.editEventInfo() //编辑活动提交
            }else{
              this.addEventInfo() //新增提交
            }
          } else {

          }
        })
      },
      handleReset (name) {
        this.$refs[name].resetFields();
      },
      ok(){
        this.handleSubmit('formValidate')
      },
      reset(){
        this.handleReset('formValidate')
        this.resetChangeContent()
        this.clearImg()
      },
      resetSearch(){
        this.searchList.name=''
        this.searchList.date=''
        this.searchList.isRecommend='99'
        this.searchList.isRecommendLately='99'
      },
      addEvent(){
        this.editFlg = false
        this.reset()
        this.eventModal = true
      },
      getEventList(){
        if (this.searchList.date){
          let dt = new Date(this.searchList.date).toLocaleString()
          this.searchList.date = dt
        }
        let params = {
          pageSize:this.pageSize,
          pageNo:this.pageNo,
          searchList:this.searchList
        }
        if (this.sortProp){
          if (this.sortProp.order != 'normal'){
            params.orderBy = this.sortProp.key + " " +this.sortProp.order
          }else{
            this.sortProp = null
          }
        }

        getEventList(params).then(res=>{
          this.data = res.data.result
          this.totalCount = res.data.totalCount
        }).catch(e=>{})
      },
      changePageNo(pageNo){
        this.pageNo = pageNo
        this.getEventList()
      },
      changePageSize(pageSize){
        this.pageSize = pageSize
        this.getEventList()
      },
      show (index) {
        this.$Modal.info({
          title: 'User Info',
          content: `Name：${this.data[index].name}<br>Age：${this.data[index].age}<br>Address：${this.data[index].address}`
        })
      },
      remove (param) { //删除数据
        this.selectRow = param.row
        this.delModal = true
      },
      delEvent(){
        let params = {
          id : this.selectRow.id
        }
        delEvent(params).then(res=>{
          this.$Message.success({
            content: `删除成功`
          })
          this.getEventList()
          this.delModal = false
        }).catch(e=>{
          this.$Message.success({
            content: `删除失败`
          })
          this.getEventList()
          this.delModal = false
        })
      },
      addEventInfo(){
        let params ={
          name:this.formValidate.name,
          counttotal:this.formValidate.counttotal,
          img:this.formValidate.img,
          imgName:this.formValidate.imgName,
          dateActivityStart:formatDate(this.formValidate.date[0],'yyyy-MM-dd'),
          dateActivityEnd:formatDate(this.formValidate.date[1],'yyyy-MM-dd'),
          description: this.formValidate.description,
          rule: this.formValidate.rule,
          htmlDesc: this.formValidate.htmlDesc
        }
        addEvent(params).then(res=>{
          if(res.data.msg != null){
            this.$Message.error({
              content: res.data.msg
            })
          }else{
            this.eventModal = false
            // 添加成功
            this.$Message.success({
              content: `添加成功`
            })
            this.reset()
            this.pageNo=1
            this.pageSize=10
            this.current = 1
            this.getEventList()
          }
        }).catch(e=>{
          this.$Message.error('添加失败!');
        })
      },
      editEventInfo(){
        let params ={
          id:this.formValidate.id,
          name:this.formValidate.name,
          countTotal:this.formValidate.counttotal,
          img:this.formValidate.img,
          imgName:this.formValidate.imgName,
          dateActivityStart:formatDate(this.formValidate.date[0],'yyyy-MM-dd'),
          dateActivityEnd:formatDate(this.formValidate.date[1],'yyyy-MM-dd'),
          description: this.formValidate.description,
          rule: this.formValidate.rule,
          htmlDesc: this.formValidate.htmlDesc
        }
        editEvent(params).then(res=>{
          if(res.data.msg != null){
            this.$Message.error(res.data.msg)
          }else{
            // 添加成功
            this.$Message.success(`修改成功`)
            this.reset()
            this.eventModal = false
            this.getEventList()
          }
        }).catch(e=>{
          this.$Message.error('修改失败!');
        })
      },
      imageToBase64 (file) {
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          this.formValidate.imgName = file.name
          this.formValidate.img = reader.result
          this.$refs.formValidate.validateField('imgName')
          // console.log(reader.result)
          //新建一个img标签
          // var image = new Image();
          // image.src = reader.result;
          // var canvas = document.createElement('canvas');
          // var context = canvas.getContext('2d');
          // //压缩后图片的大小
          // var data;
          // var imageWidth = image.width *0.8;
          // var imageHeight = image.height *0.8;
          // canvas.width = imageWidth;
          // canvas.height = imageHeight;
          // context.drawImage(image, 0, 0, imageWidth, imageHeight);
          // data = canvas.toDataURL('image/jpeg').replace("data:image/jpeg;base64,","");
          // console.log(data)
          // var length=data.toString().length;
          // if(length>1024*200){
          //   return compress(data);
          // }
        }
        reader.onerror = function (error) {
          console.log('Error: ', error)
        }
      }

    },
    watch: {
      sortProp : {
        handler(val){
          this.getEventList()
        },
        deep: true
      }
    }
  }
</script>
