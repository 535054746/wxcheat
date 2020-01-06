
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: "",
    eId: '',
    orgno: '',
  userName:'',
  loginOutShowFlag:false,

  isSupMana:false,
  unReadCount: 0,
  
  orderRedCount:0,
    footerData: {
    number: 0,
    orderRedCount:0,
    status: 4
  }
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
        //console.log(res.data);
        wx.showLoading({
          title: '加载中',
        });
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.setData({ userName: res.data.name })
        wx.getStorage({
          key: 'userInfo',
          success: function (res) {
            wx.hideLoading();
            console.log(res.data);
            vm.data.orgno = res.data.user.orgno;
            vm.getUserPermissions(res.data.roles);
            app.getRedCount(vm.data.eId, vm.data.orgno, vm.data.openId, null, function (count) {
              console.log("Callback:cound=" + count);
              if (count == undefined)
                count = 0;
              vm.setData({ unReadCount: count });
            });
          },
          fail: function (res) {
            wx.hideLoading();
            console.log(res);
          }
        })
      }
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

  getUserPermissions:function(roles){
    var isSupMana =false;
    for(var i = 0;i<roles.length;i++){
      if(roles[i].roleCode=='001')
        isSupMana=true;
    }
    this.setData({ isSupMana: isSupMana});
  },

  getCartNum: function () {
    var vm = this;
    wx.getStorage({
      key: 'userShopCart',
      success: function (res) {
        var userShopCart = res.data;
        for (var i = 0; i < userShopCart.length; i++) {
          if (userShopCart[i].openId == vm.data.openId) {
            var total = 0;
            for (var j = 0; j < userShopCart[i].shopList.length; j++) {
              total += userShopCart[i].shopList[j].shopList.length;
            }
            vm.setData({ footerData: { number: total, status: 4, orderRedCount: vm.data.orderRedCount } });
            break;
          }
        }
      },
    })
  },

  jumpLink: function (event) {
    var targetUrl = event.currentTarget.dataset.url;
    wx.redirectTo({
      url: targetUrl,
    })
  },

  jumpLink2: function (event) {
    var targetUrl = event.currentTarget.dataset.url;
    wx.navigateTo({
      url: targetUrl,
    })
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
    wx.getStorage({
      key: 'userId',
      success: function (res) {
        console.log(res);
        wx.setStorage({
          key: "userId",
          data: {
            userName: res.data.userName,
            passWord: ''
          }
        })
      }
    })
    wx.reLaunch({
      url: '../../login/login?billtype=1'
    })
  },
})