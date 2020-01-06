const app = getApp()

Page({
  data: {
    openId: "",
    eId: '',
    businessType:'',
    menuData: [],
    isShowFlag:false,

    downloadFlag:false,
    certificationFlag:false,
    certificationText:'',
    picUrl:'http://member.gdskx.com:90/sso-server/images/zsewm.png'
  },
  onShow: function () {
    this.errorTips = this.selectComponent('#errorTips');
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        wx.showLoading({
          title: '加载中',
        });
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.businessType = res.data.businessType;
        vm.getMenu();
        //vm.getBaseData();
        wx.getStorage({
          key: 'supplierInfo',
          success: function (res) {
            vm.setData({ certificationStatus: res.data.status });
          },
        });
      }
    })
  },
  onReady: function () {

  },
  getMenu:function(){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'permission/getUserPermission', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        businessType: vm.data.businessType,
        type: 2
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'get',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == "1") {
          vm.setData({
            menuData: res.data.data
          })
          console.log(res.data);
          if (res.data.data.length == 0) {
            vm.setData({
              isShowFlag: true
            })
          }
        } else {
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
        console.log(res);
        wx.hideLoading();
      }
    })
  },

  checkPermession:function(e){
    var menu = e.currentTarget.dataset.url;
    if (this.data.certificationStatus == '2') {
      if (menu =='SKX_MODULE_00001'){
        wx.navigateTo({
          url: 'merchant/concentratePurchase/concentratePurchase',
        })
      } else if (menu == 'SKX_MODULE_00003') {
        wx.navigateTo({
          url: 'merchant/selfPurchase/selfPurchase',
        })
      } else if (menu == 'SKX_MODULE_00004') {
        wx.navigateTo({
          url: 'merchant/approval/approval',
        })
      } else if (menu == 'SKX_MODULE_00020') {
        wx.navigateTo({
          url: 'merchant/transfers/transfers',
        })
      } else {
        this.setData({ downloadFlag: true })
      }
    }else{
      this.setData({ certificationFlag: true, certificationText: this.data.certificationStatus==3?'认证中，请耐心等待，谢谢！':'认证成为商家或供应商才能获得更多权限~'})
    }
  },

  showCertification:function(){
    this.setData({ certificationFlag:true})
  },

  hideCertification: function () {
    this.setData({certificationFlag:false,downloadFlag:false});
  },

  openPic: function (e) {
    var vm = this;
    wx.previewImage({
      urls: [vm.data.picUrl]
    }) 
  },

  savePic: function () {
    var vm = this;
    wx.downloadFile({
      url: vm.data.picUrl,
      success:function(res){
        let path = res.tempFilePath;
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success:function(res){
            console.log(res)
          },
          fail: function (res) {
            console.log(res)
          }
        })
      },
      fail:function(res){
        console.log(res)
      }
    })
  },
  
  onShareAppMessage:function(){
    return{
      title:'食食通 事事通 时时通',
      imageUrl:'../common/images/logo.png',
      path:'pages/application/shareApp',
      success:function(res){
        console.log('success-->' + res.target)
      },
      fail: function (res) {
        // 转发失败
        console.log('fail-->' + res.target)
      }
    }
  },

  linkJump: function (event){
    var vm = this;
    var url = event.currentTarget.dataset.url;
    console.log(event);
    if (url == "SKX_MODULE_00009" || url == "SKX_MODULE_00011" || url == "SKX_MODULE_00010") {
      wx.navigateTo({ url: '/pages/webview/webview?url=' + url });
    } else if (url == "SKX_MODULE_00012") {
      wx.navigateTo({ url: '/pages/index/index' });
    } else if (url == "SKX_MODULE_00013") {
      wx.navigateTo({ url: '/pages/statement/statement' });
    } else {
      //this.showTips('您还没有权限使用其他功能');
    }
    wx.navigateTo({
      url: '/pages/application/certification',
    })
  },

  showTips: function (msg) {
    this.errorTips.showTips(msg);
  },

  loginOutShow: function (event) {
    var vm = this;
    vm.setData({
      loginOutIconFlag: true
    })
    setTimeout(function () {
      vm.setData({
        loginOutShowFlag: true,
        loginOutIconFlag: false
      })
    }, 200);
  },
  loginOutCancel: function (event) {
    this.setData({
      loginOutShowFlag: false
    })
  },
  loginOutComfire: function (event) {
    this.setData({
      loginOutShowFlag: false
    })
    wx.setStorage({
      key: "userId",
      data: {
        userName: '',
        passWord: ''
      }
    })
    wx.redirectTo({
      url: '../login/login'
    })
  },
  getBaseData: function (event) {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getBaseData', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        businessType: vm.data.businessType,
        data: [{
          "type": "7",
          "version": 1
        }]
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        if (res.data.code == '1') {
          wx.setStorage({
            key: "organizationList",
            data: {
              organizationList: res.data.data.organizationList
            }
          })
        } else {
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
        console.log(res);
      }
    })
  }
})