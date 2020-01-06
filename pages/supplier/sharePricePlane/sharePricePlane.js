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
    searchFlag: false,
    currentItemType: 0,
    deleteTipFlag: false,
    shopShowFlag: true,
    itemId: '',
    propertiesId: '',
    savePirceList: [],
    deleteTipFlag: false,
    indexone: 0,
    indextwo: 0,
    indexthree: 0,
    deleteMean: 0,
    setTimeFlag: false,
    showFixedBut: false,
    ballBottom: 70,
    ballRight: 12,
    screenHeight: 0,
    screenWidth: 0,
    ckTipFalg: false,
    timeObj: null,
    tipText: '',
    loading: false,
    screenHeight: wx.getSystemInfoSync().windowHeight - 45,
    viewWidth: 71,
    viewHeight: 71,
    x: wx.getSystemInfoSync().windowWidth - 83,
    y: wx.getSystemInfoSync().windowHeight - 180,
    saveFlagTip: false,
    priceDeital:'',

  },
  onLoad: function (option) {
    this.setData({
      pricePlanId: option.id,
      companyName: option.companyName,
      eId: option.eid,
      openId: option.openId
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
    vm.getShopType();
    vm.getCompanyDetail();
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
        deleted: 0
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
          vm.formartData(res.data.data);
        }
      }, error: function (res) {
      }
    })
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
        if(res.data.code=="1"){
          if (res.data.data.createTime){
            res.data.data.createTime = vm.format(new Date(res.data.data.createTime));
          }
          if (res.data.data.startPeriod) {
            res.data.data.startPeriod = vm.format2(new Date(res.data.data.startPeriod));
          }
          if (res.data.data.endPeriod) {
            res.data.data.endPeriod = vm.format2(new Date(res.data.data.endPeriod));
          }
          vm.setData({
            priceDeital: res.data.data
          })
        }
        
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
  formartData: function (data) {
    for (var i = 0; i < data.length; i++) {
      for (var h = 0; h < data[i].itemSkuList.length; h++) {
        if (data[i].itemSkuList[h].price) {
          data[i].itemSkuList[h].edit = true;
        }
        if (data[i].itemSkuList[h].itemSkuList && data[i].itemSkuList[h].itemSkuList.length > 0) {
          var item = {};
          item.id = data[i].itemSkuList[h].id;
          item.itemspecifications = data[i].itemSkuList[h].itemspecifications;
          item.price = data[i].itemSkuList[h].price;
          item.unit = data[i].itemSkuList[h].unit;
          item.propertiesid = data[i].itemSkuList[h].propertiesid;
          data[i].itemSkuList[h].itemSkuList.push(item);
          for (var g = 0; g < data[i].itemSkuList[h].itemSkuList.length; g++) {
            if (data[i].itemSkuList[h].itemSkuList[g].price) {
              data[i].itemSkuList[h].itemSkuList[g].edit = true;
            }
            for (var f = 0; f < this.data.savePirceList.length; f++) {
              if (data[i].itemSkuList[h].itemSkuList[g].id == this.data.savePirceList[f].id) {
                data[i].itemSkuList[h].itemSkuList[g].price = this.data.savePirceList[f].price
              }
            }
          }
        } else {
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
    console.log(this.data.shopData)
    if (event.detail.value.length == 0) {
      if (this.data.shopData[index1].itemSkuList[index2].edit && this.data.shopData[index1].itemSkuList[index2].price && this.data.shopData[index1].itemSkuList[index2].price > 0) {
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
      var flag = true;
      for (var i = 0; i < this.data.savePirceList.length; i++) {
        if (id == this.data.savePirceList[i].id) {
          this.data.savePirceList[i].price = price.substring(0, price.lastIndexOf('.') + 3);
          flag = false;
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
    this.data.shopData[index1].itemSkuList[index2].price = price.substring(0, price.lastIndexOf('.') + 3);
    this.setData({
      shopData: this.data.shopData
    })
  },
  keyPriceInputTwo: function (event) {
    var index1 = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var index3 = event.currentTarget.dataset.indexthree;
    console.log(this.data.shopData[index1].itemSkuList[index2].itemSkuList[index3].price)
    if (event.detail.value.length == 0) {
      if (this.data.shopData[index1].itemSkuList[index2].itemSkuList[index3].edit && this.data.shopData[index1].itemSkuList[index2].itemSkuList[index3].price && this.data.shopData[index1].itemSkuList[index2].itemSkuList[index3].price > 0) {
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
      var flag = true;
      for (var i = 0; i < this.data.savePirceList.length; i++) {
        if (id == this.data.savePirceList[i].id) {
          this.data.savePirceList[i].price = price.substring(0, price.lastIndexOf('.') + 3);
          flag = false;
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
    this.setData({
      shopData: this.data.shopData
    })
    console.log(this.data.savePirceList);
  },
  deleteShopTip: function (event) {
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
      deleteTipFlag: true
    })
  },
  cancelDelete: function (event) {
    this.setData({
      deleteTipFlag: false
    })
  },
  deleteShop: function (event) {
    this.setData({
      deleteTipFlag: false
    })

    console.log(this.data.shopData);
    var vm = this;
    var url = app.globalData.url;
    var itemArray = [];
    if (this.data.deleteMean == 0) {
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
    } else {
      var item = {};
      item.id = this.data.shopData[this.data.indexone].itemSkuList[this.data.indextwo].itemSkuList[this.data.indexthree].id
      item.deleted = 1;
      itemArray.push(item);

    }
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
        if (res.data.code == "1") {
          vm.deletePageShop();
        } else {
          vm.showTips(res.data.message)
        }

      }, error: function (res) {
      }
    })
  },
  deletePageShop: function () {
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
  cancelSet: function () {
    this.setData({
      setTimeFlag: false
    })
  },
  goToTimeSet: function () {
    this.setData({
      setTimeFlag: false
    })
    wx.navigateBack({
      delta: 1
    })
  },
  savePriceSet: function () {

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
        console.log(res);
        if (res.data.code == '1') {
          vm.savePriceSetTips();
        } else {
          vm.setData({
            loading: false
          })
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
      }
    })
  },
  savePriceSetTips: function () {

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
        if (res.data.code == '1') {
          if (res.data.data.priceStatus == "2") {
            vm.setData({
              setTimeFlag: true,
              loading: false
            })
          } else {
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
        } else {
          vm.setData({
            loading: false
          })
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
      }
    })
  },
  showFixedButChange: function () {
    if (this.data.showFixedBut) {
      this.setData({
        viewWidth: 71,
        viewHeight: 71,
        x: this.data.x + 79,
        y: this.data.y + 166,
        showFixedBut: false
      })
    } else {
      this.setData({
        viewWidth: 150,
        viewHeight: 237,
        x: this.data.x - 79,
        y: this.data.y - 166,
        showFixedBut: true
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
      url: '../addShopInPrice/addShopInPrice?pricePlanId=' + this.data.pricePlanId
    })
  }
})
