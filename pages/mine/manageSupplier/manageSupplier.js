// pages/mine/mainMine/mainMine.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    supplierList: [],

    openId:'',
    eid:'',
    orgno: '',
    customerId:'',

    isShowTips: false,
    tipsType: false,
    tipsText: '',

    currentShare: null,
    shareFlag: false,

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
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.setData({ openId: res.data.openId, eid: res.data.eid, orgno: res.data.orgno });
        vm.getSupplierList();
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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

  getSupplierList:function(){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url +'customer/getCustomerList',
      method: 'get',
      dataType: 'json',
      data: {
        openId: vm.data.openId,
        businessType: '1',
      },
      header: {
        eid: vm.data.eid,
        orgno: vm.data.orgno,
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.code == '1') {
          vm.setData({supplierList: res.data.data});
        } else {
          console.log(res.data.message);
        }
      },
      error: function (res) {
        wx.hideLoading();
        console.log(res);
      }
    })
  },

  deleteSupplier:function(e){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'customer/deleteCustomer',
      method: 'post',
      dataType: 'json',
      data: {
        openId: vm.data.openId,
        customerId: vm.data.customerId,
        businessType: '1',
      },
      header: {
        eid: vm.data.eid,
        orgno: vm.data.orgno,
        "Content-Type": "application/json",
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.code == '1') {
          wx.showToast({
            title: '删除成功',
          })
          vm.getSupplierList();
        } else {
          vm.showTips('error',res.data.message);
          console.log(res.data.message);
        }
      },
      error: function (res) {
        wx.hideLoading();
        console.log(res);
      }
    })
  },

  onShareAppMessage: function (res) {
    var index = res.target.dataset.index;
    var vm = this;
    console.log('pages/selectLoginType/selectLoginType?customerName=' + this.data.currentShare.companyName + '&customerCode=' + this.data.currentShare.blNum + '&contactsName=' + this.data.currentShare.contactsName + '&mobile=' + this.data.currentShare.mobile + '&address=' + this.data.currentShare.address + '&shareType=0');
    return {
      title: '供应商分享',
      imageUrl: '../../common/images/icons/xcxfxbg.png',
      path: 'pages/selectLoginType/selectLoginType?customerName=' + this.data.currentShare.companyName + '&customerCode=' + this.data.currentShare.blNum + '&contactsName=' + this.data.currentShare.contactsName + '&mobile=' + this.data.currentShare.mobile + '&address=' + this.data.currentShare.address +'&shareType=0',
      success: function (res) {
        // 转发成功
        vm.setData({ shareFlag: false, currentShare: null });
        console.log('succ-->' + res.target)
      },
      fail: function (res) {
        // 转发失败
        console.log('fail-->' + res.target)
      }
    }
  },

  callPhone:function(e){
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },

  showTips: function (e, msg) {
    try {
      var type = e.currentTarget.dataset.type;
      var customerId = e.currentTarget.dataset.customerid;
    }catch(ex)
    {
      console.log(ex);
    }
    var vm = this;
    vm.setData({ isShowTips: true, customerId: customerId });
    if (e == 'error') {
      vm.setData({
        tipsType: false,
        tipsText: msg
      });
    } else if (type == 'delete') {
      vm.setData({ tipsType: true});
    }
  },

  loginOutComfire:function(e){
    this.deleteSupplier();
    this.setData({
      isShowTips: false
    })
  },

  loginOutCancel: function (event) {
    this.setData({
      isShowTips: false
    })
  },

  jumpLink: function (event) {
    var targetUrl = event.currentTarget.dataset.url;
    wx.navigateTo({
      url: targetUrl,
    })
  },

  shareInfo: function (e) {
    this.setData({
      currentShare: e.currentTarget.dataset.index,
      shareFlag: true
    })
  },

  closeShare: function () {
    this.setData({
      currentShare: null,
      shareFlag: false
    })
  },
})