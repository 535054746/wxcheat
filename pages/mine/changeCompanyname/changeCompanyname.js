// pages/mine/changeCompanyname/changeCompanyname.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    companyName:'',
    changeName: '',

    tipFalg: false,
    tipText: '',
    timeOutObj: null,

    openId:'',
    eid:'',
    orgno:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ companyName: options.companyName, changeName: options.companyName});

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

  clearInput:function(){
    this.setData({ changeName: '' });
  },

  bindBlur: function () {
    this.setData({ isFocus: false })
  },

  bindFocus: function () {
    this.setData({ isFocus: true })
  },

  companyNameInput:function(e){
    this.setData({changeName:e.detail.value});
  },

  checkInput: function () {
    var changeName = this.data.changeName;
    var vm = this;
    if (changeName.length == 0) {
      this.showTips('公司名称不能为空');
      return;
    }
    wx.showLoading({
      title: '修改中',
    })
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

  sumbit: function () {
    var vm = this;
    var url = app.globalData.url;
    var openId, eid, orgno, changeName;
    console.log(vm.data);
    openId = vm.data.openId;
    eid = vm.data.eid;
    orgno = vm.data.orgno;
    changeName = vm.data.changeName;
    wx.request({
      url: url +'customer/editCompanyInfo',
      data:{
        openId : openId,
        companyName : changeName,
      },
      dataType:'json',
      header: {
        "Content-Type": "application/json",
        eid: eid,
        orgno: orgno,
      },
      method:'post',
      success:function(res){
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
        wx.hideLoading();}
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