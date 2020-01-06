// pages/application/merchant/selfPurchase/selfPurchase.js
const app = getApp();
var wechatUtil = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: '',
    mList: [],
    screenWidth: 0,
    screenHeight: 0,
    floatHeight: 0,


    openId: '',
    eId: '',
    orgno: '',
    organizationid: '',
    pageNo: 1,
    pageSize: 20,

    workFlowList: null,
    workFlowFlag: false,

    hasNextPage: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var vm = this;
    wx.getSystemInfo({
      success: function (res) {
        vm.setData({ screenHeight: res.windowHeight, screenWidth: res.windowWidth, floatHeight: res.windowHeight - 80 });
      },
    });
    this.errorTips = this.selectComponent('#errorTips');
    this.refreshBar = this.selectComponent('#refreshBar');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    this.errorTips = this.selectComponent('#errorTips');
    this.refreshBar = this.selectComponent('#refreshBar');
    var vm = this;
    wx.getSystemInfo({
      success: function (res) {
        vm.setData({ screenHeight: res.windowHeight, screenWidth: res.windowWidth, floatHeight: res.windowHeight - 80 });
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
            vm.data.organizationid = res.data.user.organizationid;
            vm.getOrderList(0);
            vm.getWorkFlow();
            wechatUtil.getRedCount(function (count) {
              for (var i of count) {
                if (i.name == '采购管理') {
                  for (var j of i.childerList) {
                    if (j.url == 'SKX_MODULE_00003') {
                      vm.setData({
                        count5: j.totalNumMap["5"] ? j.totalNumMap["5"] : 0
                      })
                      break;
                    }
                  }
                }
              }
            });
          },
        })
      },
    });
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('onReachBottom')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  selectTab: function (e) {
    var vm = this;
    var tab = e.currentTarget.dataset.tab;
    vm.setData({ currentTab: tab, pageNo: 1 });
    vm.getOrderList(0);
  },

  getOrderList: function (refreshType) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/selfReq/getList',
      method: 'get',
      dataType: 'json',
      data: {
        openId: vm.data.openId,
        billstatus: vm.data.currentTab,
        pageNo: vm.data.pageNo,
        pageSize: vm.data.pageSize,
        keyword: '',
      },
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      success: function (res) {
        wx.hideLoading();
        vm.hideAn();
        if (res.data.code == '1') {
          vm.setData({ mList: vm.formatData(res.data.data.list, refreshType), hasNextPage: res.data.data.hasNextPage });
        } else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        vm.hideAn();
        wx.hideLoading();
        console.log(res.data);
        vm.showTips('请求失败,请检查网络');
      }
    })
  },

  getWorkFlow: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'workflow/getTemplate',
      method: 'get',
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      data: {
        openId: vm.data.openId,
        businessType: 'BU0001'//自采 BU0001 集采 BU0002 要货 BU0003
      },
      success: function (res) {
        if (res.data.code == '1')
          vm.setData({ workFlowList: res.data.data });
        else
          vm.showTips(res.data.message);
      },
      fail: function (res) {
        console.log(res.data);
        vm.showTips('请求失败,请检查网络');
      }
    })
  },

  formatData: function (list, refreshType) {
    var mList = this.data.mList;
    for (var i = 0; i < list.length; i++) {
      list[i].billdate = wechatUtil.formatTime(new Date(list[i].billDate))
      if (refreshType == 1) {
        mList.push(list[i]);
      }
    }
    if (refreshType == 1) {
      return mList;
    } else {
      return list;
    }
  },

  showAn: function () {
    this.refreshBar.showAn();
  },

  hideAn: function () {
    this.refreshBar.hideAn();
  },

  showTips: function (msg) {
    this.errorTips.showTips(msg);
  },

  bindscrolltoupper: function () {
    var vm = this;
    vm.data.pageNo = 1;
    vm.showAn();
    setTimeout(function () {
      vm.getOrderList(0);
    }, 1500)
  },

  bindscrolltolower: function () {
    var vm = this;
    if (vm.data.hasNextPage) {
      vm.data.pageNo = vm.data.pageNo + 1;
      vm.getOrderList(1);
    }
  },

  goAddPur: function (e) {
    this.setData({ workFlowFlag: false, floatHeight: this.data.screenHeight - 80 });
    var flowId = e.currentTarget.dataset.flow;
    wx.navigateTo({
      url: '../addSelfPur/addSelfPur?templateId=' + flowId,
    })
  },

  addPurReq: function () {
    var vm = this;
    if (vm.data.workFlowList == null) {
      vm.showTips('正在获取工作流');
      vm.getWorkFlow();
    } else {
      if (vm.data.workFlowList.length == 0) {
        wx.navigateTo({
          url: '../addSelfPur/addSelfPur',
        })
      } else if (vm.data.workFlowList.length == 1) {
        wx.navigateTo({
          url: '../addSelfPur/addSelfPur?templateId=' + vm.data.workFlowList[0].templateId,
        })
      } else {
        if (!vm.data.workFlowFlag)
          vm.setData({ workFlowFlag: true, floatHeight: vm.data.screenHeight - (80 + vm.data.workFlowList.length * 50) });
      }
    }
  },

  closeMask: function () {
    this.setData({ workFlowFlag: false, floatHeight: this.data.screenHeight - 80 });
  },

  goDetail:function(e){
    var id = e.currentTarget.dataset.id;
    var billStatus = e.currentTarget.dataset.status;
    var url = '../selfPurchaseDetail/selfPurchaseDetail?id=';
    if (billStatus==2){
      url = '../addSelfPur/addSelfPur?id=';
    }
    wx.navigateTo({
      url: url+id,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
})