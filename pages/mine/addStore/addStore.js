// pages/mine/addStore/addStore.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',

    eid:'',
    orgno:'',
    openId:'',
    parentid:'',

    isFocus: false,

    tipFalg: false,
    tipText: '',
    timeOutObj: null,

    isLoad:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ parentid: options.parentid})
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


  textInput: function (e) {
    this.setData({ name: e.detail.value });
  },

  clearInput: function (e) {
    this.setData({ name: '' });
  },

  bindBlur:function(){
    this.setData({isFocus:false})
  },

  bindFocus: function () {
    this.setData({ isFocus: true })
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

  clearInput: function () {
    this.setData({ name: '' });
  },

  checkInput: function () {
    if (!this.data.isLoad) {
      this.data.isLoad = true;
      var name = this.data.name;
      var vm = this;
      if (name == '') {
        this.showTips('门店名称不能为空');
        this.data.isLoad = false;
        return;
      }
      if (app.checkCompanyName(name)) {
        this.showTips('门店名称必须由数字，字母，中文组成');
        this.data.isLoad = false;
        return;
      }
      wx.showLoading({
        title: '修改中',
      });
      wx.getStorage({
        key: 'supplierInfo',
        success: function (res) {
          vm.setData({ eid: res.data.eid, orgno: res.data.orgno, openId: res.data.openId });
          vm.sumbit();
        },
      })
    }
  },

  sumbit:function(){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'customer/saveOrganization',
      method: 'post',
      dataType: 'json',
      data: {
        openId: vm.data.openId,
        parentid: vm.data.parentid,
        organizationname: vm.data.name,
        organizationtypeid: '1',
        fieId2:'0',
      },
      header: {
        "Content-Type": "application/json",
        eid: vm.data.eid,
        orgno: vm.data.orgno,
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res.data);
        if (res.data.code == '1') {
          wx.showToast({
            title: '修改成功',
          });
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            });
          }, 500);
        } else {
          vm.setData({ isLoad: false });
          vm.showTips(res.data.message);
          console.log(res.data.message);
        }
      },
      error: function (res) {
        vm.setData({ isLoad: false });
        console.log(res.data);
        wx.hideLoading();
      },
    });
  }
})