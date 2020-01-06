//index.js
//获取应用实例
const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    orderStatu: '',
    openId: "",
    orgno:'',
    eId: '',
    total:'',
    orderData: [], 
    customerData:[],
    customerDataFlag:[],
    selectFilterId:"",
    storeData:[],
    satusShowFlag:true,
    isAllSelect:false,
    keyword:'',
    appstatus:'',
    isAllDept: 1,
    deptId:"",
    aogStart: '',
    aogEnd: '',
    placeStart: '',
    placeEnd: '',
    storeId: '',
    firstLoad: true,
    loginOutShowFlag: false,
    loginOutIconFlag: false,
    search_flag:false,
    rule_flag:false,
    currentDateFlag:'',
    currentDateFlag2: '',
    orderDataIdFlag: [],
    loading: false,
    tipFalg: false,
    tipText: '',
    allDeliverTipFlag:false,
    timeObj: null,
    searchOrderFlag:true,
    screenHeight: wx.getSystemInfoSync().windowHeight - 80,
    hasNextPage:true,
    pageNo: 0,
    pageSize: 20,
    refreshFlag:false,
    itemnums:{},
    allShip:false,
    pageBgFlag:false

  },
  changeStatu: function (event) {
    var state = event.target.dataset.orderStatu;
    this.setData({
      orderStatu: state,
      orderData: [],
      pageNo: 0,
    })
    this.getOrderList();
    
  },
  onShow: function () {
    var vm = this;
    var vm = this;
    this.data.firstLoad = false;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.orgno = res.data.orgno;
      }
    })
    wx.getStorage({
      key: 'currentTab',
      success: function (res) {
        var statu = res.data.statu;
        if (statu) {
          vm.setData({
            orderStatu: statu,
            orderData:[],
            orderDataIdFlag:[]
          })
          vm.getOrderList();
        }
      }
    })
    wx.setStorage({
      key: 'currentTab',
      data: ''
    })
  },
  onReady: function () {
    this.initData();
    var vm = this;
    this.data.firstLoad = false;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.orgno = res.data.orgno;
        vm.getOrderList();
        vm.getCustomer();
      }
    })
    
  },
  initData: function(){
    
  },
  getOrderList: function () {
    var vm = this;
    var url = app.globalData.url;
    this.setData({
      loading:true
    })
    wx.request({
      url: url + 'order/getList', //仅为示例，并非真实的接口地址
      data: { 
        openId: vm.data.openId,
        keyword: vm.data.keyword,
        billstatus: vm.data.orderStatu,
        isAllDept: vm.data.isAllDept,
        //deptId: vm.data.selectFilterId,
        aogStart: vm.data.aogStart,
        aogEnd: vm.data.aogEnd,
        placeStart: vm.data.placeStart,
        placeEnd: vm.data.placeEnd,
        storeid: vm.data.selectFilterId,
        billType: 1, 
        pageNo: vm.data.pageNo,
        pageSize: vm.data.pageSize,
        source:'wx'
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'post', 
      success: function (res) {
        vm.setData({
          loading: false
        })
        console.log(res);
        if (res.data.code == '1') {
          vm.formatData(res.data.data.list);
          vm.setData({
            pageBgFlag:true,
            hasNextPage: res.data.data.hasNextPage
          })
          vm.getTotalNumber();
          vm.getTotalNumber2();
        }else{
          vm.showTips(res.data.message);
          vm.setData({
            pageBgFlag: true
          })
        }

      }, fail: function (res) {
        vm.setData({
          pageBgFlag: true,
          loading: false
        })
      }
    })
  },
  formatData: function (data) {

    var vm = this;
    var order = [];
    this.data.orderDataIdFlag=[];
    this.data.orderData=[];
    for (var i = 0; i < data.length; i++) {
      data[i].billdate = vm.format(new Date(data[i].billdate));
      data[i].createtime = vm.format(new Date(data[i].createtime));
      this.data.orderDataIdFlag.push(false);
    }
    if (this.data.allShip){
      this.setData({
        isAllSelect: false,
        allShip:false,
        orderDataIdFlag: this.data.orderDataIdFlag,
        orderData:data
      });
    }else{
      this.setData({
        isAllSelect: false,
        orderDataIdFlag: this.data.orderDataIdFlag,
        orderData: this.data.orderData.concat(data)
      });
    }
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
    wx.navigateTo({
     url: '../orderDetail/orderDetail?id=' + orderId
    })
    
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
    var mean = parseInt(event.currentTarget.dataset.mean);
    if (this.data.orderDataIdFlag[mean]){
      this.data.orderDataIdFlag[mean] = false;
      this.data.isAllSelect=false;
    }else{
      this.data.orderDataIdFlag[mean] = true;
    }
    this.setData({
      orderDataIdFlag: this.data.orderDataIdFlag,
      isAllSelect: this.data.isAllSelect,
    })
    this.isAll2();
  },
  jumpShopSymmary: function (event) {
    // var vm = this;
    // var url = app.globalData.url;
    // vm.getSelectId();
    // wx.request({
    //   url: url + 'srm/statement/buildStm',
    //   data: {
    //     openId: vm.data.openId,
    //     rkdList: this.data.selectId,
    //     selectAll: '0',
    //     storeId: this.data.selectStoreId
    //   },
    //   dataType: 'json',
      // header: {
      //   "Content-Type": "application/json",
      //   eId: vm.data.eId
      // },
      // method: 'post',
      // success: function (res) {
        // console.log(res);
        // if (res.data.code == '1') {
          var idList = [];
          for (var i = 0; i < this.data.orderData.length; i++) {
            if (this.data.orderDataIdFlag[i]) {
              idList.push(this.data.orderData[i].id);
            }
          }
          if (idList.length == 0) {
            this.showTips("请至少选择一个订单");
            return;
          }
          wx.setStorage({
            key: 'idList',
            data: idList
          })
          wx.navigateTo({
            url: '../shopSummary/shopSummary' 
          })
        // }

      // }, error: function (res) {
      // }
    // })
  },
  getSelectId: function(){
    if (this.data==null||this.data.orderDataId==null){
      return;
    }
    for (var i = 0; i < this.data.orderDataId.length; i++){
      if (this.data.orderDataIdFlag[i]){
        this.data.selectId.push(this.data.orderDataId[i]);
        this.data.selectStoreId.push(this.data.storeId[i]);
      }
    }
  },
  isAll: function () {
    var isAll=true;
    for (var i = 0; i < this.data.customerDataFlag.length; i++) {
      if (!this.data.customerDataFlag[i]) {
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
  isAll2: function () {
    var isAll = true;
    console.log(this.data.orderDataIdFlag);
    for (var i = 0; i < this.data.orderDataIdFlag.length; i++) {
      if (!this.data.orderDataIdFlag[i]) {
        isAll = false;
      }
    }
    if (isAll) {
      this.setData({
        isAllSelect: true
      })
    } else {
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
      })
    }else{
      this.setData({
        isAllSelect: true,
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
    wx.request({
      url: url + 'srm/statement/buildStm', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        rkdList: this.data.selectId,
        selectAll: '0',
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
        if (res.data.code == '1') {
          wx.navigateTo({
            url: '../statementedDetail/statementedDetail?id=' + res.data.data[0]
          })
        }

      }, error: function (res) {
      }
    })
  },
  changeSearchFlag: function () {
    if (this.data.search_flag){
      this.setData({
        searchOrderFlag: false,
        search_flag: false
      })
    }else{
      this.setData({
        searchOrderFlag:true,
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
      searchOrderFlag: false,
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
    if (this.data.isAllSelect) {
      this.setData({
        isAllSelect: false
      })
    } else {
      this.setData({
        isAllSelect: true
      })
    }
    for (var i = 0; i < this.data.customerDataFlag.length; i++) {
      if (this.data.isAllSelect) {
        this.data.customerDataFlag[i] = true;
      } else {
        this.data.customerDataFlag[i] = false;
      }
    }
    this.setData({
      customerDataFlag: vm.data.customerDataFlag
    })
  },
  bindDateChange: function (event) {
    var mean = parseInt(event.currentTarget.dataset.mean);
    if(mean=="0"){
      this.setData({
        aogStart: event.detail.value
      })
    }else{
      this.setData({
        aogEnd: event.detail.value
      })
    }
  },
  bindDateChange2: function (event) {
    var mean = parseInt(event.currentTarget.dataset.mean);
    if (mean == "0") {
      this.setData({
        placeStart: event.detail.value
      })
    } else {
      this.setData({
        placeEnd: event.detail.value
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
        aogStart: this.dateFormat("yyyy-MM-dd", 0),
        aogEnd: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag:'0'
      })
    }
    if (mean == "7"){
      this.setData({
        aogStart: this.dateFormat("yyyy-MM-dd", 6),
        aogEnd: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag: '7'
      })
    }
    if (mean == "30") {
      this.setData({
        aogStart: this.dateFormat("yyyy-MM-dd", 30),
        aogEnd: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag: '30'
      })
    }
    if (mean == "365") {
      this.setData({
        aogStart: this.dateFormat("yyyy-MM-dd", 365),
        aogEnd: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag: '365'
      })
    }
  },
  changeTime2: function (event) {
    var mean = parseInt(event.currentTarget.dataset.mean);
    if (mean == "0") {
      this.setData({
        placeStart: this.dateFormat("yyyy-MM-dd", 0),
        placeEnd: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag2: '0'
      })
    }
    if (mean == "7") {
      this.setData({
        placeStart: this.dateFormat("yyyy-MM-dd", 6),
        placeEnd: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag2: '7'
      })
    }
    if (mean == "30") {
      this.setData({
        placeStart: this.dateFormat("yyyy-MM-dd", 30),
        placeEnd: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag2: '30'
      })
    }
    if (mean == "365") {
      this.setData({
        placeStart: this.dateFormat("yyyy-MM-dd", 365),
        placeEnd: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag2: '365'
      })
    }
  },
  resetRule: function (event) {
    for (var i = 0; i < this.data.customerDataFlag.length; i++) {
      this.data.customerDataFlag[i] = false;
    }
    this.setData({
      isAllSelect: false,
      aogStart: '',
      aogEnd: '',
      placeStart: '',
      placeEnd: '',
      currentTime: this.dateFormat("yyyy-MM-dd", 0),
      currentDateFlag: '',
      currentDateFlag: 2,
      customerDataFlag: this.data.customerDataFlag
    })
  },
  getAllFilter: function (event) {
    console.log(this.data.customerDataFlag);
    var selectFilterId=[]
    for (var i = 0; i < this.data.customerData.length; i++) {
      if (this.data.customerDataFlag[i]){
        selectFilterId.push(this.data.customerData[i].storeid)
      }
    }
    if (selectFilterId.length==0){
      selectFilterId='';
    }
    this.setData({
      selectFilterId: selectFilterId
    })
  },
  sureFilter: function (event) {
    this.getAllFilter();
    this.getOrderList();
    this.setData({
      search_flag: false,
      rule_flag: false
    })
  },
  hideSearchBox:function(){
    this.setData({
      keyword:'',
      satusShowFlag: true,
      search_flag: false
    })
    this.getOrderList();
  },
  searchSure: function () {
    this.setData({
      searchOrderFlag: false,
      satusShowFlag:false
    })
    this.getOrderList(); 
  },
  getCustomer: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'customer/getCustomerList', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        businessType:0
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'get',
      success: function (res) {
        if (res.data.code == "1") {
          vm.setData({
            customerData: res.data.data
          })
          vm.customerDataFlagFormat();
          console.log(res.data);

        } else {

        }
      }, error: function (res) {
      }
    })
  },
  customerDataFlagFormat: function(data){
    for (var i = 0; i < this.data.customerData.length; i++) {
      this.data.customerDataFlag.push(false);
    }
    this.setData({
      customerDataFlag: this.data.customerDataFlag
    })
  },
  saveStoreId:function(event){
    var index = parseInt(event.currentTarget.dataset.index);
    if (this.data.customerDataFlag[index]){
      this.data.customerDataFlag[index]=false;
    }else{
      this.data.customerDataFlag[index] = true;
    }
    this.setData({
      customerDataFlag: this.data.customerDataFlag
    })
    this.isAll();
  },
  allDeliverTip:function(){
    this.setData({
      allDeliverTipFlag: true
    })
  },
  allDeliver: function (event) {
    this.setData({
      allDeliverTipFlag: false
    })
    var idList=[];
    for (var i = 0; i < this.data.orderData.length;i++){
      if (this.data.orderDataIdFlag[i]){
        idList.push(this.data.orderData[i].id);
      }
    }
    if (idList.length==0){
      this.showTips("请至少选择一个订单");
      return;
    }
    this.setData({
      loading: true
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'order/orderDelivery', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        idList: idList
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'post',
      success: function (res) {
        vm.setData({
          loading: true
        })
        if (res.data.code == "1") {
          vm.setData({
            allShip: true
          })
          vm.getOrderList();
        }
      }, error: function (res) {
      }
    })
  },
  showTips: function (msg) {
    var vm = this;
    if (vm.data.timeObj) {
      clearTimeout(vm.data.timeObj);
    }
    vm.setData({
      tipFalg: true,
      tipText: msg
    })
    vm.data.timeObj = setTimeout(function () {
      vm.setData({
        tipFalg: false,
        tipText: ''
      })
    }, 1500);
  },
  cancelTip:function(){
    this.setData({
      allDeliverTipFlag:false
    })
  },
  lowerLoad:function() {
    if (this.data.orderStatu!="0"){
      if (this.data.hasNextPage){
        console.log(this.data.hasNextPage);
        this.setData({
          pageNo: this.data.pageNo+1,
        })
        this.getOrderList();
      }
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
      vm.setData({
        pageNo:0,
        orderDataIdFlag: [],
        orderData: []
      })
      vm.getOrderList();
    }, 1500);
  },
  getTotalNumber: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'permission/getUserPermission', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        businessType:0,
        type:2
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'get',
      success: function (res) {
        console.log(res);
        if(res.data.code=="1"){
          for (var i = 0; i < res.data.data.length;i++){
            for (var h = 0; h < res.data.data[i].childerList.length; h++) {
              if (res.data.data[i].childerList[h].name=="配送单"){
                vm.data.itemnums.sure = res.data.data[i].childerList[h].totalNumMap["2"];
                vm.setData({
                  itemnums: vm.data.itemnums
                })
              }
            }
          }
        }
        

      }, error: function (res) {
      }
    })
  },
  getTotalNumber2: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'order/getList', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        billstatus: 0,
        billType: 1,
        pageNo: vm.data.pageNo,
        pageSize: vm.data.pageSize,
        source: 'wx'
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'post',
      success: function (res) {
        if (res.data.code=="1"){
          vm.data.itemnums.ship = res.data.data.list.length;
          vm.setData({
            itemnums: vm.data.itemnums
          })
        }
        
      }, error: function (res) {
      }
    })
  }
})
