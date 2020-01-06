// pages/supplier/ordertoDetails/ordertoDetails.js
const myUtil = require('../../../utils/util.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isFlag: false,
    id: '',
    xia: '../../common/images/xia.png',
    shang: '../../common/images/shang.png',
    openId: '',
    eId: '',
    detail: '',
    cur: '',
  },

  orderType(e) {
    var than = this
    //下标
    const index = e.currentTarget.dataset.item;
    var detail = this.data.detail;
    detail.groupingDetail[index].isSelect = !detail.groupingDetail[index].isSelect;
    than.setData({
      detail: detail,
      isFlag:(!than.data.isFlag)
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var openId = wx.getStorageSync('supplierInfo').openId
    var eid = wx.getStorageSync('eid')
    this.setData({
      id : options.id,
      openId: openId,
      eId: eid
    })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var than = this
    wx.request({
      url: app.globalData.url + 'supplyOrders/findStoreOrdersGroupingDetail',
      method: 'POST',
      header: {
        "Content-Type": "application/json",
        'eId': than.data.eId,
        'openId': than.data.openId
      },
      data: {
        'id' : than.data.id
      },
      success(res) {
        if(res.data.code == 1) {
          res.data.data.orderTime = myUtil.formatTime(new Date(res.data.data.orderTime))
          res.data.data.deliveryTime = myUtil.formatTimeDate(new Date(res.data.data.deliveryTime))
          if (res.data.data.orderUserName == null) {
            res.data.data.orderUserName = ''
          }
          res.data.data.groupingDetail.forEach(item => {
            item.isSelect = false
          }) 
          than.setData({
            detail: res.data.data
          })
        } else {
          wx.showToast({
            title: res.data.messgae,
            icon:'none'
          })
        }
      }

    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
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

  }
})