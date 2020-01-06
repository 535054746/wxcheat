//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({ 
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });
    wx.removeStorage({
      key: 'shopPage',
      success: function(res) {
        console.log('clear shopPage');
      },
    })
    wx.getStorage({
      key: 'userId',
      success: function (res) {
        if(res.data.userName && res.data.passWord){
          console.log('1')
          wx.navigateTo({
            url: "/pages/supplier/index/index",
          })
        } else {
          console.log('2')
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }
      },
    })
  },

  getRedCount: function (eId, orgno, openId, callback, callback2) {
    var vm = this;
    var url = vm.globalData.url;
    wx.request({
      url: url + 'permission/getUserPermission',
      data: {
        openId: openId,
        type: 2,
        businessType: 1
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: eId,
        orgno: orgno
      },
      method: 'get',
      success: function (res) {
        if (res.data.code == '1') {
          for (var i of res.data.data) {
            if (i.name == '采购管理') {
              for (var j of i.childerList) {
                if (j.url == 'SKX_MODULE_00001') {
                  var redCount = j.totalNumMap["3"];
                  if (redCount > 0) {
                    wx.setTabBarBadge({
                      index: 2,
                      text: redCount.toString(),
                      success: function (res) {
                        console.log("tab2 setTabBarBadge--success");
                      },
                      fail: function (res) {
                        console.log("tab2 setTabBarBadge--fail");
                      }
                    })
                  } else {
                    wx.removeTabBarBadge({
                      index: 2,
                      success: function (res) {
                        console.log("tab2 removeTabBarBadge--success");
                      },
                      fail: function (res) {
                        console.log("tab2 removeTabBarBadge--fail");
                      }
                    })
                  }
                  typeof callback == 'function' && callback(redCount);
                }
              }
            }
          }
        }
      },
      fail: function (res) {
        console.log(res);
      }
    });
    wx.request({
      url: url + 'base/getMessage',
      data: {
        openId: openId,
        customerId: '',
        status: '0'
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: eId,
        orgno: orgno
      },
      method: 'get',
      success: function (res) {
        var redCount = res.data.data.length;
        if (redCount > 0) {
          wx.setTabBarBadge({
            index: 3,
            text: redCount.toString(),
            success: function (res) {
              console.log("tab3 setTabBarBadge--success");
            },
            fail: function (res) {
              console.log("tab3 setTabBarBadge--fail");
            }
          })
        } else {
          wx.removeTabBarBadge({
            index: 3,
            success: function (res) {
              console.log("tab3 removeTabBarBadge--success");
            },
            fail: function (res) {
              console.log("tab3 removeTabBarBadge--fail");
            }
          })
        }
        typeof callback2 == 'function' && callback2(redCount);
      },
      fail: function (res) {
        console.log(res);
      }
    })
  },

  globalData: {
    userInfo: null,
    url: 'https://merchant.zgsuanzi.com/sz-api/',//新正式环境域名
    // url: 'http://192.168.1.245/sz-api/',
    // url: 'http://192.168.1.109:6081/sz-api/',
    supplierInfo: null,//供应商信息
    orgno:null,
    jumpCompany:''
  },

  checkPhone: function (str){
    var pattern = /0?(13|14|15|16|17|18)[0-9]{9}/;
    console.log(pattern.test(str));
    return pattern.test(str);
  },
  checkCompanyName:function(str){
    var pattern = /(\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f])|(\ud83d[\ude80-\udeff])/;
    console.log(pattern.test(str));
    return pattern.test(str);
  },
})