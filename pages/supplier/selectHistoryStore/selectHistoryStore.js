const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    orderStatu: '',
    openId: "",
    eId: '',
    orgno: '',
    priceData: [],
    startTime: '',
    endTime: '',
    currentDateFlag: '',
    saveFlag: false,
    customerId: ''
  },
  onLoad: function (option) {
    this.setData({
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
        vm.getPriceList();
      }
    })
    wx.setStorage({
      key: "historyPriceDeital",
      data: {
        historyPriceDeital: {}
      }
    })
  },
  initData: function () {

  },
  getPriceList: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getBasePrice', //仅为示例，并非真实的接口地址
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
          vm.setData({
            priceData: res.data.date
          });
        }
      }, error: function (res) {
      }
    })
  },
  formatData: function (data) {
    var vm = this;
    for (var i = 0; i < data.length; i++) {
      if (data[i].startPeriod) {
        data[i].startPeriod = vm.format(new Date(data[i].startPeriod));
      } else {
        data[i].startPeriod = null;
      }
      if (data[i].createTime) {
        data[i].createTime = vm.format2(new Date(data[i].createTime));
      } else {
        data[i].createTime = null;
      }
      if (data[i].endPeriod) {
        data[i].endPeriod = vm.format(new Date(data[i].endPeriod));
      } else {
        data[i].endPeriod = null;
      }
    }
    this.setData({
      priceData: data
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
    var curTime = date.getFullYear() + "/" + month + "/" + day;
    //+ " " + hour + ":" + minute;//+ ":" + second;

    return curTime;
  },
  format2: function (fmt) { //author: meizz 
    var vm = this;
    var date = fmt;//当前时间  
    var month = vm.zeroFill(date.getMonth() + 1);//月  
    var day = vm.zeroFill(date.getDate());//日  
    var hour = vm.zeroFill(date.getHours());//时  
    var minute = vm.zeroFill(date.getMinutes());//分  
    var second = vm.zeroFill(date.getSeconds());//秒  

    //当前时间  
    var curTime = date.getFullYear() + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;

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
  jumpLink: function (event) {
    var storeId = event.currentTarget.dataset.storeid;
    wx.navigateTo({
      url: '../lookHistoryPrice/lookHistoryPrice?customerId=' + this.data.customerId + '&storeId=' + storeId
    })
  }
})