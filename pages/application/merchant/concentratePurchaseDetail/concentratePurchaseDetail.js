// pages/application/merchant/concentratePurchaseDetail/concentratePurchaseDetail.js
const app = getApp();
const voiceCenter = wx.createInnerAudioContext();
var wechatUtil = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    taskId: '',
    purchaseType: '',
    fromApproval: false,
    openId:'',
    eId:'',
    orgno:'',

    orederDetail:null,

    expand: true,

    tabIndex:0,

    listByType: [],
    listBySupplier:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ id: options.id, fromApproval: options.source == 'approval', taskId: options.taskId, purchaseType: options.purchaseType })
    this.initVoice();
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
    this.editDialog = this.selectComponent('#editDialog');
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        wx.getStorage({
          key: 'userInfo',
          success: function (res) {
            vm.data.orgno = res.data.user.orgno;
            vm.data.organizationid = res.data.user.organizationid;
            vm.getOrderDetail();
            vm.getShopByType();
            vm.getShopBySupplier();
          },
        })
      },
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

  getOrderDetail:function(){
    var vm = this;
    var url = app.globalData.url;
    wx.showLoading({
      title: '加载中',
      mask:true
    });
    wx.request({
      url: url + 'oms/materialReq/getReqDetail',
      method: 'get',
      data: {
        id: vm.data.id,
        openId: vm.data.openId,
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        openId: vm.data.openId,
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      success: function (res) {
        wx.hideLoading();
        if(res.data.code=='1'){
          vm.setData({ orderDetail:vm.formatData(res.data.data)});
        }else{
          vm.showTips(res.data.message);
        }
      },
      fail:function(res){
        wx.hideLoading();
        vm.showTips('请求失败');
        console.log(res);
      }
    })
  },

  getShopByType: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/materialReq/getReqDetailByProduct',
      method: 'get',
      data: {
        id: vm.data.id,
        openId: vm.data.openId,
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        openId: vm.data.openId,
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      success: function (res) {
        if (res.data.code == '1') {
          vm.setData({ listByType: res.data.data.resultlist });
        } else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        vm.showTips('请求失败');
        console.log(res);
      }
    })
  },

  getShopBySupplier: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/materialReq/getReqDetailBySuplier',
      method: 'get',
      data: {
        id: vm.data.id,
        openId: vm.data.openId,
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        openId: vm.data.openId,
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      success: function (res) {
        if (res.data.code == '1') {
          vm.setData({ listBySupplier: vm.formatSupplierList(res.data.data.resultlist) });
        } else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        vm.showTips('请求失败');
        console.log(res);
      }
    })
  },

  showTips:function(msg){
    this.errorTips.showTips(msg);
  },

  expand:function(){
    this.setData({expand:!this.data.expand})
  },

  expandItem:function(e){
    var itemType = e.currentTarget.dataset.type;
    var firstIndex = e.currentTarget.dataset.first;
    var secondIndex = e.currentTarget.dataset.second;
    if(itemType=='shop'){
      var list = this.data.listByType;
      list[firstIndex].expand = list[firstIndex].expand == undefined ? false : !list[firstIndex].expand;
      this.setData({listByType: list});
    }else{
      var list = this.data.listBySupplier;
      if (secondIndex == undefined) {
        list[firstIndex].expand = list[firstIndex].expand==undefined?false:!list[firstIndex].expand;
        this.setData({ listBySupplier: list });
      }else{
        list[firstIndex].list[secondIndex].expand = list[firstIndex].list[secondIndex].expand == undefined ? false : !list[firstIndex].list[secondIndex].expand;
        this.setData({ listBySupplier:list});
      }
    }

  },

  selectTab:function(e){
    console.log(e.detail);
    this.setData({tabIndex:e.detail})
  },

  formatData:function(data){
    data.billDate = wechatUtil.formatTime(new Date(data.billDate))
    return data;
  },

  formatSupplierList:function(data){
    for(var i = 0;i<data.length;i++){
      if (data[i].applyvoice.length!=0){
        data[i].applyvoice = JSON.parse(data[i].applyvoice);
      }
    }
    return data;
  },

  ynTap: function (e) {
    var data = null;

    this.data.approalType = e.detail == 'yes' ? 1 : 2;
    if (e.detail == 'yes') {
      data = { title: '审核意见', hintText: '选填/请在此输入审核意见', RightBtnText: '审核' }
    } else if (e.detail == 'no') {
      data = { title: '退回原因', hintText: '必填/请在此输入退回原因', RightBtnText: '退回' }
    }
    this.editDialog.init(data);
    this.editDialog.show();
  },

  editDialogLeftTap: function () { },

  editDialogRightTap: function (e) {
    console.log(e.detail)
    if (e.detail == '' && this.data.approalType == 2) {
      this.showTips('请输入退回原因')
      return;
    }
    this.editDialog.hide();
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/ownPurReq/examinePurReq',
      method: 'post',
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      data: {
        openId: vm.data.openId,
        taskId: vm.data.taskId,
        checkMessage: e.detail,
        isPass: vm.data.approalType.toString(),
        purchaseType: vm.data.purchaseType,
        reqId: vm.data.id,
        automatic: '0',
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == '1') {
          vm.showTips(vm.data.approalType == 1 ? '审核' : '退回' + '成功');
          vm.getOrderDetail();
          vm.getShopByType();
          vm.getShopBySupplier();
        } else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
        vm.showTips('请求失败,请检查网络');
      }
    })
  },

  playVoice: function (e) {
    console.log('playVoice')
    var vm = this;
    var index = e.currentTarget.dataset.index;
    if (vm.data.listBySupplier[index].isPlay) {
      vm.data.currentPlayIndex = index;
      voiceCenter.stop();
    } else {
      if (!voiceCenter.paused) {
        console.log('still playing last voice')
        voiceCenter.stop();
      }
      vm.data.currentPlayIndex = index;
      voiceCenter.src = vm.data.listBySupplier[index].applyvoice.src;
      voiceCenter.play();
    }
  },

  initVoice: function () {
    console.log('voiceCenter initVoice')
    var vm = this;
    voiceCenter.onPlay(() => {
      console.log('voiceCenter onPlay')
      vm.data.listBySupplier[vm.data.currentPlayIndex].isPlay = true;
      vm.setData({
        listBySupplier: vm.data.listBySupplier
      })
    });
    voiceCenter.onStop(() => {
      console.log('voiceCenter onStop')
      vm.data.listBySupplier[vm.data.currentPlayIndex].isPlay = false;
      vm.setData({
        listBySupplier: vm.data.listBySupplier
      })
    });
    voiceCenter.onEnded(() => {
      console.log('voiceCenter onEnded')
      vm.data.listBySupplier[vm.data.currentPlayIndex].isPlay = false;
      vm.setData({
        listBySupplier: vm.data.listBySupplier
      })
    });
    voiceCenter.onError((res) => {
      vm.data.listBySupplier[vm.data.currentPlayIndex].isPlay = false;
      vm.setData({
        listBySupplier: vm.data.listBySupplier
      })
      console.log('voiceCenter onError')
      console.log(res.errMsg)
      console.log(res.errCode)
      if (res.errCode == '10001') {
        vm.showTips('系统错误，语音播放失败。')
      } else if (res.errCode == '10002') {
        vm.showTips('网络错误，语音播放失败。')
      } else if (res.errCode == '10003') {
        vm.showTips('文件错误，语音播放失败。')
      } else if (res.errCode == '10004') {
        vm.showTips('格式错误，语音播放失败。')
      } else if (res.errCode == '-1') {
        vm.showTips('未知错误，语音播放失败。')
      }
    });
  },
})