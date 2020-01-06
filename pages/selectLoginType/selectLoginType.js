//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    username:'',
    password:'',
    businessType:'',

    shareType: undefined,
    customerName: null,
    customerCode: null,
    contactsName: null,
    mobile: null,
    shareFlag: false,

  },
  onLoad: function (options){
    this.setData({
      shareType: options.shareType,
      customerName: options.customerName,
      customerCode: options.customerCode,
      contactsName: options.contactsName,
      mobile: options.mobile,
      shareFlag: options.shareType==undefined?false:true,
    })
  },
  onShow: function () {
  },
  onReady: function () {
    var vm = this;
    if (vm.data.shareType == undefined) {
      wx.getStorage({
        key: 'userId',
        success: function (res) {
          console.log(res);
          vm.setData({
            username: res.data.userName,
            password: res.data.passWord,
            businessType: res.data.businessType,
            status: res.data.status
          });
          setTimeout(function () { vm.selectLoginType();},500);

        }, fail: function (res) {
          setTimeout(function () {
            wx.redirectTo({
              url: '../login/login?billtype=' + 1
            })
          }, 500);
        }
      })
    }else{

    }
  },
  selectLoginType:function(event){
    var vm = this;
    var billtype = vm.data.businessType == undefined ? 1 : vm.data.businessType;
    if (vm.data.username != '' && vm.data.password != ''){
      if (vm.data.status == 2 && vm.data.businessType == 1) {
        wx.redirectTo({
          url: '../application/application'
        })
      } else {
        if (billtype == vm.data.businessType){
          vm.loginCheck(billtype);
        } else {
          wx.redirectTo({
            url: '../login/login?billtype=' + billtype
          })
        }
      }
    }else{
        wx.redirectTo({
          url: '../login/login?billtype=' + billtype
        })
    }
    
  },
  loginCheck: function (billtype) {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'member/login1', //仅为示例，并非真实的接口地址
      data: {
        userName: vm.data.username,
        passWord: vm.data.password,
        sourceType: 'Xcx',
        businessType: billtype
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json"
      },
      method: 'get',
      success: function (res) {
        console.log(res);
        if (res.data.code == '0000') {
          wx.setStorage({
            key: "userId",
            data: {
              userName: vm.data.username,
              passWord: vm.data.password,
              businessType: vm.data.businessType
            }
          })
          vm.getSupplierInfo(res.data.ticket, billtype);
        } else {
          wx.redirectTo({
            url: '../login/login?billtype=' + billtype
          })
          wx.hideLoading();
        }
      }, fail: function (res) {
        wx.hideLoading();
        console.log(res);
        wx.redirectTo({
          url: '../login/login?billtype=' + billtype
        })
      }
    })
  },
  getSupplierInfo: function (ticket, billtype) {
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
      method: 'get',
      success: function (res) {
        if (res.data.code == '0000') {
          wx.setStorage({
            key: "supplierInfo",
            data: res.data.data
          })
          vm.setData({
            status: res.data.data.status
          })
          vm.getUserInfo(res.data.data.openId, res.data.data.eid, billtype);
        } else {
          wx.redirectTo({
            url: '../login/login?billtype=' + billtype
          })
          wx.hideLoading();
        }

      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
        wx.redirectTo({
          url: '../login/login?billtype=' + billtype
        })
      }
    })
  },

  getUserInfo: function (openId, eid, billtype) {
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
        'eId': eid
      },
      method: 'get',
      success: function (res) {
        console.log(res.data.data);
        wx.hideLoading();
        if (res.data.code == '1') {
          wx.setStorage({
            key: "userInfo",
            data: res.data.data
          })
          if (vm.data.status == 2 && vm.data.businessType == 1) {
            wx.redirectTo({
              url: '../application/application'
            })
          } else {
            if (vm.data.businessType == 0) {
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
          wx.redirectTo({
            url: '../login/login?billtype=' + billtype
          })
        }

      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
        wx.redirectTo({
          url: '../login/login?billtype=' + billtype
        })
      }
    })
  },

  goLogin:function(){
    var vm = this;
    vm.setData({
      username: vm.data.mobile,
      password: '123456',
      businessType: vm.data.shareType,
      shareFlag: false,
    });
    vm.loginCheck(vm.data.shareType);
  },

  closeShare: function () {
    wx.redirectTo({
      url: '../login/login?billtype=' + 0
    })
  }
})
