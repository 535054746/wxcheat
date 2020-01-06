// pages/mine/companyDetail/companyDetail.js
//index.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    companyName:'',
    mobile:'',
    contact:'',
    address: '',

    isSupMana: false,

    tipFalg: false,
    tipText: '',
    timeOutObj: null,
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
    wx.showLoading({
      title: '数据加载中',
    })
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        console.log(res.data);
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.getCompanyDetail(res.data.openId, res.data.eid);
        wx.getStorage({
          key: 'userInfo',
          success: function (res) {
            console.log(res.data);
            vm.getUserPermissions(res.data.roles);
          },
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  this.getCompanyDetail(this.data.openId,this.data.eId);
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

  getUserPermissions: function (roles) {
    var isSupMana = false;
    for (var i = 0; i < roles.length; i++) {
      if (roles[i].roleCode == '001')
        isSupMana = true;
    }
    this.setData({ isSupMana: isSupMana });
  },

  getCompanyDetail:function(openId,eid){
    console.log(openId);
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'customer/getCompanyInfo', //仅为示例，并非真实的接口地址
      data: {
        openId: openId
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        "eid":eid
      },
      method: 'get',
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        vm.setData({ 
          companyName: res.data.data.companyName,
          mobile: res.data.data.mobile,
          contact: res.data.data.contactsName,
          address: res.data.data.address,
        });
        
      },
      error: function (res) {
        wx.hideLoading();
        console.log(res);
      }
    })  
  },
  jumpLink:function(event){
    if (this.data.isSupMana) {
      var targetUrl = event.currentTarget.dataset.url;
      wx.navigateTo({
        url: targetUrl + '?companyName=' + this.data.companyName + '&address=' + this.data.address,
      })
    }else{
      this.showTips('暂无权限修改此信息');
    }
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
  }
})