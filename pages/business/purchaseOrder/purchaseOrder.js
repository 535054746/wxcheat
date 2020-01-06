//index.js
//获取应用实例
const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    openId: "",
    eId: '',
    orgno: '',
    organizationid: '',

    checkRedCount:0,

    isHasNextPage:true,

    orderData: [],//订单列表

    search_flag: false,//控制搜索窗口
    rule_flag: false,//控制筛选窗口
    supplier_flag: true,
    order_flag: false,
    ship_flag: false,

    isAllStore: false,//筛选中的全选门店

    currentDateFlag: '',//筛选中的收货时间
    currentOrderDate: '',//筛选中的下单时间
    customerData: [],//筛选中的列表

//接口入参
    keyword: '',//搜索关键字
    appstatus: '',//按状态过滤 ""为全部,0 已下单,1待验收,4已完成
    isAllDept: '1',//0 单选 1 所有部门
    deptId: '',
    startTime: '',
    endTime: '',
    orderStartTime: '',
    orderEndTime: '',
    pageIndex:1,//分页下标

    scrollHeight:0,
    
    isRefresh:false,
    refreshText:'下拉加载',
    loadMoreText: '正在加载',
    isLoadMore:false,
    scrollTop:0,

    orderRedCount:0,
    footerData: {
      number: 0,
      orderRedCount:0,
      status: 3
    },

    tipFalg: false,
    tipText: '',
    timeOutObj: null,

    windowHeight:400,
  },
  changeStatu: function (event) {//选择订单类型
    wx.showLoading({
      title: '加载中',
    });
    var state = event.currentTarget.dataset.orderStatu;
    this.setData({
      appstatus: state,
      pageIndex:1,
      orderData: [],
      isHasNextPage: false
    });
    this.resetRule();
    this.getOrderList(true);

  },
  onPullDownRefresh: function () {//下拉刷新
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.setData({ isRefresh:true, refreshText: '正在刷新' })
    var vm = this;
    vm.getOrderList(true);
  },
  onReady: function () {
    console.log(common.toDecimal2(2));
    var vm = this;
    wx.getSystemInfo({
      success: function (res) { vm.setData({ windowHeight:res.windowHeight});console.log(res.windowHeight) },
    })
  },
  onShow: function () {
    wx.showLoading({
      title: '加载中',
    });
    //this.initData();
    var vm = this;
    wx.getSystemInfo({
      success: function(res) {
        console.log(res.screenHeight);
        vm.setData({ scrollHeight: res.screenHeight})
      },
    })
    wx.getStorage({
      key: 'userInfo',
      success: function (res) {
        vm.data.orgno = res.data.user.orgno;
        vm.data.organizationid = res.data.user.organizationid;
        wx.getStorage({
          key: 'supplierInfo',
          success: function (res) {
            vm.data.openId = res.data.openId;
            vm.data.eId = res.data.eid;
            vm.data.isRefresh = true;
            vm.getOrderList(true);
            vm.getCustomer();
            app.getRedCount(vm.data.eId, vm.data.orgno, vm.data.openId,function(count){
              console.log("Callback:cound="+count);
              if(count==undefined)
                count = 0;
              vm.setData({ checkRedCount:count});
            });
          }
        })
      },
    })
  },

  initData: function () {
    this.setData({
      appstatus: '',
      openId: "",
      eId: '',
      orderData: [],
      search_flag: false,
      rule_flag: false,
      startTime: '',
      endTime: '',
      currentTime: this.dateFormat("yyyy-MM-dd", 0),
      currentDateFlag: '',
    currentOrderDate: '',
    })
  },
  
  getOrderList: function (removeData) {//获取订单列表(全部)
    var vm = this;
    var url = app.globalData.url;
    var deptId = '';
    if(vm.data.deptId!=''){
      deptId = vm.data.deptId.join(",");
    }
    wx.request({
      url: url + 'order/getList', //仅为示例，并非真实的接口地址
      data: {
        openId:vm.data.openId,
        keyword: vm.data.keyword,
        deptId: deptId,
        aogStart: vm.data.startTime,
        aogEnd: vm.data.endTime,
        placeStart: vm.data.orderStartTime,
        placeEnd: vm.data.orderEndTime,
        billType: 0,
        billstatus: vm.data.appstatus,
        pageNo: vm.data.pageIndex,
        pageSize: '20',
        source: 'wx',
        organizationid: vm.data.organizationid
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno,
        organizationid: vm.data.organizationid
      },
      method: 'get',
      success: function (res) {
        wx.stopPullDownRefresh();
        vm.setData({ refreshText: '下拉加载',})
        wx.hideNavigationBarLoading();
        wx.hideLoading();
        if (res.data.code == '1') {
          console.log(res);
          vm.formatData(res.data.data, removeData);
          vm.setData({ isHasNextPage: res.data.data.hasNextPage});
          console.log('isHasNextPage:' + vm.data.isHasNextPage);
        }else{
          vm.showTips(res.data.message);
        }

      }, error: function (res) {
        wx.stopPullDownRefresh();
        wx.hideNavigationBarLoading();
        wx.hideLoading();
        console.log(321);
      }
    })
  },

  getCustomer: function () {//获取供应商列表
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'customer/getCustomerList', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        businessType: 1
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
        if (res.data.code == '1') {
          if (vm.data.customerData.length == 0) {
            vm.setData({
              customerData: res.data.data,
            });
          }
        }else{
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
        console.log(res.data);
      }
    })
  },

  formatData: function (data, removeData) {

    var vm = this;
    if (removeData){
      var orderData = [];
    }else{
      var orderData = vm.data.orderData;
    }
    
    for (var i = 0; i < data.list.length; i++) {
      data.list[i].billdate = vm.format(new Date(data.list[i].billdate));
      orderData.push(data.list[i]);
    }
    console.log(data.list)
    this.setData({
      orderData: orderData,
      isLoadMore: false,
      isRefresh:false
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

  changeSearchFlag: function () {//控制搜索窗口显示
    if (this.data.search_flag) {
      wx.showLoading({
        title: '加载中',
      });
      this.setData({
        keyword: '',
        search_flag: false
      })
      this.getOrderList(true);
    } else {
      this.setData({
        keyword:'',
        search_flag: true
      })
    }
  },
  changeFilterFlag: function () {//控制筛选窗口显示
    if (this.data.rule_flag) {
      this.setData({
        rule_flag: false
      })
    } else {
      this.setData({
        rule_flag: true
      })
    }
    //this.resetRule();
  },

  searchInput: function (e) {//搜索输入框
    wx.showLoading({
      title: '加载中',
    });
    this.setData({
      keyword: e.detail.value,
      pageIndex: 1,
    })
    this.getOrderList(true);
  },

  clearInput: function () {//清空搜索输入框
    if(this.data.keyword!=''){
      this.setData({
        keyword: '',
        pageIndex: 1,
      });
      this.getOrderList(true);
    }
  },

  saveStoreId: function (event) {//筛选供应商列表点击事件
    var index = parseInt(event.currentTarget.dataset.index);
    var customerData = this.data.customerData;
    customerData[index].isSelected = customerData[index].isSelected == undefined ? true : !customerData[index].isSelected;
    this.setData({ customerData: customerData});
    this.checkIsAll();
  },

  checkIsAll: function (event) {//是否全选门店
    var customerData = this.data.customerData;
    var deptId = [];
    var isAll = true;
    for(var i = 0;i<customerData.length;i++){
      if(customerData[i].isSelected==undefined||customerData[i].isSelected==false){
        isAll = false;
      }else{
        deptId.push(customerData[i].id);
      }
    }
    this.setData({ isAllStore: isAll, deptId: deptId.length==0?'':deptId, isAllDept:isAll?'1':'0'});
  },

  selectAllStore: function () {//全部门店点击事件
    var customerData = this.data.customerData;
    var dept = [];
    var vm =this;
    var isSelected = !vm.data.isAllStore;
    for (var i = 0; i < customerData.length; i++) {
      customerData[i].isSelected = isSelected;
      if(isSelected==true){
        dept.push(customerData[i].id);
      }
    }
    this.setData({ isAllStore: isSelected, customerData: customerData, deptId:dept})
  },

  bindDateChange: function (event) {//筛选收货时间
    var mean = parseInt(event.currentTarget.dataset.mean);
    if (mean == "0") {
      this.setData({
        startTime: event.detail.value
      })
    } else {
      this.setData({
        endTime: event.detail.value
      })
    }
  },

  bindDateChange2: function (event) {//筛选下单时间
    var mean = parseInt(event.currentTarget.dataset.mean);
    if (mean == "0") {
      this.setData({
        orderStartTime: event.detail.value
      })
    } else {
      this.setData({
        orderEndTime: event.detail.value
      })
    }
  },

  changeTime: function (event) {//筛选收货时间
    var mean = parseInt(event.currentTarget.dataset.mean);
    if (mean == "0") {
      this.setData({
        startTime: this.dateFormat("yyyy-MM-dd", 0),
        endTime: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag: '0'
      })
    }
    if (mean == "7") {
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

  changeTime2: function (event) {//筛选下单时间
    var mean = parseInt(event.currentTarget.dataset.mean);
    if (mean == "0") {
      this.setData({
        orderStartTime: this.dateFormat("yyyy-MM-dd", 0),
        orderEndTime: this.dateFormat("yyyy-MM-dd", 0),
        currentOrderDate: '0'
      })
    }
    if (mean == "7") {
      this.setData({
        orderStartTime: this.dateFormat("yyyy-MM-dd", 6),
        orderEndTime: this.dateFormat("yyyy-MM-dd", 0),
        currentOrderDate: '7'
      })
    }
    if (mean == "30") {
      this.setData({
        orderStartTime: this.dateFormat("yyyy-MM-dd", 30),
        orderEndTime: this.dateFormat("yyyy-MM-dd", 0),
        currentOrderDate: '30'
      })
    }
    if (mean == "365") {
      this.setData({
        orderStartTime: this.dateFormat("yyyy-MM-dd", 365),
        orderEndTime: this.dateFormat("yyyy-MM-dd", 0),
        currentOrderDate: '365'
      })
    }
  },

  dateFormat: function (fmt, day) {
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

  resetRule: function (event) {//筛选的重置
    var customerData = this.data.customerData;
    for (var i = 0; i < customerData.length; i++) {
      customerData[i].isSelected = false;
    }
    this.setData({
      keyword:'',
      isAllStore: false,
      startTime: '',
      endTime: '',
      orderStartTime: '',
      orderEndTime: '',
      currentTime: this.dateFormat("yyyy-MM-dd", 0),
      currentDateFlag: '',
      currentOrderDate:'',
      customerData: customerData,
      deptId:'',
      isAllDept:1,
    })
  },

  sureFilter: function (event) {//筛选的确认
    this.setData({
      search_flag: false,
      rule_flag: false,
      pageIndex:1,
      orderData:[],
    })
    this.getOrderList(true);
  },

  jumpLink2: function (event) {//跳转页面
    var index = parseInt(event.currentTarget.dataset.index);
    var suplierId = event.currentTarget.dataset.suplierid;
    var suplierName = event.currentTarget.dataset.supliername;
    var phone = event.currentTarget.dataset.phone;
    var person = event.currentTarget.dataset.person;
    console.log(suplierId);
    var vm=this;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?id=' + vm.data.orderData[index].id + '&suplierId=' + suplierId + '&suplierName=' + suplierName + '&person=' + person +'&phone='+phone
    })
  },

  bindScroll:function(event){
    wx.startPullDownRefresh({
      success:function(res){
        console.log(res);
      }
    })
  },

  myscrolltolower:function(){//加载更多订单
    var vm = this;
    if (vm.data.isHasNextPage) {
      if (!vm.data.isLoadMore) {
        vm.setData({ pageIndex: parseInt(vm.data.pageIndex + 1), isLoadMore: true });
        console.log(vm.data.pageIndex);
        setTimeout(function () { vm.getOrderList(false) }, 100);
      }
    }
  },

  jumpLink: function (event) {
    var vm = this;
    var url = event.currentTarget.dataset.url;
    wx.redirectTo({ url: url });
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

  folding:function(e){
    var foldType = e.currentTarget.dataset.type;
    if(foldType=='supplier')
      this.setData({ supplier_flag: !this.data.supplier_flag });
    else if (foldType == 'order')
      this.setData({ order_flag: !this.data.order_flag });
    else if (foldType == 'ship')
      this.setData({ ship_flag: !this.data.ship_flag });
  },
})
