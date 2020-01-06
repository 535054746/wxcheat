//index.js
//获取应用实例
const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    openId: "",
    priceId: '',
    priceStatus: '',
    eId: '',
    orgno: '',
    startTipFlag: false,
    deleteTipFlag: false,
    notTipFlag: false,
    customerId:'',
    ckTipFalg: false,
    timeObj: null,
    tipText: ''
  },
  onLoad: function (option) {
    this.setData({
      priceId: option.id,
      priceStatus: option.status,
      customerId: option.customerId
    })
  },
  onReady: function () {
  },
  onShow: function () {
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
  },
  initData: function () {
    
  },
  getOrderList: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/editPricePlan', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        id: '',
        startPeriod: '',
        endPeriod: '',
        status: '',
        deleted: ''
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        if (res.data.code == '1') {
          /*vm.setData({
            total: res.data.data.totalNum,
            totalAmount: common.toDecimal2(res.data.data.totalAmount)
          });
          vm.formatData(res.data.data);
          vm.resetRule();*/
        }

      }, error: function (res) {
      }
    })
  },
  deletePrice: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/editPricePlan', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        id: vm.data.priceId,
        startPeriod: '',
        endPeriod: '',
        status:'',
        deleted: 1
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        if (res.data.code == '1') {
          vm.cancelStart();
          wx.navigateBack({
            delta: 1
          })
        }else{
          vm.setData({
            notTipFlag: true
          })
        }

      }, error: function (res) {
      }
    })
  },
  startTap:function(){
    if (this.data.priceStatus==3){
      this.data.priceStatus=0;
    }else{
      this.data.priceStatus=3; 
    }
    this.setData({ 
      startTipFlag:false
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/editPricePlans', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        customerId: this.data.customerId,
        startPeriod: '',
        endPeriod: '',
        status: this.data.priceStatus,
        deleted: ''
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        if (res.data.code == '1') {
          vm.cancelStart();
          vm.setData({
            priceStatus: vm.data.priceStatus
          })
        }else{
          vm.showTips(res.data.message);
        }

      }, error: function (res) {
      }
    })
  },
  startTapTip: function () {
    if (this.data.priceStatus==3){
      this.startTap();
    }else{
      this.setData({
        startTipFlag: true
      })
    }
  },
  deleteTapTip: function () {
    this.setData({
      deleteTipFlag: true
    })
  },
  clickJumpHistory: function (event) {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getStore', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        customerId: vm.data.customerId
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'get',
      success: function (res) {
        if (res.data.code == '1') {
          if (res.data.date.length == 0) {
            wx.navigateTo({
              url: '../lookHistoryPrice/lookHistoryPrice?customerId=' + vm.data.customerId
            })
          } else {
            wx.navigateTo({
              url: '../selectHistoryStore/selectHistoryStore?customerId=' + vm.data.customerId
            })
          }
        }
      }, error: function (res) {
      }
    })

  },
  cancelStart: function () {
    this.setData({
      startTipFlag: false,
      deleteTipFlag: false,
      notTipFlag: false
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


