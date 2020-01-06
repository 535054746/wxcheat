// pages/application/merchant/approvalList/approvalList.js
const app = getApp()
var wechatUtil = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId:'',
    eId:'',
    orgno:'',
    mList:[],
    isFirst: true,

    firstIndex: '',
    secondIndex:'',
    approalType:'',
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

    this.errorTips = this.selectComponent('#myTips');
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
            vm.getList();
          },
        })
      }
    });
    this.data.isFirst = false;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(!this.data.isFirst)
      wx.startPullDownRefresh();
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
    var vm = this;
    setTimeout(function () {
      vm.getList();
    },500);
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

  getList: function (){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url +'workflow/getPendingAudit',
      method:'get',
      data:{
        openId: vm.data.openId,
        type: 0//0 未审核 1已审核 2 我发起的
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      success: function (res) {
        wx.stopPullDownRefresh();
        if(res.data.code=='1'){
          vm.setData({ mList: vm.formatData(res.data.data)})
        }else{
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        wx.stopPullDownRefresh();
        console.log(res);
        vm.showTips('请求失败,请检查网络');
      }
    })
  },

  showTips: function (msg) {
    this.errorTips.showTips(msg);
  },

  formatData: function (list) {
    for (var i = 0; i < list.length; i++) {
      list[i].expand = true;
      for (var j = 0; j < list[i].list.length; j++) {
        list[i].list[j].createtime = wechatUtil.formatTime(new Date(list[i].list[j].createtime))
        if (!list[i].list[j].flagBillstatus){
          list[i].list[j].flagBillstatus = this.getBillStatus(list[i].list[j].billStatus, list[i].list[j].type)
        }
      }
    }
    var mList = this.data.mList;
    if (mList.length != 0) {
      for (var i = 0; i < list.length; i++) {
        for (var j = 0; j < mList.length; j++) {
          if(list[i].billType == mList[j].billType){
            list[i].expand = mList[j].expand;
            break;
          }
        }
      }
    }
    return list;
  },

  getBillStatus:function(status,billType){
    if (billType == 'BU0002') {
      if (status == 0) {
        return '待审核';
      }
      if (status == 1) {
        return '已审核';
      }
      if (status == 2) {
        return '已下单';
      }
      if (status == 3) {
        return '待验收';
      }
      if (status == 4) {
        return '已验收';
      }
      if (status == 6) {
        return '已完成';
      }
      if (status == 11) {
        return '待提交';
      }
    } else {
      if (status == 1) {
        return '待审核';
      }
      if (status == 2) {
        return '已退回';
      }
      if (status == 3) {
        return '审核中';
      }
      if (status == 4) {
        return '已审核';
      }
      if (status == 5) {
        return '待验收';
      }
      if (status == 6) {
        return '已完成';
      }
    }   
  },

  showSecondItem:function(e){
    var index = e.currentTarget.dataset.index;
    var mList = this.data.mList;
    mList[index].expand = !mList[index].expand;
    this.setData({mList:mList})
  },

  approalOrder:function(e){
    this.data.firstIndex = e.currentTarget.dataset.firstindex;
    this.data.secondIndex = e.currentTarget.dataset.secondindex;
    this.data.approalType = e.currentTarget.dataset.type;
    var data = null;
    if (this.data.approalType == 1) {
      data = { title: '审核意见', hintText: '选填/请在此输入审核意见', RightBtnText: '审核' }
    } else if (this.data.approalType == 2) {
      data = { title: '退回原因', hintText: '必填/请在此输入退回原因', RightBtnText: '退回' }
    }
    this.editDialog.init(data);
    this.editDialog.show();
  },

  leftTap:function(){
    this.data.firstIndex = '';
    this.data.secondIndex = '';
    this.data.approalType = '';
  },

  rightTap:function(e){
    console.log(e.detail)
    if(e.detail==''&&this.data.approalType==2){
      this.showTips('请输入退回原因')
      return;
    }
    this.editDialog.hide();
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url +'oms/ownPurReq/examinePurReq',   
      method: 'post',
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      data:{
        openId: vm.data.openId,
        taskId: vm.data.mList[vm.data.firstIndex].list[vm.data.secondIndex].taskId,
        checkMessage: e.detail,
        isPass: vm.data.approalType.toString(),
        purchaseType: vm.data.mList[vm.data.firstIndex].list[vm.data.secondIndex].type,
        reqId: vm.data.mList[vm.data.firstIndex].list[vm.data.secondIndex].id,
        automatic:'0',
      },
      success:function(res){
        wx.hideLoading();
        if (res.data.code == '1') {
          vm.showTips(vm.data.approalType==1?'审核':'退回'+'成功');
          wx.startPullDownRefresh({
            
          })
        }else{
          vm.showTips(res.data.message);
        }
      },
      fail:function(res){
        wx.hideLoading();
        console.log(res);
        vm.showTips('请求失败,请检查网络');
      }
    })
  },

  goDetail:function(e){
    var index1 = e.currentTarget.dataset.findex;
    var index2 = e.currentTarget.dataset.sindex;
    var list = this.data.mList;
    var orderType = list[index1].list[index2].type;
    var id = list[index1].list[index2].id;
    var taskId = list[index1].list[index2].taskId;
    if (orderType == 'BU0001') {
      wx.navigateTo({
        url: '../selfPurchaseDetail/selfPurchaseDetail?source=approval&id=' + id + '&taskId=' + taskId + '&purchaseType=' + orderType,
      })
    } else if (orderType == 'BU0002') {
      wx.navigateTo({
        url: '../concentratePurchaseDetail/concentratePurchaseDetail?source=approval&id=' + id + '&taskId=' + taskId + '&purchaseType=' + orderType,
      })
    } else if (orderType == 'BU0003') {
      wx.navigateTo({
        url: '../transfersDetail/transfersDetail?source=approval&id=' + id + '&taskId=' + taskId + '&purchaseType=' + orderType,
        success: function(res) {},
        fail: function(res) {},
        complete: function(res) {},
      })
    }
  }
})