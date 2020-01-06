// pages/application/merchant/approval/approval.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    eId:'',
    businessType:'',
    redCount: 0
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
    this.errorTips = this.selectComponent('#errorTips'); 
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.businessType = res.data.businessType;
        vm.getRedCount();
      }
    });
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

  goList: function (e) {
    var approval = e.currentTarget.dataset.type;
    if (approval == 1) {
      wx.navigateTo({
        url: '../approvalList/approvalList?type=' + 'approval',
      })
    } else if (approval == 2) {
      wx.navigateTo({
        url: '../approvaledList/approvaledList?type=' + 'approval',
      })
    } else if (approval == 3) {
      wx.navigateTo({
        url: '../approvalSelfList/approvalSelfList?type=' + 'approval',
      })
    }
  },
  
  getRedCount: function () {
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
          for(var i = 0;i<res.data.data.length;i++){
            if (res.data.data[i].name == '采购管理'){
              for (var j = 0; j < res.data.data[i].childerList.length;j++){
                if (res.data.data[i].childerList[j].url == 'SKX_MODULE_00004'){
                  vm.setData({ redCount: res.data.data[i].childerList[j].totalNumMap.totalCount});
                  console.log(vm.data.redCount);
                  break;
                }
              }
              break;
            }
          }
        } else {
          vm.showTips(res.data.message);
        }
      }, fail: function (res) {
        console.log(res);
        vm.showTips('请求失败,请检查网络');
      }
    })
  },

  showTips:function(msg){
    this.errorTips.showTips(msg);
  }
})