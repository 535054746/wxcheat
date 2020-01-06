Page({

  /**
   * 页面的初始数据
   */
  data: {
    flag:false,

    company:'',
    contact:'',
    phone: '',

    tipFalg: false,
    tipText: '',
    timeOutObj: null,
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
        vm.setData({ company: res.data.companyName, contact: res.data.name, phone: res.data.mobile});
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
  bindInput:function(e){
    var inputType = e.currentTarget.dataset.type;
    var value = e.detail.value;
    if (inputType == 'company') {
      this.setData({ company: value });
    } else if (inputType == 'contact') {
      this.setData({ contact: value });
    } else if (inputType == 'phone') {
      this.setData({ phone: value });
    }
  },
  checkInput: function () {
    if (this.data.company == '') {
      this.showTips("公司不能为空");
      return;
    }
    if (this.data.contact == '') {
      this.showTips("联系人不能为空");
      return;
    }
    if (this.data.phone == '') {
      this.showTips("手机号码不能为空");
      return;
    }
    if (this.data.phone.length<11) {
      this.showTips("手机号码格式不正确");
      return;
    }
    wx.showLoading({
      title: '提交中',
    })
    var vm = this;
    setTimeout(function () {
      wx.hideLoading()
      vm.setData({ flag: true })
    },500)
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