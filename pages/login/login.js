//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    username:'',
    password:'',
    showClear:false,
    showPasswordClear:false,
    tipFalg:false,
    tipText:'',
    timeOutObj:null,
    billtype:0,
    status:'',

  },
  onLoad: function (option) {
  },
  onReady: function () {
  },
  onShow: function () {
    wx.hideHomeButton()

    var than = this
    wx.getStorage({
      key: 'userId',
      success: function (res) {
        console.log(res)
        var userName = res.data.userName
        var passWord = res.data.passWord
        than.setData({
          username: userName,
          password: passWord
        })
        // if(userName&&passWord) {
        //   console.log('1')
        //   setTimeout(()=>{
        //     than.loginCheck()
        //   },200)
        // }
      },
    })
  },
  onFocusClearShow: function(e){
    this.clearShowOrHide();
  },
  bindKeyInput: function (e) {
    this.setData({
      username: e.detail.value
    })
    this.clearShowOrHide();
  },
  bindKeyPassword: function (e) {
    this.setData({
      password: e.detail.value
    })
    this.clearShowOrHide();
  },
  bindUsernameBlur: function(e){
    this.setData({
      showClear: false
    })
  },


  clearUsername: function(e){
    this.setData({
      username: '',
      password: ''
    })
    this.clearShowOrHide();
  },
  clearPassword: function (e) {
    this.setData({
      password: ''
    })
    this.clearShowOrHide();
  },



  clearShowOrHide: function(){
    if (this.data.username.length == 0) {
      this.setData({
        showClear: false
      })
    } else {
      this.setData({
        showClear: true
      })
    }
    if (this.data.password.length == 0) {
      this.setData({
        showPasswordClear: false
      })
    } else {
      this.setData({
        showPasswordClear: true
      })
    }
  },
  showTips: function(msg){
    var vm=this;
    if (vm.data.timeObj) {
      clearTimeout(vm.data.timeObj);
    }
    vm.setData({
      tipFalg: true,
      tipText: msg
    })
    vm.data.timeObj=setTimeout(function(){
      vm.setData({
        tipFalg: false,
        tipText: ''
      })
    },1500);
  },
  loginCheck: function(e){
    var vm = this;
    var url = app.globalData.url;
    if (vm.data.username.length == 0) {
      vm.showTips("手机号码不能为空");
      return;
    }
    if (!(/^1[34578]\d{9}$/.test(vm.data.username))){
      //vm.showTips("手机号码格式不对");
      //return;
    }
    if (vm.data.password.length==0){
      vm.showTips("密码不能为空");
      return;
    }
    wx.showLoading({
      title: '正在登录...',
      mask: true
    })
    wx.request({
      url: url +'member/login', //仅为示例，并非真实的接口地址
      data: {
        userName: vm.data.username,
        passWord: vm.data.password,
        sourceType: 'Xcx',
        businessType: vm.data.billtype
      },
      dataType:'json',
      header: {
        "Content-Type": "application/json"
      },
      method:'POST',
      success: function (res) {
        console.log(res);
        if (res.data.code=='0000'){
            wx.setStorage({
              key: "userIdTwo",
              data: {
                userName: vm.data.username
              }
            })
          // }
          vm.getSupplierInfo(res.data.ticket);
        }else{
          if (res.data.code == '104'){
            vm.setData({ billtype:1})
          }
          if (res.data.code == '105') {
            vm.setData({ billtype: 0 })
          }
          wx.hideLoading();
          vm.showTips(res.data.message);
        }
      },fail: function(res){
        wx.hideLoading();
        console.log(res);
      }
    })
  },
  getSupplierInfo: function (ticket){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'member/ticket', //仅为示例，并非真实的接口地址
      data: {
        ticket: ticket
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json"
      },
      method: 'POST',
      success: function (res) {
        if (res.data.code == '0000') {
          wx.setStorage({
            key: "supplierInfo",
            data: res.data.data
          })
          vm.setData({
            status: res.data.data.status
          })
          // wx.setStorage({
          //   key: 'eid',
          //   data: res.data.data.eid,
          // })
          wx.setStorageSync('eid', res.data.data.eid)
          vm.getUserInfo(res.data.data.openId, res.data.data.eid);
        } else {
          wx.hideLoading();
          vm.showTips(res.data.message);
        }
        
      }, 
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
      }
    })
  },

  getUserInfo: function (openId,eid) {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getUserInfo', //仅为示例，并非真实的接口地址
      data: {
        openId: openId
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        'eId': eid,
        'openId': openId
      },
      method: 'POST',
      success: function (res) {
        console.log(res.data.data);
        wx.hideLoading();
        if (res.data.code == '1') {
          wx.setStorage({
            key: "userInfo",
            data: res.data.data
          })
          wx.setStorage({
            key: "userId",
            data: {
              userName: vm.data.username,
              passWord: vm.data.password,
              businessType: vm.data.billtype,
              status: vm.data.status
            }
          })
          if (vm.data.status == 2 && vm.data.billtype == 1) {
            wx.redirectTo({
              url: '../application/application'
            })
          } else {
            if (vm.data.billtype == 0) {
              wx.redirectTo({
                url: '../supplier/index/index'
              })
            } else {
              wx.switchTab({
                url: '../business/commodity/commodity'
              })
            }
          }
        } else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
      }
    })
  },
  backUp:function(){
    if (this.data.billtype==0){
      this.setData({
        billtype:1,
        username: this.data.username2
      })
    }else{
      this.setData({
        billtype: 0,
        username: this.data.username1
      })
    }
  }
})
