const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    orderStatu: '',
    openId: "",
    eId: '',
    orgno: '',
    priceData: [],
    shopType: [],
    shopData: [],
    startTime: '',
    endTime: '',
    currentDateFlag: '',
    saveFlag: false,
    historyPriceDeital:'',
    currentItemType:0,
    companyName:'',
    customerId:'',
    pricePlanId:'',
    deleted:1
  },
  onLoad: function(option){
    this.setData({
      pricePlanId: option.pricePlanId
    })
    
  },
  onReady: function () {

  },
  onShow: function () {
    var vm = this;
    this.data.firstLoad = false;
    if (this.data.pricePlanId){
      wx.getStorage({
        key: 'supplierInfo',
        success: function (res) {
          vm.data.openId = res.data.openId;
          vm.data.eId = res.data.eid;
          vm.data.orgno = res.data.orgno;
          vm.data.deleted = 0;
          vm.getShopType();
          vm.getCompanyDetail();
        }
      })
    }else{
      wx.getStorage({
        key: 'historyPriceDeital',
        success: function (res) {
          console.log(res)
          vm.setData({
            historyPriceDeital: res.data.historyPriceDeital,
            pricePlanId: res.data.historyPriceDeital.id
          });
          wx.getStorage({
            key: 'supplierInfo',
            success: function (res) {
              console.log(res);
              vm.data.openId = res.data.openId;
              vm.data.eId = res.data.eid;
              vm.data.orgno = res.data.orgno;
              vm.setData({
                companyName: res.data.companyName
              });
              vm.getShopType();
            }
          })
        }
      })
    }
    
    
   
  },
  initData: function () {

  },
  getShopType: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getOneLevelPrice', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        pricePlanId: vm.data.pricePlanId,
        deleted: vm.data.deleted
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
          vm.setData({
            shopType: res.data.data
          })
          vm.getShopData();
        }
      }, error: function (res) {
      }
    })
  },
  getShopData: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getTwoLevelPrice', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        itemcategoryid1: vm.data.shopType[vm.data.currentItemType].itemcategoryid1,
        pricePlanId: vm.data.pricePlanId,
        deleted: vm.data.deleted
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
          vm.setData({
            shopData: res.data.data
          })
        }
      }, error: function (res) {
      }
    })
  },
  formatData: function (data) {
    var vm = this;
    for (var i = 0; i < data.length; i++) {
      if (data[i].default) {
        if (data[i].default.startPeriod) {
          data[i].default.startPeriod = vm.format(new Date(data[i].default.startPeriod));
        } else {
          data[i].default.startPeriod = null;
        }
        if (data[i].default.endPeriod) {
          data[i].default.endPeriod = vm.format(new Date(data[i].default.endPeriod));
        } else {
          data[i].default.endPeriod = null;
        }

      }
      if (data[i].next) {
        if (data[i].next.startPeriod) {
          data[i].next.startPeriod = vm.format(new Date(data[i].next.startPeriod));
        } else {
          data[i].next.startPeriod = null;
        }
        if (data[i].next.endPeriod) {
          data[i].next.endPeriod = vm.format(new Date(data[i].next.endPeriod));
        } else {
          data[i].next.endPeriod = null;
        }
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
    var index = event.currentTarget.dataset.index;

    wx.setStorage({
      key: "historyPriceDeital",
      data: {
        historyPriceDeital: this.data.priceData[index].default
      }
    })
    wx.navigateTo({
      url: '../quotationDetails/quotationDetails'
    })
  },
  changeItemcategory: function (event) {
    var index = event.currentTarget.dataset.index;
    this.setData({
      currentItemType: index
    })
    this.getShopData();
  },
  getCompanyDetail: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getPricePlanInfo', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        id: vm.data.pricePlanId
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'get',
      success: function (res) {
        console.log(res);
        if (res.data.code == "1") {
          if (res.data.data.createTime) {
            res.data.data.createTime = vm.format(new Date(res.data.data.createTime));
          }
          if (res.data.data.startPeriod) {
            res.data.data.startPeriod = vm.format2(new Date(res.data.data.startPeriod));
          }
          if (res.data.data.endPeriod) {
            res.data.data.endPeriod = vm.format2(new Date(res.data.data.endPeriod));
          }
          vm.setData({
            historyPriceDeital: res.data.data,
            companyName: res.data.data.customerName
          })
        }

      }, error: function (res) {
      }
    })
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
    var curTime = date.getFullYear() + "/" + month + "/" + day

    return curTime;
  }
})





