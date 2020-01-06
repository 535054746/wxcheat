// pages/mine/addDept/addDept.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    verifyCode:'',
    verifyText:'获取验证码',
    currentTime:61,
    interval:'',
    disabled:false,

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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({ verifyCode:''})
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

  phoneInput: function (e) {
    this.setData({ phone: e.detail.value });
  },

  verifyInput: function (e) {
    this.setData({ verifyCode: e.detail.value });
  },

  checkInput: function () {
    var vm = this;
    var phone = this.data.phone;
    var verifyCode = this.data.verifyCode;
    if (phone == '') {
      vm.showTips('手机号码不能为空');
      return;
    } else if (phone.length != 11) {
      vm.showTips('手机号码格式不正确');
      return;
    }
    if (verifyCode == '') {
      vm.showTips('验证码不能为空');
      return;
    }
    if (verifyCode.length !=6) {
      vm.showTips('验证码不足6位数');
      return;
    }
    wx.showLoading({
      title: '加载中',
    })
    vm.sumbit();
  },

  getVerify:function(){
    var vm = this;
    if (!vm.data.disabled) {
      var url = app.globalData.url;
      var phone = vm.data.phone;
      if (phone == '') {
        vm.showTips('手机号码不能为空');
        return;
      } else {
        if (phone.length == 11) {
          vm.setData({disabled:true});
          wx.showLoading({
            title: '发送中',
          });
          wx.request({
            url: url + 'member/getVerifyCode',
            method: 'post',
            dataType: 'json',
            data: {
              phone: phone
            },
            header: {
              "Content-Type": "application/json",
            },
            success: function (res) {
              wx.hideLoading();
              if (res.data.code == '1') {
                wx.showToast({
                  title: '发送成功',
                });
                vm.wait60s();
              } else {
                vm.showTips(res.data.message);
              }
            },
            error: function (res) {
              wx.hideLoading();
              console.log(res.data)
            },
          })
        } else {
          vm.showTips('手机号码格式不正确');
          return;
        }
      }
    }
  },

  wait60s:function(){
    var vm = this;
    var currentTime = vm.data.currentTime;
    var interval = setInterval(function () {
      currentTime--;
      vm.setData({
        verifyText: currentTime + '秒',
          disabled: true
      })
      if (currentTime <= 0) {
        clearInterval(vm.data.interval)
        vm.setData({
          verifyText: '重新发送',
          currentTime: 61,
          disabled: false
        })
      }
    }, 1000) ;
    vm.setData({ interval: interval})
  },

  setWaitTime:function(time){
    this.setData({
      verifyText:time
    });
  },

  sumbit: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'member/checkCode',
      method: 'post',
      dataType: 'json',
      data: {
        userName:vm.data.phone,
        verifyCode: vm.data.verifyCode
      },
      header: {
        "Content-Type": "application/json",
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res.data);
        if (res.data.code == '1') {
          wx.navigateTo({
            url: '../../pages/forgetPwd/resetPwd?phone='+vm.data.phone,
          })
        } else {
          vm.showTips(res.data.message);
          console.log(res.data.message);
        }
      },
      error: function (res) {
        console.log(res.data);
        wx.hideLoading();
      },
    });
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