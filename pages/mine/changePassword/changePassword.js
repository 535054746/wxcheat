// pages/mine/changePassword/changePassword.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    oldPwd:'',
    newPwd: '',
    checkPwd: '',

    isOldFocus: false,
    isNewFocus: false,
    isAgainFocus:false,

    userName:'',
    openId:'',
    eid:'',
    orgno:'',

    isLoad:false,
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
    wx.getStorage({
      key: 'supplierInfo',
      success: function(res) {
        console.log(res.data)
        vm.setData({
          openId: res.data.openId,
          eid: res.data.eid,
          orgno: res.data.orgno,
        })
      },
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
  
  },

  bindBlur: function (e) {
    var inputType = e.currentTarget.dataset.type;
    if (inputType == 'old') {
      this.setData({ isOldFocus: false })
    } else if (inputType == 'new') {
      this.setData({ isNewFocus: false })
    } else if (inputType == 'again') {
      this.setData({ isAgainFocus: false })
    }
  },

  bindFocus: function (e) {
    var inputType = e.currentTarget.dataset.type;
    if (inputType == 'old') {
      this.setData({ isOldFocus: true })
    } else if (inputType == 'new') {
      this.setData({ isNewFocus: true })
    } else if (inputType == 'again') {
      this.setData({ isAgainFocus: true })
    }
  },

  oldPwdInput: function (e) {
    this.setData({oldPwd:e.detail.value})
   },

  newPwdInput: function (e) {
    this.setData({ newPwd: e.detail.value })
   },

  checkPwdInput: function (e) {
    this.setData({ checkPwd: e.detail.value })
  },

  changePwd:function(){
    this.checkInput();
  },

  checkInput: function () {
    if (!this.data.isLoad) {
      this.data.isLoad = true;
      var vm = this;
      var oldPwd = this.data.oldPwd;
      var newPwd = this.data.newPwd;
      var checkPwd = this.data.checkPwd;
      if (oldPwd == '') {
        this.showTips('请输入原密码');
        this.data.isLoad = false;
        return;
      }
      if (oldPwd.length < 6) {
        this.showTips('原密码不能少于6位数');
        this.data.isLoad = false;
        return;
      }
      if (newPwd == '') {
        this.showTips('请输入新密码');
        this.data.isLoad = false;
        return;
      }
      if (newPwd.length < 6) {
        this.showTips('新密码不能少于6位数');
        this.data.isLoad = false;
        return;
      }
      if (newPwd.length==0) {
        vm.showTips('请再次输入新密码');
        vm.data.isLoad = false;
        return;
      }
      if (newPwd != checkPwd) {
        vm.showTips('两次新密码不一致');
        vm.data.isLoad = false;
        return;
      }
      wx.getStorage({
        key: 'userId',
        success: function (res) {
          console.log(res.data);
          vm.setData({
            userName: res.data.userName,
          });
          if (oldPwd == res.data.passWord) {
            if (oldPwd == newPwd) {
              vm.showTips('新密码不能与原密码相同');
              vm.data.isLoad = false;
              return;
            }
            wx.showLoading({
              title: '修改中',
            });
            vm.sumbit();
          }
          else {
            wx.hideLoading();
            vm.data.isLoad = false;
            vm.showTips('原密码不正确');
          }
        },
      })
    }
  },

  sumbit: function () {
    var vm = this;
    var url = app.globalData.url;
    console.log(vm.data.newPwd);
    wx.request({
      url: url +'framework/updatePwd',
      method:'post',
      dataType:'json',
      data:{
        phone: vm.data.userName,
        confirmPassword: vm.data.newPwd,
        openId:vm.data.openId
      },
      header: {
        "Content-Type": "application/json",
        eid:vm.data.eid,
        orgno:vm.data.orgno,
      },
      success:function(res){
        wx.hideLoading();
        console.log(res.data);
        if(res.data.code=='1'){
          wx.showToast({
            title: '修改成功',
          });
          wx.setStorage({
            key: "userId",
            data: {
              userName: '',
              passWord: ''
            }
          })
          wx.reLaunch({
            url: '../../selectLoginType/selectLoginType'
          })
        } else {
          vm.data.isLoad = false;
          vm.showTips(res.data.message);
        }
      },
      error: function (res) {
        vm.data.isLoad = false;
        console.log(res.data);
        wx.hideLoading();},
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
  },

  clearInput:function(e){
    var inputType = e.currentTarget.dataset.type;
    if(inputType=='old'){
      this.setData({oldPwd:''})
    } else if (inputType == 'new') {
      this.setData({ newPwd: '' })
    } else if (inputType == 'check') {
      this.setData({ checkPwd: '' })
    }
  },
})