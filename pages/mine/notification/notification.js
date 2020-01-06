//index.js
//获取应用实例
const app = getApp()
import common from "../../common/js/common.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId:'',
    eid:'',
    notifiList:[]
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
        vm.setData({ eid: res.data.eid, openId: res.data.openId });
        vm.getNotifiList();
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

  getNotifiList:function(){
    wx.showLoading({
      title: '加载中',
    });
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getMessage',
      method: 'get',
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eid: vm.data.eid,
      },
      data:{
        openId:vm.data.openId,
        customerId: '',
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res.data);
        if (res.data.code == '1') {
          vm.setData({ notifiList: vm.formatData(res.data.data)})
        } else {
          console.log(res.data.message);
        }
      },
      error: function (res) {
        console.log(res.data);
        wx.hideLoading();
      },
    })
  },

  jumpLink:function(e){
    var customerId = e.currentTarget.dataset.customerid;
    var pricePlanId = e.currentTarget.dataset.priceplanid;
    var id = e.currentTarget.dataset.id;
    this.updateNotifiStatus(id);
    wx.navigateTo({
      url: './../../supplier/quotationDetails/quotationDetails' + '?customerId=' + customerId + '&pricePlanId=' + pricePlanId,
    })
  },

  updateNotifiStatus: function (id) {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url +'base/editMessageStatus',
      method: 'post',
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eid: vm.data.eid,
      },
      data: {
        openId: vm.data.openId,
        selectType: 0,
        msgIds:[id]
      },
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      }
    })
  },

  formatData:function(notiList){
    for (var i = 0; i < notiList.length; i++) {
      notiList[i].lastUpdateTime = this.format(new Date(notiList[i].lastUpdateTime));
      notiList[i].createTime = this.format(new Date(notiList[i].createTime));
    }
    return notiList;
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
})