// pages/mine/addStore/addStore.js
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeList: '',
    companyName:'',

    openId:'',
    eId:'',
    orgno:'',
    organizationid:'',
    parentid:'',
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
    wx.showLoading({
      title: '数据加载中',
    })
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        console.log(res.data);
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.companyName = res.data.companyName;
        vm.setData({
          companyName:res.data.companyName
        })
        wx.getStorage({
          key: 'userInfo',
          success: function (res1) {
            vm.data.orgno = res1.data.user.orgno;
            vm.data.organizationid = res1.data.user.organizationid;
            vm.setData({
              parentid: res1.data.user.organizationid
            })
            vm.getStoreList();
          },
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

  jumpLink:function(e){
    var target = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: target,
    })
  },

  getStoreList: function () {
    var url = app.globalData.url;
    var vm = this;
    wx.request({
      url: url + 'framework/org/getOrgTree2',
      method:'get',
      dataType:'json',
      data:{
        openId: vm.data.openId,
        organizationid: vm.data.organizationid,
      },
      header:{
        eid:vm.data.eId,
        orgno:vm.data.orgno,  
      },
      success:function(res){
        console.log(res.data);
        wx.hideLoading();
        if (res.data.code == '1') {
          var data = res.data.data;
          // if (data[0].orgList[0].organizationtypeid == 10) {
          //   vm.setData({ storeList: data[0].orgList[0].orgList });
          // } else {
          //   vm.setData({ storeList: data[0].orgList });
          // }
          vm.setData({ storeList: data[0].orgList });
        }else{
          console.log(res.data.message);
        }
      },
      error: function (res) {
        wx.hideLoading();
        console.log(res);
      }
    })
  }
})