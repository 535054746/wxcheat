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
    supplierId: '',
    currentVal: '',
    picUrl: 'www.abs.com',
    defaultImg: '../../common/images/img_placeholder.png'
  },

  orderType(e) {
    var than = this
    const index = e.currentTarget.dataset.item
    var detail = this.data.detail;
    detail[index].isSelect = !detail[index].isSelect;
    than.setData({
      detail: detail,
      isFlag: (!than.data.isFlag)
    })
  },

  bindImgError(e) {
    console.log(e)
    var than = this
    var errorImgIndex = e.target.dataset.imgindex
    var detail = than.data.detail
    detail[errorImgIndex].picUrl = this.data.defaultImg
    console.log(detail[errorImgIndex].picUrl)
    than.setData({
      detail: detail
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let currentVal = JSON.parse(options.item)
    console.log(currentVal)
    var openId = wx.getStorageSync('supplierInfo').openId
    var userInfo = wx.getStorageSync('userInfo')
    let supplierId = userInfo.supplier.id 
    var eid = wx.getStorageSync('eid')
    currentVal.deliveryTime = myUtil.formatTimeDate(new Date(currentVal.deliveryTime))
    this.setData({
      openId: openId,
      eId: eid,
      supplierId: supplierId,
      currentVal: currentVal
    })

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
    var than = this
    wx.request({
      url: app.globalData.url + 'oms/goodsInspection/groupingItemGoodsDetailBystoreId',
      method: 'POST',
      header: {
        "Content-Type": "application/json",
        'eId': than.data.eId,
        'openId': than.data.openId
      },
      data: {
        'supplyId': than.data.supplierId,
        'acceptance': 1,
        'endTime': than.data.currentVal.deliveryTime,
        'startTime': than.data.currentVal.deliveryTime,
        'storeId': than.data.currentVal.storeId
      },
      success(res) {
        if (res.data.code == 1) {
          // console.log(res.data.data)
          res.data.data.forEach(item => item.isSelect = false)
          console.log(res.data.data)
          than.setData({
            detail: res.data.data
          })
        } else {
          wx.showToast({
            title: res.data.messgae,
            icon: 'none'
          })
        }
      }
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

  }
})