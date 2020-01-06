//index.js
//获取应用实例
const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    orderStatu: '',
    openId: "",
    eId: '',
    orgno:'',
    categoryId:'',
    word:'',
    shopData: [],
    shopType: [],
    shopData2: [],
    shopTypeFlag: [],
    searchFlag:false,
    currentItemType:0,
    deleteTipFlag:false,
    shopShowFlag: true,
    itemId:'',
    propertiesId:'',
    loading:false,
    ckTipFalg:false,
    timeObj:null,
    tipText:'',
    pageBgFlag:false
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
        vm.data.orgno = res.data.orgno
        vm.getShopType();
        
      }
    })
  },
  initData: function () {
    
  },
  getShopType: function () {
    var vm = this;
    vm.setData({
      loading: true
    })
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getRootCategorys', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        type:4
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
            shopType:res.data.data
          })
          if (vm.data.shopType.length == 0) {
            vm.setData({
              loading: false,
              pageBgFlag: true
            })
            return;
          }
          vm.getShopData();
          vm.addFlagArray();
        }else{
          vm.showTips(res.data.message);
          vm.setData({
            loading: false,
            pageBgFlag: true
          })
        }
      }, fail: function (res) {
        vm.showTips(res);
        vm.setData({
          loading: false,
          pageBgFlag: true
        })
      }
    })
  },
  addFlagArray:function(){
    for (var i = 0; i < this.data.shopType.length; i++){
      if(i==0){
        this.data.shopTypeFlag.push(true);
      }else{
        this.data.shopTypeFlag.push(false);
      }
      
    }
    this.setData({
      shopTypeFlag: this.data.shopTypeFlag
    })
  },
  getShopData: function () {
    var vm = this;
    vm.setData({
      loading: true
    })
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getCategorysAndItems', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        categoryId: vm.data.shopType[vm.data.currentItemType].id,
        type: 4
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'get',
      success: function (res) {
        console.log(res);
        vm.setData({
          loading: false,
          pageBgFlag:true
        })
        if (res.data.code == '1') {
          
          vm.formatShopData(res.data.data);
        }
      }, error: function (res) {
      }
    })
  },
  formatShopData: function(data){
    for(var i = 0;i<data.length;i++){
      for (var h = 0; h < data[i].itemList.length; h++){
        if (data[i].itemList[h].propertiesnamejson.length!=0){
          data[i].itemList[h].propertiesnamejson = JSON.parse(data[i].itemList[h].propertiesnamejson);
        }else{
          data[i].itemList[h].propertiesnamejson = []
        }
      }
    }
    this.setData({
      shopData: data
    })
    console.log(data);
  },
  deleteShopDataTip: function (event) {
    var itemId = event.currentTarget.dataset.itemid;
    var propertiesId = event.currentTarget.dataset.propertiesid;
    this.setData({
      itemId: itemId,
      propertiesId: propertiesId,
      deleteTipFlag:true
    })
  },
  deleteShopData: function () {
    this.setData({
      deleteTipFlag: false
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/deleteItem', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        itemId: vm.data.itemId,
        propertiesId: vm.data.propertiesId
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'post',
      success: function (res) {
        if (res.data.code == '1') {
          vm.getShopData();
        }else{
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
      }
    })
  },
  showSearchBox: function () {
    if (this.data.searchFlag){
      this.setData({
        shopShowFlag: true,
        searchFlag:false
      })
    }else{
      this.setData({
        searchFlag: true
      })
    }
  },
  changeItemcategory: function (event) {
    var index = event.currentTarget.dataset.index;
    for (var i = 0; i < this.data.shopTypeFlag.length; i++) {
      if (i == index) {
        this.data.shopTypeFlag[i] = true;
      }else{
        this.data.shopTypeFlag[i] = false;
      }

    }
    this.setData({
      shopTypeFlag: this.data.shopTypeFlag,
      currentItemType: index
    })
    this.getShopData();
  },
  cancelTip: function () {
    this.setData({
      deleteTipFlag: false
    })
  },
  selectShop: function () {
    wx.navigateTo({ url: '../selectShop/selectShop' });
  },
  keyWord: function (e) {
    this.setData({
      word: e.detail.value
    })
  },
  searchShop:function(){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/searchItems', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        word: vm.data.word,
        type: 4
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
            shopShowFlag:false,
            shopData2:res.data.data
          })
        }
      }, error: function (res) {
      }
    })
  },
  uploadImage: function (event) {
    var itemId = event.currentTarget.dataset.itemid;
    console.log(itemId);
    var vm = this;
    var url = app.globalData.url;
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: url +'file/uploadImg', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'image',
          success: function (res) {
            console.log(res);
            var data = {}
            data.openId = vm.data.openId;
            data.itemId = itemId;
            console.log(res.data);
            data.picthumburl = JSON.parse(res.data).small;
            data.type = 1;
            wx.request({
              url: url + 'base/editItem', //仅为示例，并非真实的接口地址
              data: data,
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
                  vm.getShopData();
                }

              }, error: function (res) {
              }
            })
          }
        })
      }
    })
  },
  editShop:function(event){
    var itemId = event.currentTarget.dataset.itemid;
    wx.navigateTo({ url: '../editShop/editShop?id=' + itemId });
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
})
