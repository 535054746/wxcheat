// pages/application/merchant/approvalSelfList/approvalSelfList.js
const app = getApp()
var wechatUtil = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    eId: '',
    orgno: '',
    mList: [],

    firstIndex: '',
    secondIndex: '',
    approalType: '',
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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    this.errorTips = this.selectComponent('#myTips');
    this.editDialog = this.selectComponent('#editDialog');
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
            vm.getList();
          },
        })
      }
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
    var vm = this;
    setTimeout(function () {
      vm.getList();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getList: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'workflow/getPendingAudit',
      method: 'get',
      data: {
        openId: vm.data.openId,
        type: 2//0 未审核 1已审核 2 我发起的
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      success: function (res) {
        wx.stopPullDownRefresh();
        if (res.data.code == '1') {
          vm.setData({ mList: vm.formatData(res.data.data) })
        } else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        wx.stopPullDownRefresh();
        console.log(res);
        vm.showTips('请求失败,请检查网络');
      }
    })
  },

  showTips: function (msg) {
    this.errorTips.showTips(msg);
  },

  formatData: function (list) {
    for (var i = 0; i < list.length; i++) {
      list[i].expand = true;
      for (var j = 0; j < list[i].list.length; j++) {
        list[i].list[j].createtime = wechatUtil.formatTime(new Date(list[i].list[j].createtime))
        if (!list[i].list[j].flagBillstatus) {
          list[i].list[j].flagBillstatus = this.getBillStatus(list[i].list[j].billStatus, list[i].list[j].type)
        }
      }
    }
    var mList = this.data.mList;
    if (mList.length != 0) {
      for (var i = 0; i < list.length; i++) {
        for (var j = 0; j < mList.length; j++) {
          if (list[i].billType == mList[j].billType) {
            list[i].expand = mList[j].expand;
            break;
          }
        }
      }
    }
    return list;
  },

  getBillStatus: function (status, billType) {
    if (billType == 'BU0002') {
      if (status == 0) {
        return '待审核';
      }
      if (status == 1) {
        return '已审核';
      }
      if (status == 2) {
        return '已下单';
      }
      if (status == 3) {
        return '待验收';
      }
      if (status == 4) {
        return '已验收';
      }
      if (status == 6) {
        return '已完成';
      }
      if (status == 11) {
        return '待提交';
      }
    } else {
      if (status == 1) {
        return '待审核';
      }
      if (status == 2) {
        return '已退回';
      }
      if (status == 3) {
        return '审核中';
      }
      if (status == 4) {
        return '已审核';
      }
      if (status == 5) {
        return '待验收';
      }
      if (status == 6) {
        return '已完成';
      }
    }
  },

  showSecondItem: function (e) {
    var index = e.currentTarget.dataset.index;
    var mList = this.data.mList;
    mList[index].expand = !mList[index].expand;
    this.setData({ mList: mList })
  },

  goDetail: function (e) {
    var orderType = e.currentTarget.dataset.type;
    var id = e.currentTarget.dataset.id;
    if (orderType == 'BU0001') {
      wx.navigateTo({
        url: '../selfPurchaseDetail/selfPurchaseDetail?id=' + id,
      })
    } else if (orderType == 'BU0002') {
      wx.navigateTo({
        url: '../concentratePurchaseDetail/concentratePurchaseDetail?id=' + id,
      })
    } else if (orderType == 'BU0003') {
      wx.navigateTo({
        url: '../transfersDetail/transfersDetail?id=' + id,
      })
    }
  }
})