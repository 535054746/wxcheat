// pages/mine/changeAddress/changeAddress.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:'',
    changeAddress: '',

    tipFalg: false,
    tipText: '',
    timeOutObj: null,

    isFocus:false,

    openId: '',
    eid: '',
    orgno: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ address: options.address, changeAddress: options.address });
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

  addressInput:function(e){
    this.setData({changeAddress: e.detail.value});
  },

  clearInput: function () {
    this.setData({ changeAddress: '' });
  },

  bindBlur: function () {
    this.setData({ isFocus: false })
  },

  bindFocus: function () {
    this.setData({ isFocus: true })
  },

  checkInput:function(){
    var changeAddress = this.data.changeAddress;
    var vm = this;
    if(changeAddress==''){
      this.showTips('公司地址不能为空');
      return;
    }
    wx.showLoading({
      title: '修改中',
    });
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.setData({
          openId: res.data.openId,
          eid: res.data.eid,
          orgno: res.data.orgno
        });
        console.log(vm.data);
        vm.sumbit();
      },
    });
  },

  sumbit:function(){
    var vm = this;
    var url = app.globalData.url;
    var openId, eid, orgno, changeAddress;
    console.log(vm.data);
    openId = vm.data.openId;
    eid = vm.data.eid;
    orgno = vm.data.orgno;
    changeAddress = vm.data.changeAddress;
    wx.request({
      url: url + 'customer/editCompanyInfo',
      data: {
        openId: openId,
        address: changeAddress,
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eid: eid,
        orgno: orgno,
      },
      method: 'post',
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.code == '1') {
          wx.showToast({
            title: '修改成功',
          });
          wx.navigateBack({
            delta: 1
          });
        } else {
          vm.showTips(res.data.message);
        }
      },
      error: function (res) {
        console.log(res);
        wx.hideLoading();
      }
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