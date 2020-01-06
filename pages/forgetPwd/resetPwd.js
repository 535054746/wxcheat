// pages/mine/addDept/addDept.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    pwd:'',
    rePwd:'',

    tipFalg: false,
    tipText: '',
    timeOutObj: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({phone:options.phone});
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

  pwdInput: function (e) {
    this.setData({ pwd: e.detail.value });
  },

  reInput: function (e) {
    this.setData({ rePwd: e.detail.value });
  },

  checkInput:function(){
    var vm = this;
    if (vm.data.pwd == '') {
      vm.showTips('新密码不能为空');
      return
    }
    if (vm.data.pwd.length < 6) {
      vm.showTips('新密码不能少于6位数');
      return
    }
    if (vm.data.pwd != vm.data.rePwd) {
      vm.showTips('两次密码不一致');
      return
    }
    wx.showLoading({
      title: '修改中',
    })
    vm.sumbit();
  },

  sumbit:function(){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'framework/updatePwd',
      method: 'post',
      dataType: 'json',
      data: {
        phone: vm.data.phone,
        confirmPassword: vm.data.pwd
      },
      header: {
        "Content-Type": "application/json",
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == '1') {
          wx.showToast({
            title: '修改成功',
          });
          wx.navigateTo({
            url: '../../pages/login/login',
          })
        } else {
          vm.showTips(res.data.message);
        }
      },
      error: function (res) {
        wx.hideLoading();
        console.log(res.data)
      },
    })
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