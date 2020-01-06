// pages/mine/changeDept/changeDept.js
//获取应用实例
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    changeName:'',
    deptName:'',

    id:'',
    eid:'',
    orgno:'',
    openId:'',

    tipFalg: false,
    tipText: '',
    timeOutObj: null,
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ deptName: options.deptName, changeName: options.deptName, id:options.id});
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

  clearInput: function () {
    this.setData({ changeName: '' });
  },

  textInput:function(e){
    this.setData({changeName:e.detail.value});
  },

  checkInput: function () {
    var changeName = this.data.changeName;
    var vm = this;
    if (changeName == '') {
      this.showTips('部门名称不能为空');
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
  },

  sumbit: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'customer/saveOrganization',
      method: 'post',
      dataType: 'json',
      data: {
        openId: vm.data.openId,
        organizationname: vm.data.changeName,
        id: vm.data.id,
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
          vm.callBackDeptName(vm.data.changeName);
          setTimeout(function () {
            wx.navigateBack({
              delta: '1'
            });},500);
          
        } else {
          vm.showTipes(res.data.message);
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
  },

  callBackDeptName:function(deptName){
    var pages = getCurrentPages();
    var prevPage = pages[pages.length-2];
    prevPage.setData({ deptName: deptName });
  },
})