// pages/application/merchant/repostReqPur/repostReqPur.js
const app = getApp();
var wechatUtil = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mTab: 0,
    allList: [],
    shopTab: 0,
    screenHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ id: options.id });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.errorTips = this.selectComponent('#errorTips');
    this.singlePicker = this.selectComponent('#singlePicker');
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        wx.getStorage({
          key: 'userInfo',
          success: function (res) {
            vm.data.orgno = res.data.user.orgno;
            vm.data.myDeptId = res.data.user.organizationid;
            vm.data.myStoreId = res.data.store.organizationtypeid;
            vm.data.deptId = res.data.user.organizationid;
            vm.data.storeId = res.data.store.organizationtypeid;
            vm.data.orgType = res.data.organization.orgType;
            vm.setData({ deptName: res.data.organization.organizationname, personName: res.data.user.name })
            if (vm.data.id) {
              vm.getPurchaseDetail();
              vm.getPurchaseList();
              vm.getOrderFlow();
            }
          },
        })
      },
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var vm = this;
    wx.getSystemInfo({
      success: function (res) {
        vm.setData({ screenHeight: res.windowHeight })
      },
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  showTips: function (msg) {
    this.errorTips.showTips(msg);
  },

  changeTab: function (e) {
    var tab = e.currentTarget.dataset.tab;
    this.setData({ mTab: tab })
  },

  expand: function () {
    this.setData({ expand: !this.data.expand })
  },

  getOrderFlow: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/purchasereq/getProcessAssistant',
      method: 'get',
      data: {
        reqId: vm.data.id,
        openId: vm.data.openId,
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        openId: vm.data.openId,
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      success: function (res) {
        if (res.data.code == '1') {
          vm.setData({ msgList: vm.formatData2(res.data.data) });
        } else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        vm.showTips('请求失败');
        console.log(res);
      }
    })
  },

  getPurchaseDetail: function () {
    wx.showLoading({
      title: '加载中',
      mask: true,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/ownPurReq/getOwnPurReqInfo',
      method: 'get',
      dataType: 'json',
      data: {
        openId: vm.data.openId,
        reqId: vm.data.id
      },
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno,
        openId: vm.data.openId,
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == '1') {
          vm.setData({ orderDetail: vm.formatData(res.data.data) })
        }
        else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        console.log(res);
        wx.hideLoading();
        vm.showTips('请求失败')
      }
    })
  },

  getPurchaseList: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/purchasereq/getPurchasereqDetails',
      method: 'get',
      dataType: 'json',
      data: {
        openId: vm.data.openId,
        reqId: vm.data.id
      },
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno,
        openId: vm.data.openId,
      },
      success: function (res) {
        if (res.data.code == '1') {
          vm.setData({ allList: res.data.data })
        }
        else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        console.log(res);
        vm.showTips('请求失败')
      }
    })
  },

  formatData: function (data) {
    data.billDate = wechatUtil.formatTime(new Date(data.billDate))
    return data;
  },

  formatData2: function (data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].createTime != undefined)
        data[i].createTime = wechatUtil.formatTime(new Date(data[i].createTime))
    }
    return data;
  },

  selectTab: function (e) {
    this.setData({ shopTab: e.detail });
    if (e.detail == 1) {
      this.setData({ typeList: this.allList2typeList() });
    }
  },

  allList2typeList: function () {
    var list = this.data.allList;
    var typeList = [];
    for (var i = 0; i < list.length; i++) {
      var exsit = false;//标识符
      for (var j = 0; j < typeList.length; j++) {
        if (list[i].itemcategorycode1 == typeList[j].itemcategorycode1) {
          typeList[j].itemList.push(list[i]);
          exsit = true;
          break;
        }
      }
      if (!exsit) {
        typeList.push(
          {
            itemcategorycode1: list[i].itemcategorycode1,
            itemcategoryname1: list[i].itemcategoryname1,
            itemList: [list[i]]
          }
        );
      }
    }

    for (var i = 0; i < typeList.length; i++) {
      var tempList = typeList[i].itemList;
      var itemcategorycode2List = []
      for (var j = 0; j < tempList.length; j++) {
        var exsit = false;//标识符
        for (var k = 0; k < itemcategorycode2List.length; k++) {
          if (tempList[j].itemcategorycode2 == itemcategorycode2List[k].itemcategorycode2) {
            itemcategorycode2List[k].itemList.push(tempList[j]);
            exsit = true;
            break;
          }
        }
        if (!exsit) {
          itemcategorycode2List.push(
            {
              itemcategorycode2: tempList[j].itemcategorycode2,
              itemcategoryname2: tempList[j].itemcategoryname2,
              itemList: [tempList[j]]
            }
          );
        }
      }
      typeList[i].itemList = itemcategorycode2List;
      typeList[i].count = tempList.length;
    }
    return typeList;
  },

  expandItem: function (e) {
    var index1 = e.currentTarget.dataset.firstindex;
    var index2 = e.currentTarget.dataset.secondindex;
    var expandType = e.currentTarget.dataset.expandtype;

    if (index2 == undefined) {
      if (expandType == 'type') {
        this.data.typeList[index1].expand = this.data.typeList[index1].expand ? false : true;
        this.setData({ typeList: this.data.typeList })
      }
    }
  },

  amountInput: function (e) {
    var index = e.currentTarget.dataset.index;

    this.data.allList[index].qty = e.detail;
  },

  amountInput2: function (e) {
    var item = e.currentTarget.dataset.item;
    var list = this.data.allList;
    for (var i = 0; i < list.length; i++) {
      if (list[i].itemid == item.itemid) {
        if (list[i].propertiesid == item.propertiesid) {
          list[i].qty = e.detail;
          break;
        }
        if (list[i].propertiesid == '' && item.propertiesid == undefined) {
          list[i].qty = e.detail;
          break;
        }
      }
    }
    this.setData({
      allList: list,
      typeList: this.allList2typeList(list),
      supplierList: this.allList2supplierList(list)
    })
  },

  deleteShop: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.allList;
    list.splice(index, 1);
    this.setData({ allList: list })
  },

  deleteShop2: function (e) {
    var item = e.currentTarget.dataset.item;
    var list = this.data.allList;
    for (var i = 0; i < list.length; i++) {
      if (list[i].itemid == item.itemid) {
        if (list[i].propertiesid == item.propertiesid) {
          list.splice(i, 1);
          break;
        }
        if (list[i].propertiesid == '' && item.propertiesid == undefined) {
          list.splice(i, 1);
          break;
        }
      }
    }
    this.setData({
      allList: list,
      typeList: this.allList2typeList(list),
      supplierList: this.allList2supplierList(list)
    })
  },

  clearShopList: function () {
    this.setData({ allList: [] })
  },

  goShopList: function () {
    wx.navigateTo({
      url: '../selectShopList/selectShopList?source=2',//0：集采 1：自采 2：要货
    })
  },

  bbMainTap: function () {
    var list = this.data.allList;
    var itemJson = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].qty == 0 || list[i].qty == '') {
        this.showTips('请输入‘' + list[i].itemname + '’数量')
        return;
      }
      var item = {};
      item.assistantunit = list[i].assistantunit ? list[i].assistantunit == '' ? list[i].unit : list[i].assistantunit : list[i].unit;
      item.itemId = list[i].itemid ? list[i].itemid : list[i].id;
      item.qty = list[i].qty;
      item.propertiesId = list[i].propertiesid != undefined ? list[i].propertiesid != '' ? list[i].propertiesid : undefined : undefined;
      itemJson.push(item);
    }
    if (itemJson.length == 0) {
      this.showTips('商品列表为空');
      return;
    }
    this.data.itemJson = itemJson;
    this.sumbitOrder();
  },

  sumbitOrder: function () {
    wx.showLoading({
      title: '提交中',
      mask: true,
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/purchasereq/savePurchasereq',
      data: {
        id: vm.data.id,
        openId: vm.data.openId,
        templateId: vm.data.templateId,
        itemJson: vm.data.itemJson,
        DeptId: vm.data.deptId,
        biztype: '3',
      },
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno,
        openId: vm.data.openId,
      },
      method: 'POST',
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 1) {
          setTimeout(function () {
            wx.navigateBack({
              delta: 1,
            })
          }, 500);
        } else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
        vm.showTips('请求失败')
      },
    })
  },
})