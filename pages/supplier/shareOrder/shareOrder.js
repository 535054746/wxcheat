const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    itemnumber: "",
    listId: "",
    eid:'',
    orderData: []
  },
  onLoad: function (option) {
    this.setData({
      listId: option.listId,
      itemnumber: option.itemnumber,
      eid: option.eid
    })
  },
  onReady: function () {
    this.getShopData();
  },
  initData: function () {

  },
  getShopData: function () {
    var vm = this;
    var url = app.globalData.url;
    var paramsid = this.data.listId.split(",");
    var itemnumber = this.data.itemnumber.substring(0, this.data.itemnumber.length-1).split(",");
    wx.request({
      url: url + 'order/getOrderDetailList', //仅为示例，并非真实的接口地址
      data: {
        paramsid: paramsid,
        itemnumber: itemnumber
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eid
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        res.data.creatTime = vm.format(new Data());
        vm.setData({
          orderData: res.data
        });
      }, error: function (res) {
      }
    })
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
  jumpLogin: function () {
    wx.redirectTo({
      url: '../../selectLoginType/selectLoginType'
    })
  }
})
