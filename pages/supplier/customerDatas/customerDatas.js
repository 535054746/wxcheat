const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    eid: '',
    openId:'',
    orgno:'',
    orderData:'',
    ckTipFalg: false,
    timeObj: null,
    tipText: ''
  },
  onLoad: function (option) {
    
  },
  onReady: function () {
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eid = res.data.eid;
        vm.data.orgno = res.data.orgno;
        vm.getShopData();
      }
    })
    
  },
  getShopData: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'order/getTodaySalesOrderData', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eid,
        orgno: vm.data.orgno
      },
      method: 'get',
      success: function (res) {
        console.log(res);
        if(res.data.code=="1"){
          vm.setData({
            orderData: res.data.data
          });
        }else{
          vm.showTips(res.data.message);
        }
        
        vm.formatData();
      }, fail: function (res) {
        vm.showTips(res);
      }
    })
  },
  formatData:function(){
    for (var i = 0; i < this.data.orderData.dataList.length;i++){
      this.data.orderData.dataList[i].flag=false;
    }
    this.setData({
      orderData: this.data.orderData
    })
  },
  jumpSaleDetail: function (event) {
    var customerId = event.currentTarget.dataset.customerid;
    var storeId = event.currentTarget.dataset.storeid;
    wx.navigateTo({
      url: '../saleDetail/saleDetail?customerId=' + customerId + "&storeId=" + storeId
    })
  },
  changeShow: function(event){
    var index = event.currentTarget.dataset.index;
    if (this.data.orderData.dataList[index].flag){
      this.data.orderData.dataList[index].flag = false;
    }else{
      this.data.orderData.dataList[index].flag = true;
    }
    this.setData({
      orderData: this.data.orderData
    })
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
  }
})
