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
    itemTypeData:[],
    itemTypeValueData:[],
    itemcode1: '',
    itemcode2: '',
    itemname1: '',
    itemname2: '',
    currentItem:0,
    
  },
  onLoad: function (option) {
    this.setData({
      itemcode1: option.itemcode1,
      itemcode2: option.itemcode2,
      itemname1: option.itemname1,
      itemname2: option.itemname2
    })
  },
  onReady: function () {
  },
  onShow: function () {
    this.initData();
    var vm = this;
    this.data.firstLoad = false;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.orgno = res.data.orgno;
        vm.getItemType();
      }
    })
  },
  initData: function () {
    
  },
  getItemType: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getCategorys', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId
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
          vm.setData({
            itemTypeData: res.data.data,
            itemTypeValueData: res.data.data[0].childrenList
          })
          //vm.formatData();
        }

      }, error: function (res) {
      }
    })
  },
  changeItemValue: function (event) {
    var index = event.currentTarget.dataset.index;
    this.setData({
      currentItem: index,
      itemTypeValueData: this.data.itemTypeData[index].childrenList
    })
  },
  saveItemValue: function (event) {
    var index = event.currentTarget.dataset.index;
    var item = {};
    item.itemcode1 = this.data.itemTypeData[this.data.currentItem].id;
    item.itemcode2 = this.data.itemTypeData[this.data.currentItem].childrenList[index].id;
    item.itemname1 = this.data.itemTypeData[this.data.currentItem].itemcategoryname;
    item.itemname2 = this.data.itemTypeData[this.data.currentItem].childrenList[index].itemcategoryname;
    wx.setStorage({
      key: "currentItemTypeData",
      data: {
        currentItemTypeData: item
      }
    })
    wx.navigateBack({
      delta: 1
    })
  }
})
