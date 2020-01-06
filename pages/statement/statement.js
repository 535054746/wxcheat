//index.js
//获取应用实例
const app = getApp()
import common from "../common/js/common.js";
Page({
  data: {
    orderStatu: '',
    openId: "",
    eId: '',
    total:0,
    orderId:'',
    orderData: [],
    totalAmount:0.00,
    totalNum:0,
    orderDataId: [],
    keyword:'',
    orderDataIdFlag: [],
    organizationList:[],
    organizationListFlag:[],
    storeId:[],
    selectId:[],
    selectFilterId:'',
    selectStoreId:[],
    isAllSelect:false,
    firstLoad: true,
    loginOutShowFlag: false,
    loginOutIconFlag: false,
    search_flag:false,
    rule_flag:false,
    amount:'0.00',
    isAllStore:false,
    startTime:'',
    endTime:'',
    currentDateFlag:'',
    ckTipFalg: false,
    timeObj: null,
    tipText: '',
    loading: false
  },
  changeStatu: function (event) {
    var state = event.target.dataset.orderStatu;
    this.setData({
      orderStatu: state,
      orderData: []
    })
    if (state!=''){
      this.getOrderList2();
    }else{
      this.getOrderList();
    }
    
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var vm = this;
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
      vm.getOrderList();
    }, 1500);
  },
  onReady: function () {
    console.log(common.toDecimal2(2));
  },
  onShow: function () {
    this.initData();
    var vm = this;
    this.data.firstLoad = false;
    wx.getStorage({
      key: 'statementId',
      success: function (res) {
        vm.setData({
          orderId: res.data.id,
          orderStatu: ''
        })
        wx.getStorage({
          key: 'supplierInfo',
          success: function (res) {
            vm.data.openId = res.data.openId;
            vm.data.eId = res.data.eid;
            if (vm.data.orderStatu == '') {
              vm.getOrderList();
            } else {
              vm.getOrderList2();
            }

          }
        })
      }
    })
    
    
    wx.setStorage({
      key: "statementId",
      data: {}
    })
    wx.getStorage({
      key: 'organizationList',
      success: function(res) {
        console.log(res);
        vm.setData({
          organizationList: res.data.organizationList
        })
        var organizationListFlag=[];
        for (var i = 0; i < res.data.organizationList.length;i++){
          organizationListFlag.push(false);
        }
        vm.setData({
          organizationListFlag: organizationListFlag
        })
      }
    })

  },
  initData: function(){
    this.setData({
      total:0,
      totalAmount:0.00,
      isAllSelect:false,
      selectId:[],
      orderDataIdFlag:[],
    })
  },
  getOrderList: function () {
    var vm = this;
    var url = app.globalData.url;
    this.setData({
      loading: true
    })
    wx.request({
      url: url + 'srm/statement/getCompleteOrderList', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        keyword: vm.data.keyword,
        startTime: vm.data.startTime,
        endTime: vm.data.endTime,
        storeId: vm.data.selectFilterId,
        businessType:0
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'get',
      success: function (res) {
        console.log(res);
        if (res.data.code == '1') {
          vm.formatData(res.data.data);
          vm.resetRule();
        }else{
          vm.showTips(res.data.message);
        }
        vm.setData({
          loading: false
        })
      }, fail: function (res) {
        vm.setData({
          loading: false
        })
        vm.showTips(res);
      }
    })
  },
  getOrderList2: function () {
    var vm = this;
    var url = app.globalData.url;
    this.setData({
      loading: true
    })
    wx.request({
      url: url + 'srm/statement/getStm', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        keyword: vm.data.keyword,
        startTime: vm.data.startTime,
        billstatus: vm.data.orderStatu,
        endTime: vm.data.endTime,
        storeId: vm.data.selectFilterId,
        pageNo: '0',
        pageSize: '1000'
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        vm.setData({
          loading: false
        })
        if (res.data.code == '1') {
          vm.formatData2(res.data.data);
          vm.resetRule();
        }else{
          vm.showTips(res.data.message);
        }

      }, fail: function (res) {
        vm.setData({
          loading: false
        })
        vm.showTips(res);
      }
    })
  },
  formatData: function (data) {

    var vm = this;
    var item = null;
    var order = [];
    vm.data.orderDataId = [];
    vm.data.orderDataIdFlag=[];
    for (var i = 0; i < data.length; i++) {
      item = data[i];
      vm.data.orderDataId.push(data[i].id);
      vm.data.orderDataIdFlag.push(false);
      vm.data.storeId.push(data[i].storeid);
      var time = '';
      if (vm.data.orderStatu!=''){
        time = vm.format(new Date(item.billdate));
      }else{
        time = vm.format(new Date(item.createtime));
      }
      item.createTime = time;
      item.formatAmount = common.toDecimal2(item.totalamount);
      console.log(this.data.totalAmount + ',' + item.totalamount);
      this.data.totalAmount = parseFloat(this.data.totalAmount) + parseFloat(item.totalamount);
      order.push(item);

    }
    console.log(this.data.totalAmount);
    this.setData({
      orderData: order,
      totalAmount: common.toDecimal2(this.data.totalAmount),
      totalNum: data.length
    });
  },
  formatData2: function (data) {

    var vm = this;
    var item = null;
    var order = [];
    vm.data.orderDataId = [];
    vm.data.orderDataIdFlag = [];
    for (var i = 0; i < data.list.length; i++) {
      item = data.list[i];
      vm.data.orderDataId.push(data.list[i].id);
      vm.data.orderDataIdFlag.push(false);
      vm.data.storeId.push(data.list[i].storeid);
      var time = '';
      if (vm.data.orderStatu != '') {
        time = vm.format(new Date(item.billdate));
      } else {
        time = vm.format(new Date(item.createtime));
      }
      item.createTime = time;
      item.formatAmount = common.toDecimal2(item.totalamount);
      console.log(this.data.totalAmount + ',' + item.totalamount);
      this.data.totalAmount = parseFloat(this.data.totalAmount) + parseFloat(item.totalamount);
      order.push(item);

    }
    console.log(this.data.totalAmount);
    this.setData({
      orderData: order,
      totalAmount: common.toDecimal2(data.totalAmount),
      totalNum: data.totalNum
    });
  },
  format: function (fmt) { //author: meizz 
    var vm = this;
    var date = fmt;//当前时间  
    var month = vm.zeroFill(date.getMonth() + 1);//月  
    var day = vm.zeroFill(date.getDate());//日  
    var hour = vm.zeroFill(date.getHours());//时  
    var minute = vm.zeroFill(date.getMinutes());//分  
    var second = vm.zeroFill(date.getSeconds());//秒  

    //当前时间  
    var curTime = date.getFullYear() + "-" + month + "-" + day
      + " " + hour + ":" + minute;//+ ":" + second;

    return curTime;
  },
  /** 
 * 补零 
 */
  zeroFill: function (i) {
    if (i >= 0 && i <= 9) {
      return "0" + i;
    } else {
      return i;
    }
  },
  clickJumpDetail: function (event) {
    var orderId = event.currentTarget.dataset.id;
    //var createtime = event.currentTarget.dataset.createtime;
    //var ordercode = event.currentTarget.dataset.ordercode;
    //var storename = event.currentTarget.dataset.storename;
    //var createusername = event.currentTarget.dataset.createusername;
    //var appstatus = event.currentTarget.dataset.appstatus;
    if (this.data.orderStatu == '1' || this.data.orderStatu== '2'){
      wx.navigateTo({
        url: '../statementedDetail/statementedDetail?id=' + orderId
      })
    }else{
      wx.navigateTo({
        url: '../statementDetail/statementDetail?id=' + orderId
      })
    }
    
  },
  loginOutShow: function (event) {
    var vm = this;
    vm.setData({
      loginOutIconFlag: true
    })
    setTimeout(function () {
      vm.setData({
        loginOutShowFlag: true,
        loginOutIconFlag: false
      })
    }, 200);
  },
  loginOutCancel: function (event) {
    this.setData({
      loginOutShowFlag: false
    })
  },
  loginOutComfire: function (event) {
    this.setData({
      loginOutShowFlag: false
    })
    wx.setStorage({
      key: "userId",
      data: {
        userName: '',
        passWord: ''
      }
    })
    wx.navigateBack({
      delta: 1
    })
  },
  clickSaveID:function(event){
    var orderId = event.currentTarget.dataset.id;
    var mean = event.currentTarget.dataset.mean;
    var amount = event.currentTarget.dataset.amount;
    console.log(amount);
    console.log(common.changePrice(this.data.amount));
    if (this.data.orderDataIdFlag[mean]){
      this.data.orderDataIdFlag[mean] = false;
      this.data.isAllSelect=false;
      this.data.total = this.data.total - 1;
      this.data.amount = parseFloat(common.changePrice(this.data.amount)) * 100 - parseFloat(common.changePrice(amount)) * 100;
    }else{
      this.data.orderDataIdFlag[mean] = true;
      this.data.total = this.data.total + 1;
      this.data.amount = parseFloat(common.changePrice(this.data.amount)) * 100 + parseFloat(common.changePrice(amount)) * 100;
    }
    console.log(this.data.amount);
    this.setData({
      orderDataIdFlag: this.data.orderDataIdFlag,
      isAllSelect: this.data.isAllSelect,
      total: this.data.total,
      amount: common.toDecimal2(this.data.amount/100)
    })
    this.isAll();
  },
  showTips: function (msg) {
    var vm = this;
    if (vm.data.timeObj) {
      clearTimeout(vm.data.timeObj);
    }
    vm.setData({
      ckTipFalg: true,
      tipText: msg
    })
    vm.data.timeObj = setTimeout(function () {
      vm.setData({
        ckTipFalg: false,
        tipText: ''
      })
    }, 1500);
  },
  sureStatement: function (event) {
    var vm = this;
    var url = app.globalData.url;
    vm.getSelectId();
    this.setData({
      loading: true
    })
    wx.request({
      url: url + 'srm/statement/buildStm',
      data: {
        openId: vm.data.openId,
        orderJson: this.data.selectId,
        storeId: this.data.selectStoreId
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        
        if (res.data.code == '1') {
          vm.setData({
            orderStatu:1,
            selectId:[],
            selectStoreId: [],
            total: 0,
            orderDataIdFlag: [],
          })
          vm.setData({
            loading: false
          })
          vm.getOrderList2();
        }else{
          vm.showTips(res.data.message);
        }

      }, fail: function (res) {
        vm.setData({
          loading: false
        })
        vm.showTips(res);
      }
    })
  },
  getSelectId: function(){
    for (var i = 0; i < this.data.orderDataId.length; i++){
      if (this.data.orderDataIdFlag[i]){
        this.data.selectId.push(this.data.orderDataId[i]);
        this.data.selectStoreId.push(this.data.storeId[i]);
      }
    }
  },
  isAll: function () {
    var isAll=true;
    for (var i = 0; i < this.data.orderDataIdFlag.length; i++) {
      if (!this.data.orderDataIdFlag[i]) {
        isAll=false;
      }
    }
    if (isAll){
      this.setData({
        isAllSelect: true
      })
    }else{
      this.setData({
        isAllSelect: false
      })
    }
  },
  selectAll:function(){
    var vm=this;
    if (this.data.isAllSelect) {
      this.setData({
        isAllSelect: false,
        total:0,
        amount: '0.00'
      })
    }else{
      this.setData({
        isAllSelect: true,
        total: vm.data.totalNum,
        amount: vm.data.totalAmount
      })
    }
    for (var i = 0; i < this.data.orderDataIdFlag.length; i++) {
      if (this.data.isAllSelect) {
        this.data.orderDataIdFlag[i] = true;
      }else{
        this.data.orderDataIdFlag[i] = false;
      }
    }
    this.setData({
      orderDataIdFlag: vm.data.orderDataIdFlag
    })
  },
  addStatement:function() {
    var vm = this;
    var url = app.globalData.url;
    vm.getSelectId();
    this.setData({
      loading:true
    })
    wx.request({
      url: url + 'srm/statement/buildStm', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        orderJson: this.data.selectId,
        storeId: this.data.selectStoreId,
        id: this.data.orderId
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        vm.setData({
          loading: false
        })
        if (res.data.code == '1') {
          wx.navigateTo({
            url: '../statementedDetail/statementedDetail?id=' + res.data.data[0]
          })
        }else{
          vm.showTips(res.data.message);
        }

      }, fail: function (res) {
        vm.showTips(res);
        vm.setData({
          loading: false
        })
      }
    })
  },
  changeSearchFlag: function () {
    if (this.data.search_flag){
      this.setData({
        search_flag: false
      })
    }else{
      this.setData({
        search_flag: true
      })
    }
  },
  changeFilterFlag: function () {
    if (this.data.rule_flag) {
      this.setData({
        rule_flag: false
      })
    } else {
      this.setData({
        rule_flag: true
      })
    }
    this.resetRule();
  },
  saveKeyWord: function (e) {
    this.setData({
      keyword: e.detail.value
    })
  },
  searchData: function (e) {
    if (this.data.orderStatu==''){
      this.getOrderList();
    }else{
      this.getOrderList2();
    }
    this.setData({
      search_flag: false
    })
  },
  saveStoreId: function (event) {
    var index = parseInt(event.currentTarget.dataset.index);
    console.log(this.data.organizationListFlag);
    if (this.data.organizationListFlag[index]){
      this.data.organizationListFlag[index] = false;
    }else{
      this.data.organizationListFlag[index] = true;
    }
    this.setData({
      organizationListFlag: this.data.organizationListFlag
    })
    this.checkIsAll();
  },
  checkIsAll: function (event) {
    var isAll = true;
    for (var i = 0; i < this.data.organizationListFlag.length; i++) {
      if (!this.data.organizationListFlag[i]) {
        isAll = false;
      }
    }
    if (isAll) {
      this.setData({
        isAllStore: true
      })
    } else {
      this.setData({
        isAllStore: false
      })
    }
  },
  selectAllStore: function () {
    var vm = this;
    if (this.data.isAllStore) {
      this.setData({
        isAllStore: false
      })
    } else {
      this.setData({
        isAllStore: true
      })
    }
    for (var i = 0; i < this.data.organizationListFlag.length; i++) {
      if (this.data.isAllStore) {
        this.data.organizationListFlag[i] = true;
      } else {
        this.data.organizationListFlag[i] = false;
      }
    }
    this.setData({
      organizationListFlag: vm.data.organizationListFlag
    })
  },
  bindDateChange: function (event) {
    var mean = parseInt(event.currentTarget.dataset.mean);
    if(mean=="0"){
      this.setData({
        startTime: event.detail.value
      })
    }else{
      this.setData({
        endTime: event.detail.value
      })
    }
  },
  dateFormat: function (fmt,day) {
    var date = new Date();
    date.setDate(date.getDate() - day); 
    var o = {
      "M+": date.getMonth() + 1, //月份   
      "d+": date.getDate(), //日   
      "h+": date.getHours(), //小时   
      "m+": date.getMinutes(), //分   
      "s+": date.getSeconds(), //秒   
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
      "S": date.getMilliseconds() //毫秒   
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  },
  changeTime: function (event) {
    var mean = parseInt(event.currentTarget.dataset.mean);
    if (mean == "0") {
      this.setData({
        startTime: this.dateFormat("yyyy-MM-dd", 0),
        endTime: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag:'0'
      })
    }
    if (mean == "7"){
      this.setData({
        startTime: this.dateFormat("yyyy-MM-dd", 6),
        endTime: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag: '7'
      })
    }
    if (mean == "30") {
      this.setData({
        startTime: this.dateFormat("yyyy-MM-dd", 30),
        endTime: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag: '30'
      })
    }
    if (mean == "365") {
      this.setData({
        startTime: this.dateFormat("yyyy-MM-dd", 365),
        endTime: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag: '365'
      })
    }
  },
  resetRule: function (event) {
    for (var i = 0; i < this.data.organizationListFlag.length; i++) {
      this.data.organizationListFlag[i] = false;
    }
    this.setData({
      isAllStore: false,
      selectFilterId:'',
      amount: '0.00',
      startTime: '',
      endTime: '',
      currentTime: this.dateFormat("yyyy-MM-dd", 0),
      currentDateFlag: '',
      organizationListFlag: this.data.organizationListFlag
    })
  },
  getAllFilter: function (event) {
    var selectFilterId=[]
    for (var i = 0; i < this.data.organizationList.length; i++) {
      if (this.data.organizationListFlag[i]){
        selectFilterId.push(this.data.organizationList[i].organizationid)
      }
    }
    if (selectFilterId.length==0){
      selectFilterId='';
    }else{
      this.setData({
        selectFilterId: selectFilterId
      })
    }
  },
  sureFilter: function (event) {
    this.getAllFilter();
    if (this.data.orderStatu==''){
      this.getOrderList();
    }else{
      this.getOrderList2();
    }
    this.setData({
      search_flag: false,
      rule_flag: false
    })
  },
  priceDateFormat: function (){
    for (var i = 0; i < this.data.orderData.length; i++){

    }
  },
  hideSearchBox: function () {
    this.setData({
      keyword: '',
      satusShowFlag: true,
      search_flag: false
    })
    this.getOrderList();
  }
})
