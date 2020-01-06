//index.js
//获取应用实例
const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    lastCompanyId: '',
    lastShopType: '',

    orderStatu: '',
    openId: "",
    eId: '',
    orgno: '',
    categoryId: '',
    shopData: [],
    customerData: [],
    shopType: [],
    currentShopType: '',//当前商品类型
    isFirstLoad: true,

    searchFlag: false,//是否显示搜索窗口
    searchText: '',//搜索字段

    companyShowFlag: false,//是否显示公司列表
    currentCompany: '',//当前公司名称
    currentCompanyId: '',//当前公司Id

    carShopData: [],//购物车商品列表

    specialShowFlag: false,//是否显示规格窗口
    specialNum: 0,//下单数量
    allSelect: false,
    currentShopData: {},//当前选择商品信息
    currentShopDataIndex: [],

    collectShowFlag: false,//是否显示收藏窗口
    collectText: '',
    collectId: '',
    collectStatus: '',

    currentShowSkuListIndex: [],//当前展开商品的下标

    screenHeight: 0,
    screenWidth: 0,
    ballBottom: 80,
    ballRight: 20,
    orderRedCount: 0,
    footerData: {
      number: 0,
      orderRedCount: 0,
      status: 1,
      zindex: 2
    },

    tipFalg: false,
    tipText: '',
    timeOutObj: null,

    tempQty: '',
  },
  onShow: function () {
    console.log("onShow");
    console.log(this.data.test);
    if (app.globalData.jumpCompany!=''){
      this.setData({
        currentCompanyId: app.globalData.jumpCompany,
        currentShopType: ''
      })
      app.globalData.jumpCompany = '';
    }
    var vm = this;
    this.getUserShopCart();
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.screenHeight);
        vm.setData({ screenHeight: res.windowHeight, screenWidth: res.windowWidth, })
      },
    });
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        wx.getStorage({
          key: 'userInfo',
          success: function (res) {
            vm.data.orgno = res.data.user.orgno;
            wx.showLoading({
              title: '加载中',
            });
            vm.getCustomer();
            app.getRedCount(vm.data.eId, vm.data.orgno, vm.data.openId);
          },
        })
      }
    })
  },
  onUnload: function () {
    var vm = this;
    wx.setStorage({
      key: 'shopPage',
      data: { companyId: vm.data.currentCompanyId, shopType: vm.data.currentShopType },
    })
  },
  onReady: function () {
    console.log("onReady");
    this.initData();
    // var vm = this;
    // wx.getSystemInfo({
    //   success: function (res) {
    //     console.log(res.screenHeight);
    //     vm.setData({ screenHeight: res.windowHeight, screenWidth: res.windowWidth, })
    //   },
    // });
    // wx.getStorage({
    //   key: 'supplierInfo',
    //   success: function (res) {
    //     vm.data.openId = res.data.openId;
    //     vm.data.eId = res.data.eid;
    //     wx.getStorage({
    //       key: 'userInfo',
    //       success: function (res) {
    //         vm.data.orgno = res.data.user.orgno;
    //         wx.showLoading({
    //           title: '加载中',
    //         });
    //         vm.getCustomer();
    //         app.getRedCount(vm.data.eId, vm.data.orgno, vm.data.openId);
    //       },
    //     })
    //   }
    // })
  },

  onTabItemTap(item) {
    console.log("onTabItemTap" + item.index)
  },

  initData: function () {
    var vm = this;
    wx.getStorage({
      key: 'shopPage',
      success: function (res) {
        vm.data.lastCompanyId = res.data.companyId;
        vm.data.lastShopType = res.data.shopType;
      },
    })
  },

  jumpLink: function (event) {
    var vm = this;
    var url = event.currentTarget.dataset.url;
    wx.redirectTo({ url: url });
  },
  getRedCount: function () {
    var vm = this;
    var url = app.globalData.url;
    var footerData = vm.data.footerData;
    wx.request({
      url: url + 'permission/getUserPermission',
      data: {
        openId: vm.data.openId,
        type: 1
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
          for (var i of res.data.data) {
            if (i.name == '采购管理') {
              for (var j of i.childerList) {
                if (j.url == 'SKX_MODULE_00001') {
                  var redCount = j.totalNumMap["3"];
                  footerData.orderRedCount = redCount;
                  vm.setData({ footerData: footerData });
                  console.log(redCount);
                }
              }
            }
          }
        }
      },
      error: function (res) {
        console.log(321);
      }
    })
  },
  getCustomer: function () {//获取供应商列表
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'customer/getCustomerList', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        businessType: 1
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
        if (vm.data.companyShowFlag) {
          wx.hideLoading();
        }
        if (res.data.code == '1') {
          if (res.data.data.length > 0) {
            if (vm.data.currentCompanyId == '') {
              vm.setData({
                customerData: res.data.data,
                currentCompany: res.data.data[0].companyName,
                currentCompanyId: res.data.data[0].id,
              });
            } else {
              var hasCompany = false;
              for (var i = 0; i < res.data.data.length; i++) {
                if (vm.data.currentCompanyId == res.data.data[i].id) {
                  hasCompany = true;
                  vm.setData({ currentCompany: res.data.data[i].companyName});
                  break;
                }
              }
              if (!hasCompany) {
                vm.setData({
                  customerData: res.data.data,
                  currentCompany: res.data.data[0].companyName,
                  currentCompanyId: res.data.data[0].id,
                });
              }
            }
            vm.setData({
              customerData: res.data.data,
            });
            vm.getShopType();

          } else {
            wx.hideLoading();
          }
        } else {
          vm.showTips(res.data.message);
          wx.hideLoading();
        }
      }, error: function (res) {
        console.log(res);
        vm.showTips('加载失败');
        wx.hideLoading();
      }
    })
  },

  getShopType: function () {//获取商品类型列表
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getOneLevelPrice', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        customerCode: vm.data.currentCompanyId
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
        if (res.data.code == '1') {//返回成功
          if (res.data.data.length > 0) {//有没有商品
            wx.setStorage({
              key: 'shopPage',
              data: { companyId: vm.data.currentCompanyId, shopType: 'favorite' },
            })
            vm.setData({
              shopType: res.data.data,
            })
            if (vm.data.currentShopType == '' || vm.data.currentShopType == 'favorite')
              vm.collectShopList();
            else
              vm.getShopData();
          } else {
            vm.getUserShopCart();
          }
        } else {
          vm.showTips(res.data.message);
          wx.hideLoading();
        }
      }, error: function (res) {
        console.log(res);
        vm.showTips('加载失败');
        wx.hideLoading();
      }
    })
  },

  getShopData: function () {//获取商品列表
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getTwoLevelPrice', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        itemcategoryid1: vm.data.currentShopType,
        customerCode: vm.data.currentCompanyId,
        deleted: 0,
        itemname: vm.data.searchText
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'get',
      success: function (res) {

        if (res.data.code == '1') {
          vm.setData({
            shopData: vm.modifyShopData(res.data.data)
          })
          vm.getUserShopCart();
        } else {
          vm.showTips(res.data.message);
          wx.hideLoading();
        }
      }, error: function (res) {
        console.log(res);
        vm.showTips('加载失败');
        wx.hideLoading();
      }
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

  collectShop: function (currentShowSkuListIndex) {//收藏商品
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/FavoriteProduct', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        id: vm.data.collectId,
        keepStatus: vm.data.collectStatus
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'post',
      success: function (res) {
        if (res.data.code == '1') {
          vm.changeCollectStatus(currentShowSkuListIndex);
          wx.showToast({
            title: vm.data.collectStatus == 0 ? "取消收藏成功" : "收藏成功",
          });
          if (vm.data.currentShopType == 'favorite') {
            vm.setData({ shopData: [] });
            vm.collectShopList();
          }
        } else {
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
        console.log(res);
        wx.showToast({
          title: vm.data.collectStatus == 0 ? "取消收藏失败" : "收藏失败",
        });
      }
    })
  },

  collectShopList: function () {//收藏商品列表
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getFavoriteProductList', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        customerCode: vm.data.currentCompanyId,
        keepStatus: 1
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'get',
      success: function (res) {
        if (res.data.code == '1') {
          console.log(res.data);
          if (res.data.data.length > 0) {
            var shopData = [{
              itemcategoryid2: 'favorite',
              itemcategoryname2: '常用商品',
              itemSkuList: []
            }];
            shopData[0].itemSkuList = res.data.data;
            vm.setData({
              currentShopType: 'favorite',
              shopData: vm.modifyShopData(shopData)
            })
            vm.getUserShopCart();
          } else {
            if (vm.data.isFirstLoad) {
              vm.setData({
                currentShopType: vm.data.shopType[0].itemcategoryid1
              });
              vm.getShopData();
            } else {
              wx.hideLoading();
            }
          }
        } else {
          vm.showTips(res.data.message);
          wx.hideLoading();
        }
      }, error: function (res) {
        console.log(res);
        vm.showTips('加载失败');
        wx.hideLoading();
      }
    })
  },

  modifyShopData: function (shopData) {
    var temp = shopData.slice(0);
    for (var i = 0; i < shopData.length; i++) {
      for (var j = 0; j < shopData[i].itemSkuList.length; j++) {
        if (shopData[i].itemSkuList[j].itemSkuList && shopData[i].itemSkuList[j].itemSkuList.length > 0) {
          var isCollect = 1;
          for (var k = 0; k < shopData[i].itemSkuList[j].itemSkuList.length; k++) {
            if (shopData[i].itemSkuList[j].itemSkuList[k].keepStatus == 0) {
              isCollect = 0;
              break;
            }
          }
          var item = {
            id: shopData[i].itemSkuList[j].id,
            itemname: shopData[i].itemSkuList[j].itemname,
            itemspecifications: shopData[i].itemSkuList[j].itemspecifications,
            keepStatus: shopData[i].itemSkuList[j].keepStatus,
            price: shopData[i].itemSkuList[j].price,
            unit: shopData[i].itemSkuList[j].unit,
            assistantunit: shopData[i].itemSkuList[j].assistantunit,
            itemnumber: shopData[i].itemSkuList[j].itemnumber,
            propertiesid: shopData[i].itemSkuList[j].propertiesid,
            itemcategoryid1: shopData[i].itemSkuList[j].itemcategoryid1,
            itemcategoryid2: shopData[i].itemSkuList[j].itemcategoryid2,
            itemcategoryid3: shopData[i].itemSkuList[j].itemcategoryid3,
            itemcategoryname1: shopData[i].itemSkuList[j].itemcategoryname1,
            itemcategoryname2: shopData[i].itemSkuList[j].itemcategoryname2,
            itemcategoryname3: shopData[i].itemSkuList[j].itemcategoryname3,
            picthumburl: shopData[i].itemSkuList[j].picthumburl,
          };
          temp[i].itemSkuList[j].itemSkuList.push(item);
          temp[i].itemSkuList[j].keepStatus = isCollect == 1 && shopData[i].itemSkuList[j].keepStatus == 1 ? 1 : 0;
        }

      }
    }
    for (var i = 0; i < temp.length; i++) {
      for (var j = 0; j < temp[i].itemSkuList.length; j++) {
        if (temp[i].itemSkuList[j].itemSkuList && temp[i].itemSkuList[j].itemSkuList.length > 0) {
          var max = parseFloat(temp[i].itemSkuList[j].itemSkuList[0].price);
          var min = parseFloat(temp[i].itemSkuList[j].itemSkuList[0].price);
          for (var k = 0; k < temp[i].itemSkuList[j].itemSkuList.length; k++) {
            if (parseFloat(temp[i].itemSkuList[j].itemSkuList[k].price) > max) {
              max = temp[i].itemSkuList[j].itemSkuList[k].price;
            }
            if (parseFloat(temp[i].itemSkuList[j].itemSkuList[k].price) < min) {
              min = temp[i].itemSkuList[j].itemSkuList[k].price;
            }
            temp[i].itemSkuList[j].itemSkuList[k].number = 0;
          }
          temp[i].itemSkuList[j].maxPrice = max;
          temp[i].itemSkuList[j].minPrice = min;
        } else
          temp[i].itemSkuList[j].number = 0;
      }
    }
    return temp;
  },

  showSearchBox: function () {//显示搜索窗口
    this.setData({ searchText: '' });
    if (this.data.searchFlag) {
      this.setData({
        searchFlag: false,
        currentShopType: this.data.shopType[0].itemcategoryid1
      })
      this.getShopData();
    } else {
      this.setData({
        searchFlag: true
      })
    }
  },

  searchInput: function (event) {
    var searchText = event.detail.value;
    if (searchText != '') {
      this.setData({
        searchText: searchText, currentShopType: '', shopData: [],
      });

      this.getShopData();
    }
  },

  showItemSku: function (e) {
    var index1 = e.currentTarget.dataset.indexone;
    var index2 = e.currentTarget.dataset.indextwo;
    var tempShopData = this.data.shopData;

    tempShopData[index1].itemSkuList[index2].showitemSkuList = tempShopData[index1].itemSkuList[index2].showitemSkuList == undefined || tempShopData[index1].itemSkuList[index2].showitemSkuList == false ? true : false;
    this.setData({ shopData: tempShopData });
  },

  addShopCar2: function (event, event2) {
    var currentShowSkuListIndex = this.data.currentShowSkuListIndex;
    var tempShopData = this.data.shopData;//商品列表
    var index, index2;
    try {
      index = event.currentTarget.dataset.indexone;
      index2 = event.currentTarget.dataset.indextwo;
    } catch (ex) {
      console.log('全部加购');
      index = event;
      index2 = event2;
    }
    var indexList = [];
    var currentShopData = tempShopData[index].itemSkuList[index2];//当前商品
    try {//收起上一个展开的商品
      tempShopData[currentShowSkuListIndex[0]].itemSkuList[currentShowSkuListIndex[1]].showitemSkuList = false;
    } catch (ex) { }
    if (tempShopData[index].itemSkuList[index2].itemSkuList == undefined || tempShopData[index].itemSkuList[index2].itemSkuList.length == 0) {//判断多规格商品
      if (tempShopData[index].itemSkuList[index2].number) {
        tempShopData[index].itemSkuList[index2].number = (parseFloat(tempShopData[index].itemSkuList[index2].number) + 1).toFixed(2);
      } else {
        tempShopData[index].itemSkuList[index2].number = parseFloat(1.00).toFixed(2);
      }
      this.modifyShopCart(index, index2, tempShopData[index].itemSkuList[index2].existItemSku);
    } else if (tempShopData[index].itemSkuList[index2].itemSkuList && tempShopData[index].itemSkuList[index2].itemSkuList.length > 0) {
      tempShopData[index].itemSkuList[index2].showitemSkuList = true;
      currentShowSkuListIndex = [];
      currentShowSkuListIndex.push(index);
      currentShowSkuListIndex.push(index2);
      try {
        if (tempShopData[index].itemSkuList[index2].mixNum == false) {
          indexList.push(index);
          indexList.push(index2);
          indexList.push(tempShopData[index].itemSkuList[index2].singleIndex);
        }
      } catch (ex) { }
    }
    this.setData({ shopData: tempShopData, currentShowSkuListIndex: currentShowSkuListIndex });
    try {
      if (tempShopData[index].itemSkuList[index2].mixNum == false)
        this.addSpecialShopCar(indexList);
    } catch (ex) { }
  },

  deleteShopCar2: function (event) {
    var shopDataList = this.data.shopData;
    var index1 = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var indexList = [];
    if (shopDataList[index1].itemSkuList[index2].itemSkuList == undefined || shopDataList[index1].itemSkuList[index2].itemSkuList.length == 0) {//判断是否是多规格数据
      if (shopDataList[index1].itemSkuList[index2].number >= 1) {
        shopDataList[index1].itemSkuList[index2].number = (parseFloat(shopDataList[index1].itemSkuList[index2].number) - 1).toFixed(2);
        this.modifyShopCart(index1, index2, shopDataList[index1].itemSkuList[index2].existItemSku);
      }
    } else if (shopDataList[index1].itemSkuList[index2].itemSkuList && shopDataList[index1].itemSkuList[index2].itemSkuList.length > 0) {
      if (shopDataList[index1].itemSkuList[index2].mixNum == false) {
        indexList.push(index1);
        indexList.push(index2);
        indexList.push(shopDataList[index1].itemSkuList[index2].singleIndex);
      }
    }
    this.setData({ shopData: shopDataList });
    if (shopDataList[index1].itemSkuList[index2].mixNum == false)
      this.deleteSpecialShopCar(indexList);
  },

  addSpecialShopCar: function (event) {
    var shopDataList = this.data.shopData;
    var index1, index2, index3;
    try {
      index1 = event.currentTarget.dataset.indexone;
      index2 = event.currentTarget.dataset.indextwo;
      index3 = event.currentTarget.dataset.indexthird;
    } catch (ex) {
      index1 = event[0];
      index2 = event[1];
      index3 = event[2];
    }
    if (shopDataList[index1].itemSkuList[index2].itemSkuList[index3].number) {
      shopDataList[index1].itemSkuList[index2].itemSkuList[index3].number = (parseFloat(shopDataList[index1].itemSkuList[index2].itemSkuList[index3].number) + 1).toFixed(2);
    } else {
      shopDataList[index1].itemSkuList[index2].itemSkuList[index3].number = parseFloat(1.00).toFixed(2);
    }
    this.setData({
      shopData: shopDataList
    });
    this.modifyShopCart2(index1, index2, index3);
    this.getTheTotalNum(index1, index2, index3);
  },

  deleteSpecialShopCar: function (event) {
    var shopDataList = this.data.shopData;
    var index1, index2, index3;
    try {
      index1 = event.currentTarget.dataset.indexone;
      index2 = event.currentTarget.dataset.indextwo;
      index3 = event.currentTarget.dataset.indexthird;
    } catch (ex) {
      index1 = event[0];
      index2 = event[1];
      index3 = event[2];
    }
    if (shopDataList[index1].itemSkuList[index2].itemSkuList[index3].number) {
      if (shopDataList[index1].itemSkuList[index2].itemSkuList[index3].number >= 1) {
        shopDataList[index1].itemSkuList[index2].itemSkuList[index3].number = (parseFloat(shopDataList[index1].itemSkuList[index2].itemSkuList[index3].number) - 1).toFixed(2);
      }
    }
    this.setData({
      shopData: shopDataList
    });
    this.modifyShopCart2(index1, index2, index3);
    this.getTheTotalNum(index1, index2, index3);
  },

  allInCart: function () {//全部加购
    var shopData = this.data.shopData[0].itemSkuList;
    for (var i = 0; i < shopData.length; i++) {
      if (shopData[i].number == undefined || shopData[i].number == 0) {
      }
      this.addShopCar2(0, i);
    }
  },

  getTheTotalNum: function (index1, index2, index3) {//统计多规格商品的下单总数
    var shopDataList = this.data.shopData;
    var totalNum = 0;
    var mixNum = 0;//是否混合数据
    var singleIndex = 0;//单一数据的下标
    for (var i = 0; i < shopDataList[index1].itemSkuList[index2].itemSkuList.length; i++) {
      if (shopDataList[index1].itemSkuList[index2].itemSkuList[i].number > 0) {
        mixNum++;
        singleIndex = i;
      }
      if (shopDataList[index1].itemSkuList[index2].itemSkuList[i].number)
        totalNum += parseFloat(shopDataList[index1].itemSkuList[index2].itemSkuList[i].number);
    }
    if (mixNum == 1) {
      shopDataList[index1].itemSkuList[index2].mixNum = false;
    } else {
      shopDataList[index1].itemSkuList[index2].mixNum = true;
    }
    if (mixNum == 1) {
      shopDataList[index1].itemSkuList[index2].singleIndex = singleIndex;
    }
    shopDataList[index1].itemSkuList[index2].number = totalNum;
    this.setData({
      shopData: shopDataList
    });
  },

  closeBg: function () {
    this.setData({
      currentShopData: '',
      currentShopDataIndex: [],
      companyShowFlag: false,
      specialShowFlag: false,
      collectShowFlag: false,
    });
    this.changeZindex();
  },

  setCompanyShowFlag: function () {//控制公司列表显示
    if (this.data.currentCompany == '') {
      wx.showLoading({
        title: '加载中',
      });
      this.getCustomer();
    }
    var companyShowFlag = this.data.companyShowFlag;
    this.setData({ companyShowFlag: !companyShowFlag });
    this.changeZindex();
  },

  selectCompany: function (e) {//公司列表的点击事件 
    wx.showLoading({
      title: '加载中',
    });
    this.setData({
      currentCompany: e.currentTarget.dataset.companyname,
      currentCompanyId: e.currentTarget.dataset.companyid,
      lastCompany: '',
      lastShopType: '',
      currentShopType: '',
      isFirstLoad: true,
      shopData: [],
      shopType: [],
      companyShowFlag: false
    });
    this.getShopType();
    this.changeZindex();
  },

  selectShopType: function (e) {//选择商品类型
    wx.showLoading({
      title: '加载中',
    });
    this.setData({
      currentShopType: e.currentTarget.dataset.id,
      isFirstLoad: false,
      shopData: [],
    });
    if (e.currentTarget.dataset.id == 'favorite') {
      this.collectShopList();
    } else {
      this.getShopData();
    }
  },

  previewImage: function (e) {
    var photoPath = e.currentTarget.dataset.url;
    if (photoPath == undefined || photoPath == '') {
      photoPath = 'http://member.gdskx.com:90/sso-server/images/logo.png';
    }
    wx.previewImage({
      urls: [photoPath],
    })
  },

  setShowFlag: function () {//隐藏规格列表
    this.setData({ specialShowFlag: false, collectShowFlag: false, currentShopData: '', currentShopDataIndex: [], });
  },

  showShopInputDialog: function (event) {
    var vm = this;
    var index = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var index3 = event.currentTarget.dataset.indexthird;
    var currentShopData;
    var currentShopDataIndex = [];
    currentShopDataIndex.push(index);
    currentShopDataIndex.push(index2);
    currentShopDataIndex.push(index3);
    if (index3 == undefined) {
      currentShopData = vm.data.shopData[index].itemSkuList[index2];
    } else {
      currentShopData = vm.data.shopData[index].itemSkuList[index2].itemSkuList[index3];
    }
    vm.setData({ specialShowFlag: true, currentShopData: currentShopData, currentShopDataIndex: currentShopDataIndex })
  },

  bindInput: function (event) {
    var vm = this;
    var index = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var index3 = event.currentTarget.dataset.indexthird;
    var value = event.detail.value;
    var shopDataList = this.data.shopData;
    if (value.charAt(0) == '.') {
      vm.setData({ shopData: vm.data.shopData });
      return
    }
    var pattern = /^(0|[1-9][0-9]*|[1-9]\d*[.]?\d{0,2}|[0][.]\d?[1-9]?)$/;
    if (value != '' && !pattern.test(value)) {
      vm.setData({ shopData: vm.data.shopData });
      return
    }
    if (value != '' && value != '0' && value.charAt(value.length - 1) != '.') {
      if (index3 == undefined) {
        shopDataList[index].itemSkuList[index2].number = parseFloat(value);
        vm.modifyShopCart(index, index2, shopDataList[index].itemSkuList[index2].existItemSku);
        vm.setData({ shopData: shopDataList });
      } else {
        shopDataList[index].itemSkuList[index2].itemSkuList[index3].number = parseFloat(value);
        vm.setData({ shopData: shopDataList });
        vm.modifyShopCart2(index, index2, index3);
        vm.getTheTotalNum(index, index2, index3);
      }
    }
  },

  bindFocus: function (event) {
    var vm = this;
    var index = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var index3 = event.currentTarget.dataset.indexthird;
    var shopData = this.data.shopData;
    if (index3 == undefined) {
      this.setData({ tempQty: shopData[index].itemSkuList[index2].number })
      shopData[index].itemSkuList[index2].number = undefined;
      this.setData({ shopData: shopData })
    } else {
      this.setData({ tempQty: shopData[index].itemSkuList[index2].itemSkuList[index3].number })
      shopData[index].itemSkuList[index2].itemSkuList[index3].number = undefined;
      this.setData({ shopData: shopData })
    }
  },

  bindBlur: function (event) {
    var vm = this;
    var index = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var index3 = event.currentTarget.dataset.indexthird;
    var value = event.detail.value;
    var shopDataList = this.data.shopData;
    if (value == '0') {
      if (index3 == undefined) {
        shopDataList[index].itemSkuList[index2].number = 0;
        vm.modifyShopCart(index, index2, shopDataList[index].itemSkuList[index2].existItemSku);
        vm.setData({ shopData: shopDataList });
      } else {
        shopDataList[index].itemSkuList[index2].itemSkuList[index3].number = 0;
        vm.setData({ shopData: shopDataList });
        vm.modifyShopCart2(index, index2, index3);
        vm.getTheTotalNum(index, index2, index3);
      }
    } else if (value == '') {
      if (index3 == undefined) {
        shopDataList[index].itemSkuList[index2].number = this.data.tempQty;
        vm.setData({ shopData: shopDataList });
      } else {
        shopDataList[index].itemSkuList[index2].itemSkuList[index3].number = this.data.tempQty;
        vm.setData({ shopData: shopDataList });
      }
    } else if (value.charAt(value.length - 1) == '.') {
      vm.setData({ shopData: shopDataList });
    } else {
      if (index3 == undefined) {
        shopDataList[index].itemSkuList[index2].number = parseFloat(shopDataList[index].itemSkuList[index2].number).toFixed(2);
        vm.modifyShopCart(index, index2, shopDataList[index].itemSkuList[index2].existItemSku);
        vm.setData({ shopData: shopDataList });
      } else {
        shopDataList[index].itemSkuList[index2].itemSkuList[index3].number = parseFloat(shopDataList[index].itemSkuList[index2].itemSkuList[index3].number).toFixed(2);
        vm.setData({ shopData: shopDataList });
        vm.modifyShopCart2(index, index2, index3);
        vm.getTheTotalNum(index, index2, index3);
      }
    }
  },

  updateShopNumber: function () {
    var vm = this;
    var shopData = vm.data.shopData;
    var currentShopData = vm.data.currentShopData;
    var currentShopDataIndex = vm.data.currentShopDataIndex;
    if (currentShopDataIndex[2] == undefined) {
      shopData[currentShopDataIndex[0]].itemSkuList[currentShopDataIndex[1]].number = currentShopData.number;
      vm.setData({ shopData: shopData });
      vm.modifyShopCart(currentShopDataIndex[0], currentShopDataIndex[1], currentShopData.existItemSku);
    } else {
      shopData[currentShopDataIndex[0]].itemSkuList[currentShopDataIndex[1]].itemSkuList[currentShopDataIndex[2]].number = currentShopData.number;
      vm.setData({ shopData: shopData });
      vm.modifyShopCart2(currentShopDataIndex[0], currentShopDataIndex[1], currentShopDataIndex[2]);
      vm.getTheTotalNum(currentShopDataIndex[0], currentShopDataIndex[1], currentShopDataIndex[2]);
    }
    vm.setData({
      currentShopData: '',
      currentShopDataIndex: [],
      specialShowFlag: false,
    });
  },

  showCollectDialog: function (event) {//显示收藏窗口
    var shopData = this.data.shopData;
    var indexList = [];
    var currentShowSkuListIndex = this.data.currentShowSkuListIndex;
    var index1 = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var index3 = event.currentTarget.dataset.indexthird;
    if (shopData[index1].itemSkuList[index2].itemSkuList == undefined || shopData[index1].itemSkuList[index2].itemSkuList.length == 0) {
      currentShowSkuListIndex = [];
      currentShowSkuListIndex.push(index1);
      currentShowSkuListIndex.push(index2);

      this.setData({ currentShopData: shopData[index1].itemSkuList[index2], collectShowFlag: true, currentShowSkuListIndex: currentShowSkuListIndex, collectText: shopData[index1].itemSkuList[index2].keepStatus == 0 ? '收藏' : '取消收藏', collectStatus: shopData[index1].itemSkuList[index2].keepStatus == 0 ? 1 : 0, collectId: shopData[index1].itemSkuList[index2].id });
    } else {
      if (index3 == undefined) {
        try {
          shopData[currentShowSkuListIndex[0]].itemSkuList[currentShowSkuListIndex[1]].showitemSkuList = false;
        } catch (ex) { }
        shopData[index1].itemSkuList[index2].showitemSkuList = true;
        currentShowSkuListIndex = [];
        currentShowSkuListIndex.push(index1);
        currentShowSkuListIndex.push(index2);
        this.setData({ currentShowSkuListIndex: currentShowSkuListIndex, shopData: shopData, });
      } else {
        currentShowSkuListIndex = [];
        currentShowSkuListIndex.push(index1);
        currentShowSkuListIndex.push(index2);
        currentShowSkuListIndex.push(index3);
        this.setData({ currentShopData: shopData[index1].itemSkuList[index2].itemSkuList[index3], collectShowFlag: true, currentShowSkuListIndex: currentShowSkuListIndex, collectText: shopData[index1].itemSkuList[index2].itemSkuList[index3].keepStatus == 0 ? '收藏' : '取消收藏', collectStatus: shopData[index1].itemSkuList[index2].itemSkuList[index3].keepStatus == 0 ? 1 : 0, collectId: shopData[index1].itemSkuList[index2].itemSkuList[index3].id });
      }
    }
    this.changeZindex();
  },

  showCollectDialog2: function (event) {
    var shopData = this.data.shopData;
    var indexList = [];
    var collectId, collectStatus;
    var currentShowSkuListIndex = this.data.currentShowSkuListIndex;
    var index1 = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var index3 = event.currentTarget.dataset.indexthird;
    if (index3 == undefined) {
      if (shopData[index1].itemSkuList[index2].itemSkuList != undefined && shopData[index1].itemSkuList[index2].itemSkuList.length > 0) {
        // try {
        //   shopData[currentShowSkuListIndex[0]].itemSkuList[currentShowSkuListIndex[1]].showitemSkuList = false;
        // } catch (ex) { }
        // shopData[index1].itemSkuList[index2].showitemSkuList = true;
        // currentShowSkuListIndex = [];
        // currentShowSkuListIndex.push(index1);
        // currentShowSkuListIndex.push(index2);
        // this.setData({ currentShowSkuListIndex: currentShowSkuListIndex, shopData: shopData, });
        this.collectShopSkuList(index1, index2);
        return;
      } else {
        currentShowSkuListIndex = [];
        currentShowSkuListIndex.push(index1);
        currentShowSkuListIndex.push(index2);
        collectId = shopData[index1].itemSkuList[index2].id;
        collectStatus = shopData[index1].itemSkuList[index2].keepStatus == 0 ? 1 : 0;
      }
    } else {
      currentShowSkuListIndex = [];
      currentShowSkuListIndex.push(index1);
      currentShowSkuListIndex.push(index2);
      currentShowSkuListIndex.push(index3);
      collectId = shopData[index1].itemSkuList[index2].itemSkuList[index3].id;
      collectStatus = shopData[index1].itemSkuList[index2].itemSkuList[index3].keepStatus == 0 ? 1 : 0;

    }
    this.setData({ currentShowSkuListIndex: currentShowSkuListIndex, collectId: collectId, collectStatus: collectStatus });
    this.collectShop(currentShowSkuListIndex);
  },

  collectShopSkuList: function (index1, index2) {
    console.log('collectShopSkuList');
    var shop = this.data.shopData[index1].itemSkuList[index2];
    for (var i = 0; i < shop.itemSkuList.length; i++) {
      if (shop.keepStatus == shop.itemSkuList[i].keepStatus) {
        console.log('collectShopSkuList go' + shop.itemSkuList[i].id);
        var currentShowSkuListIndex = [];
        currentShowSkuListIndex.push(index1);
        currentShowSkuListIndex.push(index2);
        currentShowSkuListIndex.push(i);
        var collectId = shop.itemSkuList[i].id;
        var collectStatus = shop.keepStatus == 0 ? 1 : 0;
        this.setData({ currentShowSkuListIndex: currentShowSkuListIndex, collectId: collectId, collectStatus: collectStatus });
        this.collectShop(currentShowSkuListIndex);
      }
    }
  },

  changeCollectStatus: function (currentShowSkuListIndex) {
    var shopData = this.data.shopData;
    var index3 = currentShowSkuListIndex[2];
    if (index3 == undefined) {
      shopData[currentShowSkuListIndex[0]].itemSkuList[currentShowSkuListIndex[1]].keepStatus = shopData[currentShowSkuListIndex[0]].itemSkuList[currentShowSkuListIndex[1]].keepStatus == 0 ? 1 : 0;
      this.changeCartCollectStatus(shopData[currentShowSkuListIndex[0]].itemSkuList[currentShowSkuListIndex[1]].id);
    } else {
      shopData[currentShowSkuListIndex[0]].itemSkuList[currentShowSkuListIndex[1]].itemSkuList[currentShowSkuListIndex[2]].keepStatus = shopData[currentShowSkuListIndex[0]].itemSkuList[currentShowSkuListIndex[1]].itemSkuList[currentShowSkuListIndex[2]].keepStatus == 0 ? 1 : 0;
      this.changeCartCollectStatus(shopData[currentShowSkuListIndex[0]].itemSkuList[currentShowSkuListIndex[1]].itemSkuList[currentShowSkuListIndex[2]].id);
    }
    this.setData({ shopData: shopData, });
    this.setShowFlag();
    this.checkShopCollectStatus();
    wx.hideLoading();
  },

  changeCartCollectStatus: function (id) {
    console.log(id);
    var carShopData = this.data.carShopData;
    var hasShop = false;
    for (var i = 0; i < carShopData.length; i++) {
      var isBreak = false;
      for (var j = 0; j < carShopData[i].shopList.length; j++) {
        if (carShopData[i].shopList[j].itemId == id) {
          isBreak = true;
          hasShop = true;
          carShopData[i].shopList[j].keepStatus = carShopData[i].shopList[j].keepStatus == 0 ? 1 : 0;
        }
      }
      if (isBreak) break;
    }
    if (hasShop) {
      this.setUserShopCart(carShopData);
    }
  },

  checkShopCollectStatus: function () {
    var shopData = this.data.shopData;
    for (var i = 0; i < shopData.length; i++) {
      for (var j = 0; j < shopData[i].itemSkuList.length; j++) {
        if (shopData[i].itemSkuList[j].itemSkuList != undefined) {
          var allCheck = true;
          for (var k = 0; k < shopData[i].itemSkuList[j].itemSkuList.length; k++) {
            if (shopData[i].itemSkuList[j].itemSkuList[k].keepStatus == 0) {
              allCheck = false;
              break;
            }
          }
          shopData[i].itemSkuList[j].keepStatus = allCheck ? 1 : 0;
        }
      }
    }
    this.setData({ shopData: shopData })
  },

  specialRadioClick: function (e) {//规格列表的点击事件
    var i = e.currentTarget.dataset.indexone;
    var j = e.currentTarget.dataset.indextwo;
    var temp = this.data.currentShopData;
    for (var index = 0; index < temp.propertiesnamejson[i].value.length; index++) {
      if (index == j) {
        temp.propertiesnamejson[i].value[j].checked = 'true';
      } else {
        temp.propertiesnamejson[i].value[index].checked = 'false';
      }
    }
    temp.propertiesnamejson[i].isSelect = true;//标记这一个规格已选择
    this.setData({
      currentShopData: temp
    });
    this.checkSpecialAllSelect();
  },

  checkSpecialAllSelect: function () {//检查规格列表中的规格是否都选择了
    var temp = this.data.currentShopData;
    var allSelect = false;
    for (var i = 0; i < temp.propertiesnamejson.length; i++) {
      if (temp.propertiesnamejson[i].isSelect) {
        allSelect = true;
      } else {
        allSelect = false;
        break;
      }
    }
    this.setData({ allSelect: allSelect })
  },

  specialInput: function (e) {//规格弹窗中的输入框
    this.setData({ specialNum: e.detail.value });
  },

  specialAdd: function () {//规格弹窗中的增加按钮
    var currentShopData = this.data.currentShopData;
    currentShopData.number = parseFloat(currentShopData.number) + 1;
    this.setData({ currentShopData: currentShopData });
  },

  specialMinus: function () {//规格弹窗中的减少按钮
    var currentShopData = this.data.currentShopData;
    if (currentShopData.number >= 1) {
      currentShopData.number = parseFloat(currentShopData.number) - 1;
      this.setData({ currentShopData: currentShopData });
    }
  },

  modifyShopCart: function (i1, i2, isMore) {//修改缓存中的购物车
    var vm = this;

    var carShopData = vm.data.carShopData;//购物车

    var tempCart = vm.data.carShopData;

    var shopData = vm.data.shopData;//商品列表

    console.log('singleModel')

    var shopId = shopData[i1].itemSkuList[i2].id;//当前商品Id

    if (tempCart.length > 0) {//判断购物车是否为空

      for (var k = 0; k < tempCart.length; k++) {//购物车是否存在当前商品

        if (tempCart[k].companyId == vm.data.currentCompanyId) {//寻找当前公司的购物车列表

          if (tempCart[k].shopList.length > 0) {
            for (var l = 0; l < tempCart[k].shopList.length; l++) {//购物车是否存在当前商品

              if (shopId == tempCart[k].shopList[l].itemId) {//存在
                if (shopData[i1].itemSkuList[i2].number != 0) {
                  carShopData[k].shopList[l].qty = shopData[i1].itemSkuList[i2].number;
                } else {
                  carShopData[k].shopList.splice(l, 1);
                  console.log(carShopData[k].shopList);
                }
                break;
              } else {

                if (l == tempCart[k].shopList.length - 1) {//不存在

                  var shop = {
                    "itemId": shopData[i1].itemSkuList[i2].id,
                    "itemName": shopData[i1].itemSkuList[i2].itemname,
                    "propertiesid": shopData[i1].itemSkuList[i2].propertiesid,
                    "itemspecifications": shopData[i1].itemSkuList[i2].itemspecifications,
                    "typeId": shopData[i1].itemSkuList[i2].itemcategoryid1,
                    "isMore": isMore,
                    "itemnumber": shopData[i1].itemSkuList[i2].itemnumber,
                    "keepStatus": shopData[i1].itemSkuList[i2].keepStatus,
                    "qty": shopData[i1].itemSkuList[i2].number,
                    "price": shopData[i1].itemSkuList[i2].price,
                    "unit": shopData[i1].itemSkuList[i2].unit,
                    "assistantunit": shopData[i1].itemSkuList[i2].assistantunit,
                    "picthumburl": shopData[i1].itemSkuList[i2].picthumburl,
                  };
                  carShopData[k].shopList.unshift(shop);
                  break;
                }
              }
            }
          } else {
            var shop = {
              "itemId": shopData[i1].itemSkuList[i2].id,
              "itemName": shopData[i1].itemSkuList[i2].itemname,
              "propertiesid": shopData[i1].itemSkuList[i2].propertiesid,
              "itemspecifications": shopData[i1].itemSkuList[i2].itemspecifications,
              "typeId": shopData[i1].itemSkuList[i2].itemcategoryid1,
              "isMore": isMore,
              "itemnumber": shopData[i1].itemSkuList[i2].itemnumber,
              "keepStatus": shopData[i1].itemSkuList[i2].keepStatus,
              "qty": shopData[i1].itemSkuList[i2].number,
              "price": shopData[i1].itemSkuList[i2].price,
              "unit": shopData[i1].itemSkuList[i2].unit,
              "assistantunit": shopData[i1].itemSkuList[i2].assistantunit,
              "picthumburl": shopData[i1].itemSkuList[i2].picthumburl,
            };

            carShopData[k].shopList.push(shop);
          }
          break;

        } else {

          if (k == tempCart.length - 1) {//当前公司购物车为空，直接插入数据

            var shop = {
              "companyId": vm.data.currentCompanyId,
              "companyName": vm.data.currentCompany,
              "shopList": [
                {
                  "itemId": shopData[i1].itemSkuList[i2].id,//商品id
                  "itemName": shopData[i1].itemSkuList[i2].itemname,//商品名称
                  "propertiesid": shopData[i1].itemSkuList[i2].propertiesid,//规格id
                  "itemspecifications": shopData[i1].itemSkuList[i2].itemspecifications,//规格
                  "typeId": shopData[i1].itemSkuList[i2].itemcategoryid1,//商品类型
                  "isMore": isMore,//多规格
                  "itemnumber": shopData[i1].itemSkuList[i2].itemnumber,
                  "keepStatus": shopData[i1].itemSkuList[i2].keepStatus,//收藏状态
                  "qty": shopData[i1].itemSkuList[i2].number,//数量
                  "price": shopData[i1].itemSkuList[i2].price,//价格
                  "unit": shopData[i1].itemSkuList[i2].unit,//单位
                  "assistantunit": shopData[i1].itemSkuList[i2].assistantunit,
                  "picthumburl": shopData[i1].itemSkuList[i2].picthumburl,
                }
              ]
            };

            carShopData.push(shop);
          }
        }
      }
    } else {//当前购物车为空，直接插入

      var shop = {
        "companyId": vm.data.currentCompanyId,
        "companyName": vm.data.currentCompany,
        "shopList": [
          {
            "itemId": shopData[i1].itemSkuList[i2].id,
            "itemName": shopData[i1].itemSkuList[i2].itemname,
            "propertiesid": shopData[i1].itemSkuList[i2].propertiesid,
            "itemspecifications": shopData[i1].itemSkuList[i2].itemspecifications,
            "typeId": shopData[i1].itemSkuList[i2].itemcategoryid1,
            "isMore": isMore,
            "itemnumber": shopData[i1].itemSkuList[i2].itemnumber,
            "keepStatus": shopData[i1].itemSkuList[i2].keepStatus,
            "qty": shopData[i1].itemSkuList[i2].number,
            "price": shopData[i1].itemSkuList[i2].price,
            "unit": shopData[i1].itemSkuList[i2].unit,
            "assistantunit": shopData[i1].itemSkuList[i2].assistantunit,
            "picthumburl": shopData[i1].itemSkuList[i2].picthumburl,
          }
        ]
      };

      carShopData.push(shop);
    }
    var total = 0;
    for (var i = 0; i < carShopData.length; i++) {//计算各个供应商的订单数
      carShopData[i].total = carShopData[i].shopList.length;
      total += carShopData[i].shopList.length;
    }
    vm.setTabBar(total);
    vm.setData({ footerData: { number: total, status: 1, zindex: 2, orderRedCount: vm.data.orderRedCount } });
    wx.getStorage({
      key: 'userShopCart',
      success: function (res) {
        var userShopCart = res.data;
        for (var j = 0; j < userShopCart.length; j++) {
          if (userShopCart[j].openId == vm.data.openId) {
            userShopCart[j].shopList = carShopData;
            break;
          }
        }
        wx.setStorage({
          key: 'userShopCart',
          data: userShopCart,
        })
      },
    })
    //this.setUserShopCart();
  },

  modifyShopCart2: function (i1, i2, i3) {//修改缓存中的购物车
    var vm = this;

    var carShopData = vm.data.carShopData;//购物车

    var tempCart = vm.data.carShopData;

    var shopData = vm.data.shopData;//商品列表

    console.log('moreModel')

    var shopId = shopData[i1].itemSkuList[i2].itemSkuList[i3].id;//当前商品Id

    if (tempCart.length > 0) {//判断购物车是否为空

      for (var k = 0; k < tempCart.length; k++) {//购物车是否存在当前商品

        if (tempCart[k].companyId == vm.data.currentCompanyId) {//寻找当前公司的购物车列表
          if (tempCart[k].shopList.length > 0) {
            for (var l = 0; l < tempCart[k].shopList.length; l++) {//购物车是否存在当前商品

              if (shopId == tempCart[k].shopList[l].itemId) {//存在
                if (shopData[i1].itemSkuList[i2].itemSkuList[i3].number != 0) {
                  carShopData[k].shopList[l].qty = shopData[i1].itemSkuList[i2].itemSkuList[i3].number;
                } else {
                  carShopData[k].shopList.splice(l, 1);
                  console.log(carShopData[k].shopList);
                }
                break;
              } else {

                if (l == tempCart[k].shopList.length - 1) {//不存在

                  var shop = {
                    "itemId": shopData[i1].itemSkuList[i2].itemSkuList[i3].id,
                    "itemName": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemname,
                    "propertiesid": shopData[i1].itemSkuList[i2].itemSkuList[i3].propertiesid,
                    "itemspecifications": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemspecifications,
                    "typeId": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemcategoryid1,
                    "isMore": true,
                    "itemnumber": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemnumber,
                    "keepStatus": shopData[i1].itemSkuList[i2].itemSkuList[i3].keepStatus,
                    "qty": shopData[i1].itemSkuList[i2].itemSkuList[i3].number,
                    "price": shopData[i1].itemSkuList[i2].itemSkuList[i3].price,
                    "unit": shopData[i1].itemSkuList[i2].itemSkuList[i3].unit,
                    "assistantunit": shopData[i1].itemSkuList[i2].itemSkuList[i3].assistantunit,
                    "picthumburl": shopData[i1].itemSkuList[i2].itemSkuList[i3].picthumburl,
                  };

                  carShopData[k].shopList.unshift(shop);
                  break;
                }
              }
            }
          } else {
            var shop = {
              "itemId": shopData[i1].itemSkuList[i2].itemSkuList[i3].id,
              "itemName": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemname,
              "propertiesid": shopData[i1].itemSkuList[i2].itemSkuList[i3].propertiesid,
              "itemspecifications": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemspecifications,
              "typeId": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemcategoryid1,
              "isMore": true,
              "itemnumber": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemnumber,
              "keepStatus": shopData[i1].itemSkuList[i2].itemSkuList[i3].keepStatus,
              "qty": shopData[i1].itemSkuList[i2].itemSkuList[i3].number,
              "price": shopData[i1].itemSkuList[i2].itemSkuList[i3].price,
              "unit": shopData[i1].itemSkuList[i2].itemSkuList[i3].unit,
              "assistantunit": shopData[i1].itemSkuList[i2].itemSkuList[i3].assistantunit,
              "picthumburl": shopData[i1].itemSkuList[i2].itemSkuList[i3].picthumburl,
            };

            carShopData[k].shopList.push(shop);
          }
          break;

        } else {

          if (k == tempCart.length - 1) {//当前公司购物车为空，直接插入数据

            var shop = {
              "companyId": vm.data.currentCompanyId,
              "companyName": vm.data.currentCompany,
              "shopList": [
                {
                  "itemId": shopData[i1].itemSkuList[i2].itemSkuList[i3].id,
                  "itemName": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemname,
                  "propertiesid": shopData[i1].itemSkuList[i2].itemSkuList[i3].propertiesid,
                  "itemspecifications": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemspecifications,
                  "typeId": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemcategoryid1,
                  "isMore": true,
                  "itemnumber": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemnumber,
                  "keepStatus": shopData[i1].itemSkuList[i2].itemSkuList[i3].keepStatus,
                  "qty": shopData[i1].itemSkuList[i2].itemSkuList[i3].number,
                  "price": shopData[i1].itemSkuList[i2].itemSkuList[i3].price,
                  "unit": shopData[i1].itemSkuList[i2].itemSkuList[i3].unit,
                  "assistantunit": shopData[i1].itemSkuList[i2].itemSkuList[i3].assistantunit,
                  "picthumburl": shopData[i1].itemSkuList[i2].itemSkuList[i3].picthumburl,
                }
              ]
            };

            carShopData.push(shop);
          }
        }
      }
    } else {//当前购物车为空，直接插入

      var shop = {
        "companyId": vm.data.currentCompanyId,
        "companyName": vm.data.currentCompany,
        "shopList": [
          {
            "itemId": shopData[i1].itemSkuList[i2].itemSkuList[i3].id,
            "itemName": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemname,
            "propertiesid": shopData[i1].itemSkuList[i2].itemSkuList[i3].propertiesid,
            "itemspecifications": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemspecifications,
            "typeId": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemcategoryid1,
            "isMore": true,
            "itemnumber": shopData[i1].itemSkuList[i2].itemSkuList[i3].itemnumber,
            "keepStatus": shopData[i1].itemSkuList[i2].itemSkuList[i3].keepStatus,
            "qty": shopData[i1].itemSkuList[i2].itemSkuList[i3].number,
            "price": shopData[i1].itemSkuList[i2].itemSkuList[i3].price,
            "unit": shopData[i1].itemSkuList[i2].itemSkuList[i3].unit,
            "assistantunit": shopData[i1].itemSkuList[i2].itemSkuList[i3].assistantunit,
            "picthumburl": shopData[i1].itemSkuList[i2].itemSkuList[i3].picthumburl,
          }
        ]
      };

      carShopData.push(shop);
    }
    var total = 0;
    for (var i = 0; i < carShopData.length; i++) {//计算各个供应商的订单数
      carShopData[i].total = carShopData[i].shopList.length;
      total += carShopData[i].shopList.length;
    }
    vm.setTabBar(total);
    vm.setData({ footerData: { number: total, status: 1, zindex: 2, orderRedCount: vm.data.orderRedCount } });
    wx.getStorage({
      key: 'userShopCart',
      success: function (res) {
        var userShopCart = res.data;
        for (var j = 0; j < userShopCart.length; j++) {
          if (userShopCart[j].openId == vm.data.openId) {
            userShopCart[j].shopList = carShopData;
            break;
          }
        }
        wx.setStorage({
          key: 'userShopCart',
          data: userShopCart,
        })
      },
    })
    //this.setUserShopCart();
  },

  setUserShopCart: function (carShopData) {
    var vm = this;
    wx.getStorage({
      key: 'userShopCart',
      success: function (res) {
        var userShopCart = res.data;
        for (var j = 0; j < userShopCart.length; j++) {
          if (userShopCart[j].openId == vm.data.openId) {
            userShopCart[j].shopList = carShopData;
            break;
          }
        }
        wx.setStorage({
          key: 'userShopCart',
          data: userShopCart,
        })
      },
    })
  },

  getUserShopCart: function () {
    var vm = this;
    wx.getStorage({
      key: 'userShopCart',
      success: function (res) {
        var userShopCart = res.data;
        var myCart;
        for (var i = 0; i < userShopCart.length; i++) {
          if (userShopCart[i].openId == vm.data.openId) {
            var total = 0;
            for (var j = 0; j < userShopCart[i].shopList.length; j++) {
              total += userShopCart[i].shopList[j].shopList.length
            }
            vm.setTabBar(total);
            vm.setData({ carShopData: userShopCart[i].shopList, footerData: { number: total, status: 1, zindex: vm.data.companyShowFlag ? 0 : 2, orderRedCount: vm.data.orderRedCount } });
            console.log(vm.data.carShopData);
            vm.bindCarShopData2shopData();
            break;
          } else {
            if (i == userShopCart.length - 1) {
              myCart = { "openId": vm.data.openId, shopList: [] };
            }
          }
        }
        if (myCart != undefined) {
          userShopCart.push(myCart);
          wx.setStorage({
            key: 'userShopCart',
            data: userShopCart,
          })
        }
        wx.hideLoading();
      },
      fail: function (res) {
        var userShopCart = [];
        var carShopData = { "openId": vm.data.openId, "shopList": [] };
        userShopCart.push(carShopData);
        wx.setStorage({
          key: 'userShopCart',
          data: userShopCart,
        });
        wx.hideLoading();
      }
    })
  },

  bindCarShopData2shopData: function () {
    var vm = this;
    var shopData = this.data.shopData;
    var carShopData = vm.data.carShopData;
    var currentCompanyTypeCartShopData = [];
    for (var i in shopData) {
      for (var j in shopData[i].itemSkuList) {
        shopData[i].itemSkuList[j].number = 0;
      }
    }
    for (var i = 0; i < carShopData.length; i++) {//找到当前公司的购物车
      if (vm.data.currentCompanyId == carShopData[i].companyId) {
        currentCompanyTypeCartShopData = carShopData[i].shopList;
        break;
      }
    }
    if (currentCompanyTypeCartShopData.length != 0) {
      for (var i = 0; i < currentCompanyTypeCartShopData.length; i++) {
        if (currentCompanyTypeCartShopData[i].typeId == vm.data.currentShopType) {
          var tempId = currentCompanyTypeCartShopData[i].itemId;
          var num = currentCompanyTypeCartShopData[i].qty;
          if (currentCompanyTypeCartShopData[i].isMore) {
            for (var j = 0; j < shopData.length; j++) {
              var isBreak1 = false;
              for (var k = 0; k < shopData[j].itemSkuList.length; k++) {
                var isBreak2 = false;
                if (shopData[j].itemSkuList[k].itemSkuList != undefined && shopData[j].itemSkuList[k].itemSkuList.length != 0) {
                  for (var t = 0; t < shopData[j].itemSkuList[k].itemSkuList.length; t++) {
                    if (shopData[j].itemSkuList[k].itemSkuList[t].id == tempId) {
                      shopData[j].itemSkuList[k].itemSkuList[t].number = num;
                      shopData = vm.getTheTotalNumForCart(j, k, t, shopData);
                      isBreak1 = true;
                      isBreak2 = true;
                      break;
                    }
                  }
                }
                if (isBreak2) break;
              }
              if (isBreak1) break;
            }
          } else {
            for (var j = 0; j < shopData.length; j++) {
              var isBreak = false;
              for (var k = 0; k < shopData[j].itemSkuList.length; k++) {
                if (shopData[j].itemSkuList[k].id == tempId) {
                  shopData[j].itemSkuList[k].number = num;
                  isBreak = true;
                  break;
                }
              }
              if (isBreak)
                break;
            }
          }
        } else if (vm.data.currentShopType == 'favorite') {//收藏列表
          var tempId = currentCompanyTypeCartShopData[i].itemId;
          var num = currentCompanyTypeCartShopData[i].qty;
          for (var j = 0; j < shopData.length; j++) {
            for (var k = 0; k < shopData[j].itemSkuList.length; k++) {
              if (shopData[j].itemSkuList[k].id == tempId) {
                shopData[j].itemSkuList[k].number = num;
                break;
              }
            }
          }
        }
      }
    }
    vm.setData({ shopData: shopData })
  },

  getTheTotalNumForCart: function (index1, index2, index3, shopDataList) {//统计多规格商品的下单总数
    //var shopDataList = this.data.shopData;
    var totalNum = 0;
    var mixNum = 0;//是否混合数据
    var singleIndex = 0;//单一数据的下标
    for (var i = 0; i < shopDataList[index1].itemSkuList[index2].itemSkuList.length; i++) {
      if (shopDataList[index1].itemSkuList[index2].itemSkuList[i].number > 0) {
        mixNum++;
        singleIndex = i;
      }
      if (shopDataList[index1].itemSkuList[index2].itemSkuList[i].number)
        totalNum += parseFloat(shopDataList[index1].itemSkuList[index2].itemSkuList[i].number);
    }
    if (mixNum == 1) {
      shopDataList[index1].itemSkuList[index2].mixNum = false;
    } else {
      shopDataList[index1].itemSkuList[index2].mixNum = true;
    }
    if (mixNum == 1) {
      shopDataList[index1].itemSkuList[index2].singleIndex = singleIndex;
    }
    shopDataList[index1].itemSkuList[index2].number = totalNum;
    // this.setData({
    //   shopData: shopDataList
    // });
    return shopDataList;
  },

  changeZindex: function () {
    var footerData = this.data.footerData;
    var companyShowFlag = this.data.companyShowFlag;
    var specialShowFlag = this.data.specialShowFlag;
    var collectShowFlag = this.data.collectShowFlag;
    var is2 = companyShowFlag || specialShowFlag || collectShowFlag ? 0 : 2;
    footerData.zindex = is2;
    this.setData({ footerData: footerData });
  },

  showTips: function (msg) {
    var vm = this;
    if (vm.data.timeObj) {
      clearTimeout(vm.data.timeObj);
    }
    vm.setData({
      tipFalg: true,
      tipText: msg
    })
    vm.data.timeObj = setTimeout(function () {
      vm.setData({
        tipFalg: false,
        tipText: ''
      })
    }, 1500);
  },

  setTabBar: function (total) {
    if (total > 0) {
      wx.setTabBarBadge({
        index: 1,
        text: total.toString(),
        success: function (res) {
          console.log("setTabBarBadge--success");
        },
        fail: function (res) {
          console.log("setTabBarBadge--fail");
        }
      })
    } else {
      wx.removeTabBarBadge({
        index: 1,
        success: function (res) {
          console.log("removeTabBarBadge--success");
        },
        fail: function (res) {
          console.log("removeTabBarBadge--fail");
        }
      })
    }
  }
})
