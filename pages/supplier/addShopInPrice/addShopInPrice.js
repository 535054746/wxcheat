//index.js
//获取应用实例
const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    orderStatu: '',
    openId: "",
    eId: '',
    orgno: '',
    categoryId: '',
    word: '',
    shopData: [],
    shopType: [],
    shopData2: [],
    shopTypeFlag: [],
    searchFlag: false,
    currentItemType: 0,
    deleteTipFlag: false,
    shopShowFlag: true,
    itemId: '',
    propertiesId: '',
    loading: false,
    ckTipFalg: false,
    timeObj: null,
    tipText: '',
    pricePlanId:'',
    timeFlag:false,
    shopItem:[],
    itemList:[]
  },
  onLoad: function (option) {
    this.setData({
      pricePlanId: option.pricePlanId,
      timeFlag: option.timeFlag
    })
  },
  onReady: function () {
    this.saveShops();
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
        wx.getStorage({
          key: 'selectShopItem',
          success: function (res) {
            vm.data.shopItem=res.data;
            wx.setStorage({
              key: 'selectShopItem',
              data: vm.data.shopItem
            })
            vm.getShopType();
          }
        })

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
        pricePlanId: vm.data.pricePlanId,
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
            shopType: res.data.data
          })
          if (vm.data.shopType.length == 0) {
            vm.setData({
              loading: false
            })
            return;
          }
          vm.getShopData();
          vm.addFlagArray();
        }
      }, error: function (res) {
      }
    })
  },
  addFlagArray: function () {
    for (var i = 0; i < this.data.shopType.length; i++) {
      if (i == 0) {
        this.data.shopTypeFlag.push(true);
      } else {
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
        pricePlanId: vm.data.pricePlanId,
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
          loading: false
        })
        if (res.data.code == '1') {

          vm.formatShopData(res.data.data);
        }
      }, error: function (res) {
      }
    })
  },
  formatShopData: function (data) {
    
    var itemSkuList=[]
    for (var i = 0; i < data.length; i++) {
      for (var h = 0; h < data[i].itemList.length; h++) {
        data[i].itemList[h].added = false;
        data[i].itemList[h].itemSkuList=[];
        console.log(data[i].itemList[h]);
        for (var g = 0; g < this.data.shopItem.length; g++){
          console.log(data[i].itemList[h].itemnumber+","+this.data.shopItem[g].itemnumber);
          console.log(data[i].itemList[h].itemnumber == this.data.shopItem[g].itemnumber);
          if (data[i].itemList[h].itemnumber == this.data.shopItem[g].itemnumber){
            var flag=true;
            if (data[i].itemList[h].itemSkuList && data[i].itemList[h].itemSkuList.length>0){
              for (var k = 0; k < data[i].itemList[h].itemSkuList.length; k++) {
                data[i].itemList[h].itemSkuList[k].added = false;
                if (this.data.shopItem[g].itemSkuList && this.data.shopItem[g].itemSkuList.length > 0){
                  var flag2=false;
                  for (var j = 0; j < this.data.shopItem[g].itemSkuList.length; j++) {
                    if (this.data.shopItem[g].itemSkuList[j].propertiesid == data[i].itemList[h].itemSkuList[k].propertiesid && this.data.shopItem[g].itemSkuList[j].itemnumber == data[i].itemList[h].itemSkuList[k].itemnumber){
                      data[i].itemList[h].itemSkuList[k].added = true;
                      flag2 = true;
                    }
                  }
                  if (flag2){
                    flag = false;
                  }
                }else{
                  flag = false;
                }
              }
            }else{
              data[i].itemList[h].added = true;
            }
            if (flag){
              data[i].itemList[h].added = true;
            }
          }
        }
        
      }
    }
    this.setData({
      shopData: data
    })
  },
  formatShopData2: function (data) {
    var itemSkuList=[]
    for (var i = 0; i < data.length; i++) {
      data[i].added = false;
      data[i].itemSkuList=[];
      for (var g = 0; g < this.data.shopItem.length; g++){
          if (data[i].itemnumber == this.data.shopItem[g].itemnumber){
            var flag=true;
            if (data[i].itemSkuList && data[i].itemSkuList.length>0){
              for (var k = 0; k < data[i].itemSkuList.length; k++) {
                data[i].itemSkuList[k].added = false;
                if (this.data.shopItem[g].itemSkuList && this.data.shopItem[g].itemSkuList.length > 0){
                  var flag2=false;
                  for (var j = 0; j < this.data.shopItem[g].itemSkuList.length; j++) {
                    if (this.data.shopItem[g].itemSkuList[j].propertiesid == data[i].itemSkuList[k].propertiesid && this.data.shopItem[g].itemSkuList[j].itemnumber == data[i].itemSkuList[k].itemnumber){
                      data[i].itemSkuList[k].added = true;
                      flag2 = true;
                    }
                  }
                  if (flag2){
                    flag = false;
                  }
                }else{
                  flag = false;
                }
              }
            }else{
              data[i].added = true;
            }
            if (flag){
              data[i].added = true;
            }
          }
      }
    }
    console.log(data);
    this.setData({
      shopData2: data
    })
  },
  deleteShopDataTip: function (event) {
    var itemId = event.currentTarget.dataset.itemid;
    var propertiesId = event.currentTarget.dataset.propertiesid;
    this.setData({
      itemId: itemId,
      propertiesId: propertiesId,
      deleteTipFlag: true
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
        } else {
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
      }
    })
  },
  showSearchBox: function () {
    if (this.data.searchFlag) {
      this.setData({
        shopShowFlag: true,
        searchFlag: false
      })
    } else {
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
      } else {
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
  searchShop: function () {
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
            shopShowFlag: false,
            shopData2: res.data.data
          })
          vm.formatShopData2(res.data.data);
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
          url: url + 'file/uploadImg', //仅为示例，非真实的接口地址
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

                }

              }, error: function (res) {
              }
            })
          }
        })
      }
    })
  },
  editShop: function (event) {
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
  addShop: function (event) {
    var mean = event.currentTarget.dataset.mean;
    var indexone = event.currentTarget.dataset.indexone;
    var indextwo = event.currentTarget.dataset.indextwo;
    var indexthree = event.currentTarget.dataset.indexthree;
    var itemcode = event.currentTarget.dataset.itemcode;
    var propertiesid = event.currentTarget.dataset.propertiesid;
    var itemArray=[];
    var propertiesnamejson = this.data.shopData[indexone].itemList[indextwo].itemSkuList;
    
    if (mean==1){
      if (propertiesnamejson.length == 0) {
        var items = {};
        items.itemcode = itemcode;
        itemArray.push(items);
        this.data.shopItem.push(this.data.shopData[indexone].itemList[indextwo]);
      } else {
        for (var i = 0; i < propertiesnamejson.length;i++){
            var items = {};
            items.itemcode = itemcode;
            items.propertiesid = propertiesnamejson[i].propertiesid;
            itemArray.push(items);
            this.data.shopItem.push(propertiesnamejson[i]);
        }
      }
      this.data.shopData[indexone].itemList[indextwo].added = true;
    }else{
      var flag = true;
      for (var i = 0; i < this.data.shopItem.length; i++) {
        if (this.data.shopData[indexone].itemSkuList[indextwo].itemSkuList[indexthree].itemnumber == this.data.shopItem[i].itemnumber) {
          this.data.shopData[indexone].itemSkuList[indextwo].itemSkuList[indexthree].added = true;
          if (this.data.shopItem[i].itemSkuList.length > 0) {
            this.data.shopItem[i].itemSkuList.push(this.data.shopData[indexone].itemSkuList[indextwo].itemSkuList[indexthree])
          } else {
            var item = this.data.shopItem[i];
            this.data.shopItem[i].itemSkuList.push(this.data.shopData[indexone].itemSkuList[indextwo].itemSkuList[indexthree]);
            this.data.shopItem[i].itemSkuList.push(item);
          }
          flag = false;
        }
      }
      if (flag) {
        this.data.shopItem.push(this.data.shopData[indexone].itemSkuList[indextwo].itemSkuList[indexthree]);
        this.data.shopData[indexone].itemSkuList[indextwo].itemSkuList[indexthree].added = true;
      }
        var items = {};
        items.itemcode = itemcode;
        items.propertiesid = propertiesid;
        itemArray.push(items);
    }
    this.setData({
      shopData: this.data.shopData
    })
    var itemcategoryid1 = this.data.shopData[indexone].itemList[indextwo].itemcategorycode1;
    var itemname = this.data.shopData[indexone].itemList[indextwo].itemname;
    if(this.data.timeFlag){
      this.saveShops();
    }else{
      var vm = this;
      var url = app.globalData.url;
      wx.request({
        url: url + 'base/addPriceItem', //仅为示例，并非真实的接口地址
        data: {
          openId: vm.data.openId,
          pricePlanId: vm.data.pricePlanId,
          items: itemArray
        },
        dataType: 'json',
        header: {
          "Content-Type": "application/json",
          eId: vm.data.eId
        },
        method: 'post',
        success: function (res) {
          if (res.data.code == "1") {
            vm.showTips("添加成功!");
            wx.navigateBack({
              delta: 1
            })
          } else {
            vm.showTips(res.data.message);
          }
          console.log(res);
        }, error: function (res) {
        }
      })
    }
  },
  addShop2: function (event) {
    var mean = event.currentTarget.dataset.mean;
    var indexone = event.currentTarget.dataset.indexone;
    var indextwo = event.currentTarget.dataset.indextwo;
    var itemcode = event.currentTarget.dataset.itemcode;
    var propertiesid = event.currentTarget.dataset.propertiesid;
    var itemArray = [];
    var propertiesnamejson = this.data.shopData2[indexone].itemSkuList;
    
    if (mean == 1) {
      if (propertiesnamejson.length == 0) {
        var items = {};
        items.itemcode = itemcode;
        itemArray.push(items);
        this.data.shopItem.push(this.data.shopData2[indexone]);
      } else {
        for (var i = 0; i < propertiesnamejson.length; i++) {
          var items = {};
          items.itemcode = itemcode;
          items.propertiesid = propertiesnamejson[i].propertiesid;
          itemArray.push(items);
          this.data.shopItem.push(propertiesnamejson[i]);
        }
      }
      this.data.shopData2[indexone].added = true;
    } else {
      var flag=true;
      for (var i = 0; i < this.data.shopItem.length;i++){
        if (this.data.shopData2[indexone].itemSkuList[indextwo].itemnumber == this.data.shopItem[i].itemnumber){
          this.data.shopData2[indexone].itemSkuList[indextwo].added = true;
          if (this.data.shopItem[i].itemSkuList.length>0){
            this.data.shopItem[i].itemSkuList.push(this.data.shopData2[indexone].itemSkuList[indextwo])
          }else{
            var item=this.data.shopItem[i];
            this.data.shopItem[i].itemSkuList.push(this.data.shopData2[indexone].itemSkuList[indextwo]);
            this.data.shopItem[i].itemSkuList.push(item);
          }
          flag = false;
        }
      }
      if (flag) {
        this.data.shopItem.push(this.data.shopData2[indexone].itemSkuList[indextwo]);
        this.data.shopData2[indexone].itemSkuList[indextwo].added = true;
      }
      var items = {};
      items.itemcode = itemcode;
      items.propertiesid = propertiesid;
      itemArray.push(items);
      
      
    }
    this.setData({
      shopData2: this.data.shopData2
    })
    var itemcategoryid1 = this.data.shopData2[indexone].itemcategorycode1;
    var itemname = this.data.shopData2[indexone].itemname;
    if (this.data.timeFlag) {
      this.saveShops();
    }else {
      var vm = this;
      var url = app.globalData.url;
      wx.request({
        url: url + 'base/addPriceItem', //仅为示例，并非真实的接口地址
        data: {
          openId: vm.data.openId,
          pricePlanId: vm.data.pricePlanId,
          items: itemArray
        },
        dataType: 'json',
        header: {
          "Content-Type": "application/json",
          eId: vm.data.eId
        },
        method: 'post',
        success: function (res) {
          if (res.data.code == "1") {
            vm.showTips("添加成功!");
            wx.navigateBack({
              delta: 1
            })
          } else {
            vm.showTips(res.data.message);
          }
          console.log(res);
        }, error: function (res) {
        }
      })
    }
  },
  saveShops: function (data) {
    var vm=this;
    wx.setStorage({
      key: 'selectShopItem',
      data: vm.data.shopItem
    })
  }
})
