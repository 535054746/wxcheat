// pages/mine/manageDept/manageDept.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

    deptName:'',
    orderPersonList:'',

    id:'',
    openId:'',
    eid:'',
    orgno:'',
    organizationid:'',
    deleteId:'',

    isShowTips: false,
    tipsType: 0,
    tipsText:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ deptName: options.deptName, id: options.id, organizationid: options.organizationid});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.showLoading({
      title: '数据加载中',
    })
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function(res) {
        console.log(res.data);
        vm.data.openId = res.data.openId;
        vm.data.eid = res.data.eid;
        vm.data.orgno = res.data.orgno;
        vm.getOrderPersonList();
      },
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getOrderPersonList();
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

  getOrderPersonList: function (openId,eid,orgno) {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url +'framework/getOrderUserList',
      method: 'get',
      dataType: 'json',
      data: {
        openId: vm.data.openId,
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
        if(res.data.code=='1'){
          vm.setData({orderPersonList:res.data.data});
        }else{
          console.log(res.data.message);
        }
      },
      error: function (res) {
        wx.hideLoading();
        console.log(res.data);
      }
    })
  },

  jumpLink:function(e){
    var targetUrl = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: targetUrl,
    })
  },

  callPhone: function (e) {
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },

  showTips:function(e, msg){
    var vm = this;
    try {
      var type = e.currentTarget.dataset.type;
      vm.setData({deleteId:e.currentTarget.dataset.id});
    } catch (ex) {
      var type = 'error';
      vm.setData({ deleteId: '' });
    }
    vm.setData({ isShowTips:true});
    console.log(vm.data);
    if (type == 'orderTips') {
      vm.setData({ tipsType: 0 });
    } else if (type == 'delete') {
      vm.setData({ tipsType: 1, tipsText:'删除后不可恢复，也无法在下单，\n确定要删除吗？'});   
    } else {
      vm.setData({ tipsType: 2, tipsText: msg });   
    }
  },

  loginOutComfire:function(e){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'framework/saveOrderUser',
      method: 'POST',
      dataType: 'json',
      data: {
        disabled: 1,
        id: vm.data.deleteId,
        openId:vm.data.openId,
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
            title: '删除成功',
          });
          vm.setData({isShowTips:false});
          vm.getOrderPersonList();
        } else {
          vm.showTips(res.data.message, res.data.message);
          console.log(res.data.message);
        }
      },
      error: function (res) {
        wx.hideLoading();
        console.log(res.data);
      }
    })
  },

  loginOutCancel: function (event) {
    this.setData({
      isShowTips: false
    })
  },
})