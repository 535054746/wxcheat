//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    orderStatu: '',
    openId:"",
    eId:'',
    orderData: [],
    firstLoad: true,
    loginOutShowFlag:false,
    loginOutIconFlag: false
  },
  changeStatu: function (event){
    this.setData({
      orderStatu: event.target.dataset.orderStatu,
      orderData: []
    })
    this.getOrderList();
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
  onReady: function(){
    var vm = this;
    this.data.firstLoad = false;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.getOrderList();
      }
    })
    
  },
  onShow: function () {
    console.log(this.data.firstLoad);
    if (!this.data.firstLoad) {
      this.getOrderList();
    }

  },
  getOrderList: function(){
    var vm=this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/order/getOrderList', //仅为示例，并非真实的接口地址
      data: {
        id: vm.data.openId,
        keyword: '',
        appstatus: vm.data.orderStatu
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'get',
      success: function (res) {
        if(res.data.code=='1'){
          vm.formatData(res.data.data);
        }
        
      },error: function (res) {
      }
    })
  },
  formatData: function(data){
    
    var vm = this;
    var item=null;
    var order=[];
    for(var i=0; i<data.length; i++){
      item=data[i]
      var time = vm.format(new Date(item.createtime));
      item.createtime = time;
      order.push(item);
      
    }
    this.setData({
      orderData: order
    });
  },
  format: function (fmt) { //author: meizz 
    var vm=this; 
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
  zeroFill: function(i){  
    if(i >= 0 && i <= 9) {
      return "0" + i;
    } else {  
      return i;  
    }
  },
  clickJumpDetail: function (event){
    var orderId = event.currentTarget.dataset.id;
    var createtime = event.currentTarget.dataset.createtime;
    var ordercode = event.currentTarget.dataset.ordercode;
    var storename = event.currentTarget.dataset.storename;
    var createusername = event.currentTarget.dataset.createusername;
    var appstatus = event.currentTarget.dataset.appstatus;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?id=' + orderId + "&createtime=" + createtime + "&ordercode=" + ordercode + "&storename=" + storename + "&createusername=" + createusername + "&appstatus=" + appstatus
    })
  },
  loginOutShow: function(event){
    var vm = this; 
    vm.setData({
      loginOutIconFlag: true
    })
    setTimeout(function(){
      vm.setData({
        loginOutShowFlag: true,
        loginOutIconFlag: false
      })
    },200);
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
  getBaseData: function (event) {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getBaseData', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        data: [{
          "type": "0",
          "version": 7
        }]
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'post',
      success: function (res) {
        if (res.data.code == '1') {
          vm.formatData(res.data.data);
        }

      }, error: function (res) {
      }
    })
  }
})
