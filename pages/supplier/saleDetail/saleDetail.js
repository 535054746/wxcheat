const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    eid: '',
    openId: '',
    orgno: '',
    orderData: '',
    storeId: '',
    customerId: '',
    ckTipFalg: false,
    timeObj: null,
    tipText: ''
  },
  onLoad: function (option) {
    this.setData({
      storeId: option.storeId,
      customerId: option.customerId
    })
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
      url: url + 'order/getTodaySalesOrderDataByStore', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        storeId: vm.data.storeId,
        customerId: vm.data.customerId
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
        if(res.data.code=='1'){
          vm.setData({
            orderData: res.data.data
          });
        }else{
          vm.showTips(res.data.message);
        }
        
      }, fail: function (res) {
        vm.showTips(res);
      }
    })
  },
  jumpOrderDetail: function (event) {
    var id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?id='+id
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
