// pages/mine/addOrderPerson/addOrderPerson.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    person:'',
    phone:'',

    isPersonFocus: false,
    isPhoneFocus: false,
    
    organizationid:'',
    eid:'',
    orgno:'',
    openId:'',

    tipFalg: false,
    tipText: '',
    timeOutObj: null,

    isLoad:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ organizationid: options.organizationid});
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

  clearInput: function (e) {
    if(e.currentTarget.dataset.type =='person')
      this.setData({ person: '' });
    else if (e.currentTarget.dataset.type == 'phone')
      this.setData({ phone: '' });
  },

  personInput: function (e) {
    this.setData({person:e.detail.value});
  },

  phoneInput: function (e) {
    this.setData({ phone: e.detail.value });
  },

  isFocus: function (e) {
    if (e.currentTarget.dataset.type == 'person')
      this.setData({ isPersonFocus: true });
    else if (e.currentTarget.dataset.type == 'phone')
      this.setData({ isPhoneFocus: true });
  },

  isBlur: function (e) {
    if (e.currentTarget.dataset.type == 'person')
      this.setData({ isPersonFocus: false });
    else if (e.currentTarget.dataset.type == 'phone')
      this.setData({ isPhoneFocus: false });
  },

  checkInput: function () {
    if (!this.data.isLoad) {
      this.data.isLoad = true;
      var person = this.data.person;
      var phone = this.data.phone;
      var vm = this;
      if (person == '') {
        this.showTips('联系人不能为空');
        this.data.isLoad = false;
        return;
      }
      if (phone == '') {
        this.showTips('手机号码不能为空');
        this.data.isLoad = false;
        return;
      }
      if (!app.checkPhone(phone)) {
        this.showTips('手机号码格式不正确');
        this.data.isLoad = false;
        return;
      }
      wx.showLoading({
        title: '修改中',
      });
      wx.getStorage({
        key: 'supplierInfo',
        success: function (res) {
          vm.setData({
            eid: res.data.eid,
            orgno: res.data.orgno,
            openId: res.data.openId
          });
          vm.sumbit();
        },
      })
    }
  },

  sumbit: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'framework/saveOrderUser', 
      method: 'post',
      dataType: 'json',
      data: {
        openId: vm.data.openId,
        phone: vm.data.phone,
        name: vm.data.person,
        organizationid: vm.data.organizationid,
      },
      header: {
        "Content-Type": "application/json",
        eid: vm.data.eid,
        orgno: vm.data.orgno
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.code == '1') {
          wx.showToast({
            title: '修改成功',
          })
          setTimeout(function(){
            wx.navigateBack({
              delta: 1
            })
          },500);
          
        } else {
          vm.data.isLoad = false;
          vm.showTips(res.data.message);
          console.log(res.data.message);
        }
      },
      error: function (res) {
        vm.data.isLoad = false;
        wx.hideLoading();
        console.log(res.data);
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