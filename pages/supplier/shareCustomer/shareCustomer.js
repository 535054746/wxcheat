// pages/mine/companyDetail/companyDetail.js
//index.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    companyName: '',
    mobile: '',
    contact: '',
    address: '',
    companyCode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      companyName: options.customerName,
      mobile: options.mobile,
      contact: options.contactsName,
      address: options.address,
      companyCode: options.customerCode
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  }
})