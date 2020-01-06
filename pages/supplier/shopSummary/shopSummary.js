const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    orderStatu: '',
    openId: "",
    eId: '',
    total: '',
    orderId: '',
    orderData: [],
    shopData:[],
    totalAmount: '',
    isAllSelect:false,
    ckTipFalg: false,
    timeObj: null,
    tipText: '',
    shareFlag:false,
    listId:[]
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
        vm.data.orgno = res.data.orgno,
          vm.getOrderList();
      }
    })
  },
  initData: function () {

  },

  getOrderList: function () {
    var vm = this;
    var url = app.globalData.url;
    var list_id = '';
    wx.getStorage({
      key: 'idList',
      success: function (res) {
        list_id = res.data.join(",");
        vm.setData({
          listId: list_id
        })
        wx.request({
          url: url + 'order/inItemSummary', //仅为示例，并非真实的接口地址
          data: {
            openId: vm.data.openId,
            id: list_id
          },
          dataType: 'json',
          header: {
            "Content-Type": "application/json",
            eId: vm.data.eId,
            orgno: vm.data.orgno
          },
          method: 'get',
          success: function (res) {
            vm.setData({
              shopData:res.data.data
            })
            vm.formatData();
          }, error: function (res) {
          }
        })
      }

    })
  },
  formatData:function(){
    for (var i = 0; i < this.data.shopData.length;i++){
      if (this.data.isAllSelect){
        this.data.shopData[i].select = true; 
      }else{
        this.data.shopData[i].select = false;
      }
    }
  },
  isAll:function(){
    var _flag=true;
    var shareFlag=false;
    for (var i = 0; i < this.data.shopData.length; i++) {
      if (!this.data.shopData[i].select){
        _flag=false;
      }else{
        shareFlag=true;
      }
    }
    if (shareFlag){
      this.setData({
        shareFlag: true
      })
    }else{
      this.setData({
        shareFlag: false
      })
    }
    if (_flag){
      this.setData({
        shopData: this.data.shopData,
        isAllSelect:true
      })
    }else{
      this.setData({
        shopData: this.data.shopData,
        isAllSelect: false
      })
    }
  },
  clickSelect: function (event) {
    var index = event.currentTarget.dataset.index;
    console.log(this.data.shopData);
    if (this.data.shopData[index].select){
      this.data.shopData[index].select=false;
    }else{
      this.data.shopData[index].select = true
    }
    this.isAll();
  },
  selectAll: function () {
    if (this.data.isAllSelect) {
      for (var i = 0; i < this.data.shopData.length; i++) {
        this.data.shopData[i].select = false;
      }
      this.setData({
        shopData: this.data.shopData,
        isAllSelect: false,
        shareFlag: false
      })
    } else {
      for (var i = 0; i < this.data.shopData.length; i++) {
        this.data.shopData[i].select = true;
      }
      this.setData({
        shopData: this.data.shopData,
        isAllSelect: true,
        shareFlag: true
      })
    }
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
  },
  deleteSelect: function (event) {
    var index = event.currentTarget.dataset.index;
    if (this.data.shopData.length==1){
      this.showTips("至少需要一个商品！");
    }else{
      this.data.shopData.splice(index, 1);
    }
    
    this.isAll();
  },
  printOrder: function (event) {
    var itemnumber = ''
    for (var i = 0; i < this.data.shopData.length; i++) {
      if (this.data.shopData[i].select) {
        itemnumber = itemnumber + this.data.shopData[i].itemnumber + ","
      }
    }
    if (itemnumber.length == 0) {
      this.showTips("请至少选择一个商品！");
    } else {
      var vm = this;
      var url = app.globalData.url;
      wx.request({
        url: url + 'order/printSaleOrder', //仅为示例，并非真实的接口地址
        data: {
          openId: vm.data.openId,
          id: vm.data.listId,
          itemJson: itemnumber
        },
        dataType: 'json',
        header: {
          "Content-Type": "application/json",
          eId: vm.data.eId,
          orgno: vm.data.orgno
        },
        method: 'get',
        success: function (res) {
          if(res.data.code=="1"){
            vm.showTips("打印成功");
          }else{
            vm.showTips(res.data.message);
          }
        }, error: function (res) {
        }
      })
    }

  },
  shareOrder: function (event) {
    var itemnumber = []
    for (var i = 0; i < this.data.shopData.length; i++) {
      if (this.data.shopData[i].select) {
        itemnumber.push(this.data.shopData[i].itemnumber)
      }
    }
    if (itemnumber.length == 0) {
      this.showTips("请至少选择一个商品！");
    }
  },
  onShareAppMessage: function (event) {
      var itemnumber = ''
      for (var i = 0; i < this.data.shopData.length; i++) {
        if (this.data.shopData[i].select) {
          itemnumber = itemnumber + this.data.shopData[i].itemnumber+ ","
        }
      }
      console.log(itemnumber);
      console.log(this.data.listId);
      console.log('itemnumber = ' + itemnumber + ' & listId=' + this.data.listId + ' & eid=' + this.data.eId);
      return {
        title: '订单分享',
        imageUrl: '../../common/images/icons/animalone@2x.png',
        path: 'pages/supplier/shareView/shareView?itemnumber=' + itemnumber + '&listId=' + this.data.listId + '&eid=' + this.data.eId + '&urlFlag=0', 
        success: function (res) {
        },
        fail: function (res) {
        }
      }
  }
})