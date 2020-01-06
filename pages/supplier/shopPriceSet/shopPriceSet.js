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
    companyName:'',
    word: '',
    shopData: [],
    shopType: [],
    searchFlag: false,
    currentItemType: 0,
    deleteTipFlag: false,
    shopShowFlag: true,
    itemId: '',
    propertiesId: '',
    savePirceList:[],
    deleteTipFlag:false,
    indexone: 0,
    indextwo: 0,
    indexthree: 0,
    deleteMean:0,
    setTimeFlag:false,
    showFixedBut:false,
    ballBottom:70,
    ballRight:12,
    screenHeight: 0,
    screenWidth: 0, 
    ckTipFalg: false,
    timeObj: null,
    tipText: '',
    loading:false,
    screenHeight: wx.getSystemInfoSync().windowHeight-50,
    viewWidth: 71,
    viewHeight: 71,
    x: wx.getSystemInfoSync().windowWidth - 83,
    y: wx.getSystemInfoSync().windowHeight - 180,
    saveFlagTip:false,
    pricePlanId:'',
    whiteFlag:false,
    timeFlag:false,
    selectItem:[],
    editTipFlag:false,
    addTipFlag:false,
    startTipFlag:false,
    startflag:false,
    customerId:'',

  },
  onLoad: function (option) {
    console.log(option.startflag);
    this.setData({
      pricePlanId: option.id,
      timeFlag: option.timeFlag,
      startflag: option.startflag,
      customerId: option.customerid
    })
  },
  ballMoveEvent: function (e) {
    var touchs = e.touches[0];
    var pageX = touchs.clientX;
    var pageY = touchs.clientY;

    //防止坐标越界,view宽高的一般 
    if (pageX > this.data.screenWidth - 30) return;
    if (pageX < 40) return;
    if (this.data.screenHeight - pageY <= 30) return;

    //这里用right和bottom.所以需要将pageX pageY转换 
    var x = this.data.screenWidth - pageX - 30;
    var y = this.data.screenHeight - pageY - 30;
    this.setData({
      ballBottom: y,
      ballRight: x
    });
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
        vm.data.companyName = res.data.companyName;
        vm.setData({
          currentItemType:0
        })
        vm.getShopType();

      }
    })
    
  },
  initData: function () {
    this.setData({
      viewWidth: 71,
      viewHeight: 71,
      x: this.data.x + 79,
      y: this.data.y + 166,
      showFixedBut: false,
      whiteFlag: false
    })
  },
  getShopType: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getOneLevelPrice', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        pricePlanId: vm.data.pricePlanId
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
            shopType: res.data.data
          })
          wx.getStorage({
            key: 'selectShopItem',
            success: function (res) {
              console.log(123);
              console.log(res);
              if(res.data){
                for (var i = 0; i < res.data.length;i++){
                  var flag=true;
                  for (var h = 0; h < vm.data.shopType.length; h++) {
                    if (res.data[i].itemcategorycode1 == vm.data.shopType[h].itemcategoryid1){
                      flag=false;
                    }
                  }
                  if (flag){
                    var item={};
                    item.existItemSku=false;
                    item.itemcategoryid1 = res.data[i].itemcategorycode1;
                    item.itemcategoryname1 = res.data[i].itemcategoryname1;
                    item.seq=0;
                    item.isSearch = true;
                    vm.data.shopType.push(item);
                  }
                }
                vm.setData({
                  selectItem:res.data,
                  shopType: vm.data.shopType
                })
              }

            }
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
    vm.setData({
      loading: true
    })
    wx.request({
      url: url + 'base/getTwoLevelPrice', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        itemcategoryid1: vm.data.shopType[vm.data.currentItemType].itemcategoryid1,
        pricePlanId: vm.data.pricePlanId,
        deleted:0
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'get',
      success: function (res) {
        vm.setData({
          loading: false
        })
        console.log(res);
        if (res.data.code == '1') {
            vm.inDataItem(res.data.data);
        }
      }, error: function (res) {
      }
    })
  },
  inDataItem:function(data){
    var typeid = this.data.shopType[this.data.currentItemType].itemcategoryid1;
    var items=[]
    for (var i = 0; i < this.data.selectItem.length;i++){
      this.data.selectItem[i].newFlag=true;
      
      if (typeid == this.data.selectItem[i].itemcategorycode1) {
        var flag = true;
        for (var h = 0; h < data.length; h++) {
          if (data[h].itemcategoryid2 == this.data.selectItem[i].itemcategorycode2) {
            data[h].itemSkuList.push(this.data.selectItem[i]);
            flag = false;
          }
        }
        if (flag) {
          var item = {};
          item.existItemSku = false;
          item.itemSkuList = [];
          item.itemcategoryid2 = this.data.selectItem[i].itemcategorycode2;
          item.itemcategoryname2 = this.data.selectItem[i].itemcategoryname2;
          item.seq = 0;
          item.itemSkuList.push(this.data.selectItem[i]);
          data.push(item)
        }
      }
      
    }

    this.formartData(data);
  },
  formartData:function(data){
    for (var i = 0; i < data.length; i++){
      for (var h = 0; h < data[i].itemSkuList.length; h++) {
        if (data[i].itemSkuList[h].price && (!data[i].itemSkuList[h].newFlag)) {
          data[i].itemSkuList[h].edit = true;
        }
        if (data[i].itemSkuList[h].itemSkuList && data[i].itemSkuList[h].itemSkuList.length>0){
          var item = {};
          item.id = data[i].itemSkuList[h].id;
          item.itemspecifications = data[i].itemSkuList[h].itemspecifications;
          item.price = data[i].itemSkuList[h].price;
          item.unit = data[i].itemSkuList[h].unit;
          item.propertiesid = data[i].itemSkuList[h].propertiesid;
          data[i].itemSkuList[h].itemSkuList.push(item);
          for (var g = 0; g < data[i].itemSkuList[h].itemSkuList.length; g++) {
            if (data[i].itemSkuList[h].itemSkuList[g].price && (!data[i].itemSkuList[h].newFlag)) {
              data[i].itemSkuList[h].itemSkuList[g].edit = true;
            }
            for (var f = 0; f < this.data.savePirceList.length; f++){
              if (data[i].itemSkuList[h].itemSkuList[g].id == this.data.savePirceList[f].id){
                data[i].itemSkuList[h].itemSkuList[g].price = this.data.savePirceList[f].price
              }
            }
          }
        }else{
          console.log(this.data.savePirceList);
          for (var f = 0; f < this.data.savePirceList.length; f++) {
            if (data[i].itemSkuList[h] && (data[i].itemSkuList[h].id == this.data.savePirceList[f].id)) {
              data[i].itemSkuList[h].price = this.data.savePirceList[f].price
            }
          }
        }
        
      }
      
    }
    this.setData({
      shopData: data
    })
  },
  deleteShopDataTip: function (event) {
    var itemId = event.currentTarget.dataset.itemid;
    var propertiesId = event.currentTarget.dataset.propertiesid;
    var deleteIndex = event.currentTarget.dataset.deleteindex;
    this.setData({
      itemId: itemId,
      propertiesId: propertiesId,
      deleteTipFlag: true,
      deleteIndex: deleteIndex
    })
  },
  deleteShopData: function () {
    this.setData({
      deleteTipFlag: false
    })
    var vm = this;
    var url = app.globalData.url;
    //if()
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
        console.log(res);
        if (res.data.code == '1') {
          vm.getShopData();
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
      this.getShopData();
    } else {
      this.setData({
        searchFlag: true
      })
    }
  },
  changeItemcategory: function (event) {
    var index = event.currentTarget.dataset.index;
    this.setData({
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
      url: url + 'base/getTwoLevelPrice', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        itemcategoryid1: vm.data.shopType[vm.data.currentItemType].itemcategoryid1,
        pricePlanId: vm.data.pricePlanId,
        itemname: vm.data.word,
        deleted: 0
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
          vm.formartData(res.data.data);
        }
      }, error: function (res) {
      }
    })
  },
  uploadImage: function () {
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
          }
        })
      }
    })
  },
  keyPriceInputOne: function (event) {
    var index1 = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    this.data.shopData[index1].itemSkuList[index2].showFlag = false;
    this.setData({
      shopData: this.data.shopData
    })
    console.log(this.data.shopData)
    if (event.detail.value.length == 0) {
      if (this.data.shopData[index1].itemSkuList[index2].edit && this.data.shopData[index1].itemSkuList[index2].price && this.data.shopData[index1].itemSkuList[index2].price> 0) {
        this.showTips("已经保存过价格的商品，不能清空只能修改")
        this.setData({
          shopData: this.data.shopData
        })
        return;
      }
      
    }
    var price = 0.00;
    if (event.detail.value != '.') {
      price = event.detail.value;
    }
    var id = event.currentTarget.dataset.id;
    console.log(price.length == 0);
    if (price.length==0){
      for (var i = 0; i < this.data.savePirceList.length;i++){
        if (id == this.data.savePirceList[i].id){
          if (this.data.savePirceList.length==1){
            this.data.savePirceList = [];
          }else{
            this.data.savePirceList.split(i, 1);
          }
          
        }
      }
      
    }else{
      console.log(234);
      price = parseFloat(price).toFixed(3);
      if (!this.data.shopData[index1].itemSkuList[index2].newFlag){
        var flag = true;
        for (var i = 0; i < this.data.savePirceList.length; i++) {
          if (id == this.data.savePirceList[i].id) {
            this.data.savePirceList[i].price = price.substring(0, price.lastIndexOf('.') + 3);
            flag = false;
          }
        }
        if (flag){
          var item = {
            id: id,
            price: price.substring(0, price.lastIndexOf('.') + 3)
          }
          this.data.savePirceList.push(item);
        }
      }
    }
    if (this.data.shopData[index1].itemSkuList[index2].newFlag) {
      for (var i = 0; i < this.data.selectItem.length; i++) {
        if (this.data.selectItem[i].itemnumber == this.data.shopData[index1].itemSkuList[index2].itemnumber) {
          this.data.selectItem[i].price = price.substring(0, price.lastIndexOf('.') + 3)
        }
      }
      this.setData({
        selectItem: this.data.selectItem
      })
      wx.setStorage({
        key: 'selectShopItem',
        data: this.data.selectItem
      })
    }
    
    console.log(this.data.shopData[index1].itemSkuList[index2]);
    console.log(123);
    this.data.shopData[index1].itemSkuList[index2].price = price.substring(0, price.lastIndexOf('.') + 3);
    this.data.shopData[index1].itemSkuList[index2].showFlag = false;
    this.setData({
      shopData: this.data.shopData
    })
  },
  keyInputFlagOne: function (event) {
    var index1 = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    this.data.shopData[index1].itemSkuList[index2].showFlag=true;
    this.setData({
      shopData: this.data.shopData
    })
  },
  keyPriceInputTwo: function (event) {
    var index1 = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var index3 = event.currentTarget.dataset.indexthree;
    this.data.shopData[index1].itemSkuList[index2].itemSkuList[index3].showFlag = false;
    this.setData({
      shopData: this.data.shopData
    })
    console.log(this.data.shopData[index1].itemSkuList[index2].itemSkuList[index3].price)
    if (event.detail.value.length == 0) {
      if (this.data.shopData[index1].itemSkuList[index2].itemSkuList[index3].edit && this.data.shopData[index1].itemSkuList[index2].itemSkuList[index3].price && this.data.shopData[index1].itemSkuList[index2].itemSkuList[index3].price > 0){
        this.showTips("已经保存过价格的商品，不能清空只能修改")
        this.setData({
          shopData: this.data.shopData
        })
      }
      return;
    }
    var price = 0.00;
    if (event.detail.value != '.') {
      price = event.detail.value;
    }
    price = parseFloat(price).toFixed(3);
    
    var id = event.currentTarget.dataset.id;
    if (price.length == 0) {
      for (var i = 0; i < this.data.savePirceList.length; i++) {
        if (id == this.data.savePirceList[i].id) {
          if (this.data.savePirceList.length == 1) {
            this.data.savePirceList = [];
          } else {
            this.data.savePirceList.split(i, 1);
          }

        }
      }

    } else {
      var flag=true;
      for (var i = 0; i < this.data.savePirceList.length; i++) {
        if (id == this.data.savePirceList[i].id) {
          this.data.savePirceList[i].price = price.substring(0, price.lastIndexOf('.') + 3);
          flag=false;
        }
      }
      if (flag) {
        var item = {
          id: id,
          price: price.substring(0, price.lastIndexOf('.') + 3)
        }
        this.data.savePirceList.push(item);
      }
    }
    this.data.shopData[index1].itemSkuList[index2].itemSkuList[index3].price = price.substring(0, price.lastIndexOf('.') + 3);
    this.data.shopData[index1].itemSkuList[index2].itemSkuList[index3].showFlag = false;
    this.setData({
      shopData: this.data.shopData
    })
    console.log(this.data.shopData);
  },
  keyInputFlagTwo: function (event) {
    var index1 = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var index3 = event.currentTarget.dataset.indexthree;
    this.data.shopData[index1].itemSkuList[index2].itemSkuList[index3].showFlag = true;
    this.setData({
      shopData: this.data.shopData
    })
  },
  deleteShopTip: function(event){
    var id = event.currentTarget.dataset.id;
    var indexone = event.currentTarget.dataset.indexone;
    var indextwo = event.currentTarget.dataset.indextwo;
    var indexthree = event.currentTarget.dataset.indexthree;
    var deleteMean = event.currentTarget.dataset.mean;
    console.log(indexone + ',' + indextwo + ',' + indexthree);
    this.setData({
      deleteId: id,
      indexone: indexone,
      indextwo: indextwo,
      indexthree: indexthree,
      deleteMean: deleteMean,
      deleteTipFlag:true
    })
  },
  cancelDelete: function (event) {
    this.setData({
      deleteTipFlag: false
    })
  },
  deleteShop:function(event){
    this.setData({
      deleteTipFlag: false
    })
    
    console.log(this.data.shopData);
    var vm = this;
    var url = app.globalData.url;
    var itemArray=[];
    if (this.data.deleteMean == 0) {
      if (this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].newFlag){
        for (var i=0;i<this.data.selectItem.length;i++){
          if (this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemnumber == this.data.selectItem[i].itemnumber){
            if (this.data.selectItem.length==1){
              this.data.selectItem=[]
            }else{
              this.data.selectItem.splice(i, 1);
            }
          }
        }
        if (this.data.shopData[this.data.indexone].itemSkuList.length == 1) {
          this.data.shopData[this.data.indexone].itemSkuList = [];
        } else {
          this.data.shopData[this.data.indexone].itemSkuList.splice(this.data.indextwo, 1);
        }
        if (this.data.shopData[this.data.indexone].itemSkuList.length==0){
          this.data.shopType.splice(this.data.currentItemType, 1);
          this.setData({
            shopType: this.data.shopType,
            currentItemType:0
          })
        }
        wx.setStorage({
          key: 'selectShopItem',
          data: this.data.selectItem,
        })
        vm.getShopData();
        return;
      }else{
        if (this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList && this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList.length > 0) {
          for (var i = 0; i < this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList.length; i++) {
            var item = {};
            item.id = this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList[i].id;
            item.deleted = 1;
            itemArray.push(item);
          }
        } else {
          var item = {};
          item.id = vm.data.deleteId;
          item.deleted = 1;
          itemArray.push(item);
        }
        if (this.data.shopData[this.data.indexone].itemSkuList.length==1){
          this.data.shopType.splice(this.data.currentItemType, 1);
          this.setData({
            currentItemType: 0,
            shopType: this.data.shopType
          })
        }
      }
    }else{
      if (this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].newFlag) {
        for (var i = 0; i < this.data.selectItem.length; i++) {
          if (this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemnumber == this.data.selectItem[i].itemnumber) {
            if (this.data.selectItem[i].itemSkuList.length == 1) {
              this.data.selectItem[i].itemSkuList = []
            } else {
              this.data.selectItem[i].itemSkuList.splice(this.data.indexthree, 1);
            }
          }
        }
        wx.setStorage({
          key: 'selectShopItem',
          data: this.data.selectItem,
        })
        vm.getShopData();
        return;
      } else {
        var item = {};
        item.id = this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList[this.data.indexthree].id
        item.deleted = 1;
        itemArray.push(item);
      }
      
    }
    vm.setData({
      loading: true
    })
    wx.request({
      url: url + 'base/savePrice', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        prices: itemArray,
        pricePlanId: vm.data.pricePlanId,
        
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'post',
      success: function (res) {
        vm.setData({
          loading: false
        })
        if(res.data.code=="1"){
          vm.deletePageShop();
          vm.getShopData();
        }else{
          vm.showTips(res.data.message)
        }
        
      }, error: function (res) {
      }
    })
  },
  deletePageShop:function(){
    if (this.data.deleteMean == 0) {
      if (this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList && this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList.length > 0) {
        for (var h = 0; h < this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList.length; h++) {
          for (var i = 0; i < this.data.savePirceList.length; i++) {
            if (this.data.savePirceList[i].id == this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList[h].id) {
              if (this.data.savePirceList.splice.length <= 1) {
                this.data.savePirceList = []
              } else {
                this.data.savePirceList.splice(i, 1);
              }
            }
          }
        }
      }
      for (var i = 0; i < this.data.savePirceList.length; i++) {
        if (this.data.savePirceList[i].id == this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].id) {
          if (this.data.savePirceList.splice.length <= 1) {
            this.data.savePirceList = []
          } else {
            this.data.savePirceList.splice(i, 1);
          }
        }
      }
      if (this.data.shopData[this.data.indexone].itemSkuList.length <= 1) {
        this.data.shopData[this.data.indexone].itemSkuList = []
      } else {
        this.data.shopData[this.data.indexone].itemSkuList.splice(this.data.indextwo, 1);
      }
    } else {
      for (var i = 0; i < this.data.savePirceList.length; i++) {
        if (this.data.savePirceList[i].id == this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList[this.data.indexthree].id) {
          console.log(this.data.savePirceList[i].id == this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList[this.data.indexthree].id);
          if (this.data.savePirceList.length <= 1) {
            this.data.savePirceList = []
          } else {
            this.data.savePirceList.splice(i, 1);
          }
        }
      }
      if (this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList.length <= 1) {
        this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList = []
      } else {
        this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList.splice(this.data.indexthree, 1);
      }
    }
    this.setData({
      shopData: this.data.shopData
    })
  },
  cancelSet:function(){
    this.setData({
      setTimeFlag:false
    })
    wx.navigateBack({
      delta: 1
    })
  },
  cancelSet2: function () {
    this.setData({
      editTipFlag: false,
      addTipFlag:false,
      startTipFlag:false
    })
  },
  goToTimeSet: function () {
    this.setData({
      setTimeFlag: false
    })
    wx.navigateBack({
      delta:1
    })
  },
  savePriceSet: function () {
    
    var vm = this;
    vm.setData({
      editTipFlag: false,
      addTipFlag: false
    })
    var url = app.globalData.url;
    var itemArray=[];
    for (var i=0;i<this.data.selectItem.length;i++){
      if (this.data.selectItem[i].itemSkuList.length>0){
        for (var h = 0; h < this.data.selectItem[i].itemSkuList.length; h++) {
          var items = {};
          items.itemcode = this.data.selectItem[i].itemSkuList[h].itemnumber;
          items.price = this.data.selectItem[i].itemSkuList[h].price;
          items.propertiesid = this.data.selectItem[i].itemSkuList[h].propertiesid;
          itemArray.push(items);
        }
      }else{
        var items = {};
        items.itemcode = this.data.selectItem[i].itemnumber;
        items.price = this.data.selectItem[i].price;
        items.propertiesid = this.data.selectItem[i].propertiesid;
        itemArray.push(items);
      }
    }
    if (this.data.selectItem.length>0){
        var vm = this;
        var url = app.globalData.url;
        vm.setData({
          loading: true
        })
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
            vm.setData({
              loading: false
            })
            if (res.data.code == "1") {
              vm.saveRequest();
            } else {
              vm.showTips(res.data.message);
            }
            console.log(res);
          }, error: function (res) {
          }
        }) 
    }else{
        this.saveRequest();
    }
    console.log(vm.data.savePirceList);
    
  },
  saveRequest: function(){
    var vm = this;
    var url = app.globalData.url;
    vm.setData({
      loading: true
    })
    wx.request({
      url: url + 'base/savePrice', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        pricePlanId: vm.data.pricePlanId,
        prices: vm.data.savePirceList
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'post',
      success: function (res) {
        vm.setData({
          loading: false
        })
        console.log(res);
        if (res.data.code == '1') {
          vm.savePriceSetTips();
          wx.setStorage({
            key: 'selectShopItem',
            data: []
          })
        } else {
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
      }
    })
  },
  savePriceSetTips: function () {

    var vm = this;
    var url = app.globalData.url;
    vm.setData({
      loading: true
    })
    wx.request({
      url: url + 'base/judgingPrice', //仅为示例，并非真实的接口地址
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
            if (vm.data.timeFlag=="true"){
              console.log(vm.data.startflag);
              if (vm.data.startflag == "true"){
                vm.setData({
                  startTipFlag: true,
                  loading: false
                })
              }else{
                vm.setData({
                  //editTipFlag: true,
                  loading: false
                })
              }
            }else{
              vm.setData({
                setTimeFlag: true,
                loading: false
              })
            }
            
        }else{
          vm.setData({
            saveFlagTip: true,
            loading: false
          })
          setTimeout(function () {
            vm.setData({
              saveFlagTip: false
            })
          }, 1500)
        }
      }, error: function (res) {
      }
    })
  },
  showFixedButChange:function(){
    if (this.data.showFixedBut){
      this.setData({
        viewWidth: 71,
        viewHeight: 71,
        x:this.data.x + 79,
        y: this.data.y + 166,
        showFixedBut:false,
        whiteFlag:false
      })
    }else{
      this.setData({
        viewWidth: 150,
        viewHeight: 237,
        x: this.data.x - 79,
        y: this.data.y - 166,
        showFixedBut: true,
        whiteFlag: true
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
  jumpAddShop: function (msg) {
    wx.navigateTo({
      url: '../addShopInPrice/addShopInPrice?pricePlanId=' + this.data.pricePlanId + '&companyName=' + this.data.pricePlanId + '&timeFlag=' + this.data.timeFlag
    })
  },
  onShareAppMessage: function (res) {
    this.cancelSet2();
    return {
      title: '报价单分享',
      imageUrl: '../../common/images/icons/animalone@2x.png',
      path: 'pages/supplier/shareView/shareView?id=' + this.data.pricePlanId + '&companyName=' + this.data.companyName + '&eid=' + this.data.eId + '&openId=' + this.data.openId + '&urlFlag=1',
      success: function (res) {
        // 转发成功
        console.log('succ-->' + res.target)
      },
      fail: function (res) {
        // 转发失败
        console.log('fail-->' + res.target)
      }
    }
  },
  printPricePlan:function(){
    this.cancelSet2();
    var vm = this;
    var url = app.globalData.url;
    vm.setData({
      loading: true
    })
    wx.request({
      url: url + 'base/getPriceListPrint', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        pricePlanId: vm.data.pricePlanId
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'post',
      success: function (res) {
        vm.setData({
          loading: false
        })
        if (res.data.code == '1') {
          vm.showTips("打印成功！");
        }else{
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
        vm.showTips(res);
      }
    })
  },
  savePriceSetTip:function(){
    var flag = true;
    for (var i = 0; i < this.data.savePirceList.length; i++) {
      if (parseFloat(this.data.savePirceList[i].price) <= 0) {
        flag = false;
      }
    }
    var flag2 = false;
    for (var i = 0; i < this.data.selectItem.length; i++) {
      if (this.data.selectItem[i].itemSkuList && this.data.selectItem[i].itemSkuList.length > 0) {
        for (var h = 0; h < this.data.selectItem[i].itemSkuList.length; h++) {
          if (this.data.selectItem[i].itemSkuList[h].price && this.data.selectItem[i].itemSkuList[h].price.length > 0 && parseFloat(this.data.selectItem[i].itemSkuList[h].price) > 0) {

          } else {
            flag2 = true;
          }
        }
      } else {
        if (this.data.selectItem[i].price && this.data.selectItem[i].price.length > 0 && parseFloat(this.data.selectItem[i].price) > 0) {

        } else {
          flag2 = true;
        }
      }
    }
    if (!flag) {
      this.showTips("价格不能为0！");
      return;
    }
    if (flag2) {
      this.showTips("价格不能为0！");
      return;
    }
    if(this.data.timeFlag=="true"){
      if (this.data.selectItem.length>0){
        if (this.data.startflag == "true") {
          this.savePriceSet();
        } else {
          this.setData({
            addTipFlag: true
          })
        }
      }else{
        if (this.data.startflag=="true"){
          this.savePriceSet();
        }else{
          this.setData({
            editTipFlag: true
          })
        }
        
      }
      
    }else{
      this.savePriceSet();
    }
  }
})
