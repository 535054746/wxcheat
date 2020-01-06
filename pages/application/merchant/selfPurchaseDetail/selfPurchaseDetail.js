// pages/application/merchant/selfPurchaseDetail/selfPurchaseDetail.js
const app = getApp();
const voiceCenter = wx.createInnerAudioContext();
var wechatUtil = require('../../../../utils/util.js');
var bluetoothUtil = require('../../../../utils/bluetoothUtil.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    taskId: '',
    purchaseType: '',
    fromApproval: false,
  orderDetail:null,
  mList:[],
    expand:true,
    bbLeftBtns: [{ name: '连接蓝牙', pic: 'ljlywlj@3x' }, { name: '添加备注', pic: 'spglxg@2x' }],

    deviceId: '',
    bluetoothData: '',
    currentIndex:null,
    
    isShowInput: false,
    isShowRemark: false,
    remarkValue:'',
  },

  /**
   * 生命周remarkValue
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
    this.bluetoothDialog = this.selectComponent('#bluetoothDialog');
    this.bottomBtn = this.selectComponent('#bottomBtn');
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.setData({ mName: res.data.name });
        wx.getStorage({
          key: 'userInfo',
          success: function (res) {
            vm.data.orgno = res.data.user.orgno;
            vm.data.organizationid = res.data.user.organizationid;
            vm.getOrderDetail();
          },
        })
      },
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.disconnectBluetooth();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.disconnectBluetooth();
    voiceCenter.destroy();
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

  getOrderDetail: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url: url + 'oms/ownPurReq/getOwnPurReqInfo',
      method: 'get',
      data: {
        reqId: vm.data.id,
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
        if (res.data.code == '1') {
          vm.setData({ orderDetail: vm.formatData(res.data.data) });
          if (res.data.data.billStatus == 5) {
            vm.startSearchBluetooth();
            vm.getCheckList();
          }else{
            vm.getOrderList();
          }
        } else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        wx.hideLoading();
        vm.showTips('请求失败');
        console.log(res);
      }
    })
  },

  getOrderList: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url: url + 'oms/selfReq/getDetailInfoByCategory',
      method: 'get',
      data: {
        reqId: vm.data.id,
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
        if (res.data.code == '1') {
          vm.setData({ mList: res.data.data });
        } else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        wx.hideLoading();
        vm.showTips('请求失败');
        console.log(res);
      }
    })
  },

  getCheckList: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    wx.request({
      url: url + 'oms/selfReq/groupByCategoryWithBillstatus',
      method: 'get',
      data: {
        reqId: vm.data.id,
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
        if (res.data.code == '1') {
          vm.setData({ mList: vm.formatList(res.data.data) });
        } else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        wx.hideLoading();
        vm.showTips('请求失败');
        console.log(res);
      }
    })
  },

  checkOrderShop: function () {
    wx.showLoading({
      title: '验收中',
      mask: true,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/selfReq/acceptanceCommit',
      method: 'post',
      data: {
        reqId: vm.data.id,
        openId: vm.data.openId,
        itemJson: vm.data.itemJson,
        noteJson: vm.data.noteJson
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
        if (res.data.code == '1') {
          vm.getOrderDetail();
          vm.setData({ isShowRemark: false, isShowInput: false, itemJson: undefined, noteJson: undefined })
        }
        vm.showTips(res.data.message);

      },
      fail: function (res) {
        wx.hideLoading();
        vm.showTips('请求失败');
        console.log(res);
      }
    })
  },

  showTips: function (msg) {
    this.errorTips.showTips(msg);
  },

  expand: function () {
    this.setData({ expand: !this.data.expand })
  },

  expandItem: function (e) {
    var itemType = e.currentTarget.dataset.type;
    var firstIndex = e.currentTarget.dataset.first;
    var secondIndex = e.currentTarget.dataset.second;
    var thirdIndex = e.currentTarget.dataset.third;
    var list = this.data.mList;
    if (thirdIndex == undefined) {
      list[firstIndex].expand = list[firstIndex].expand == undefined ? false : !list[firstIndex].expand;
    } else {
      list[firstIndex].list[secondIndex].list[thirdIndex].expand = list[firstIndex].list[secondIndex].list[thirdIndex].expand == undefined ? false : !list[firstIndex].list[secondIndex].list[thirdIndex].expand;
    }
    this.setData({ mList: list });
  },

  formatData: function (data) {
    data.billDate = wechatUtil.formatTime(new Date(data.billDate))
    if (data.workflowNote) {
      for (var i = 0; i < data.workflowNote.length; i++) {
        data.workflowNote[i].checkDate = data.workflowNote[i].checkDate ? wechatUtil.formatTime(new Date(data.workflowNote[i].checkDate)) : '';
      }
    }
    if (data.checkNote) {
      for (var i = 0; i < data.checkNote.length; i++) {
        data.checkNote[i].checkDate = data.checkNote[i].checkDate ? wechatUtil.formatTime(new Date(data.checkNote[i].checkDate)) : '';
        if (data.checkNote[i].ApplyVoice){
          data.checkNote[i].ApplyVoice = JSON.parse(data.checkNote[i].ApplyVoice);
        }
      }
    }
    return data;
  },

  formatList: function(data){
    for(var i = 0;i<data.length;i++){
      for(var j = 0;j<data[i].list.length;j++){
        for(var k = 0;k<data[i].list[j].list.length;k++){
          if (data[i].list[j].list[k].billstatus==1){
            data[i].list[j].list[k].expand = true;
          } else {
            data[i].list[j].list[k].expand = false;
          }
        }
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

  startSearchBluetooth: function () {
    wx.showLoading({
      title: '搜索中',
      mask: true,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
    var vm = this;
    bluetoothUtil.onStepGetDeviceList(
      function (res) {
        vm.bluetoothDialog.initData(res.devices);
        vm.bluetoothDialog.show();
        wx.hideLoading();
      },
      function (res) {
        vm.bluetoothDialog.initData([]);
        vm.showTips(res)
        wx.hideLoading();
      }
    );
  },

  disconnectBluetooth: function () {
    if (this.data.orderDetail.billStatus == 5) {
      bluetoothUtil.disconnectBluetooth(this.data.deviceId);
      this.bluetoothDialog.clear();
      this.data.deviceId = '';
      var bottom = [{ name: '连接蓝牙', pic: 'ljlywlj@3x' }, { name: '添加备注', pic: 'spglxg@2x' }];
      this.bottomBtn.initData(bottom, '验收');
    }
  },

  formatWeight: function (weight) {
    if (weight.indexOf('-') == -1) {
      if (weight.indexOf('kg') != -1) {
        return parseFloat(weight.replace('+', '').replace('kg', '').trim()) * 2;
      } else {
        this.showTips('请设置蓝牙秤单位为kg');
        return 0;
      }
    } else {
      this.showTips('数据为负数，请检查设备')
      return 0;
    }
  },

  bluetoothItemTap: function (e) {
    wx.showLoading({
      title: '连接中',
      mask: true,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
    var vm = this;
    var deviceid = e.detail;
    console.log('deviceid=' + deviceid);
    bluetoothUtil.onStepConnDeviceAndGetMsg(
      deviceid,
      function (res) {
        vm.bluetoothDialog.initConned(res);
        vm.data.deviceId = res;
        var bottom = [{ name: '断开蓝牙', pic: 'ljlyylj@3x', color: true }, { name: '添加备注', pic: 'spglxg@2x' }];
        vm.bottomBtn.initData(bottom, '批量验收');
      },
      function (res) {
        vm.showTips('连接失败')
        wx.hideLoading();
      },
      function (res) {
        vm.data.bluetoothData = res;
        if (vm.data.currentIndex != null) {
          var num = parseFloat(vm.formatWeight(res)).toFixed(2);
          vm.data.mList[vm.data.currentIndex[0]].list[vm.data.currentIndex[1]].list[vm.data.currentIndex[2]].list[vm.data.currentIndex[3]].checkNumber = num;
          vm.data.mList[vm.data.currentIndex[0]].list[vm.data.currentIndex[1]].list[vm.data.currentIndex[2]].list[vm.data.currentIndex[3]].receiveType = 1;
          vm.setData({ mList: vm.data.mList });
        }
        wx.hideLoading();
      },
      function (res){
        console.log(res);
        vm.showTips('获取蓝牙设备服务失败');
      }
    )
  },

  weightInput: function (e) {
    var index1 = e.currentTarget.dataset.firstindex;
    var index2 = e.currentTarget.dataset.secondindex;
    var index3 = e.currentTarget.dataset.thirdindex;
    var index4 = e.currentTarget.dataset.fourindex;


    var vm = this;
    if (this.data.mList[index1].list[index2].list[index3].list[index4].checkNumber != undefined) {
      console.log(this.data.mList[index1].list[index2].list[index3].list[index4].checkNumber.length);
      if (e.detail.value.length < this.data.mList[index1].list[index2].list[index3].list[index4].checkNumber.length) {
        this.setData({
          currentIndex: null
        })
      }
    }
    var value = e.detail.value;
    if (value.charAt(0) == '.') {
      vm.setData({ mList: vm.data.mList });
      return
    }
    var pattern = /^(0|[1-9][0-9]*|[1-9]\d*[.]?\d{0,3}|[0][.]\d?\d?[1-9]?)$/;
    if (value != '' && !pattern.test(value)) {
      vm.setData({ mList: vm.data.mList });
      return
    }
    if (value != '' && value.charAt(value.length - 1) != '.') {
      this.data.mList[index1].list[index2].list[index3].list[index4].isCheck = e.detail.value != '';
      this.data.mList[index1].list[index2].list[index3].list[index4].checkNumber = e.detail.value;
      this.data.mList[index1].list[index2].list[index3].list[index4].receiveType = 0;
      this.setData({
        mList: this.data.mList
      })
      console.log(this.data.mList);
    }
  },

  weightFocus: function (e) {
    var index1 = e.currentTarget.dataset.firstindex;
    var index2 = e.currentTarget.dataset.secondindex;
    var index3 = e.currentTarget.dataset.thirdindex;
    var index4 = e.currentTarget.dataset.fourindex;
    var vm = this;
    if (this.data.deviceId != '') {
      this.data.mList[index1].list[index2].list[index3].list[index4].isCheck = true;
      this.setData({ currentIndex: [index1, index2, index3,index4] });
    }
  },

  weightBlur: function (e) {
    var value = e.detail.value;
    var index1 = e.currentTarget.dataset.firstindex;
    var index2 = e.currentTarget.dataset.secondindex;
    var index3 = e.currentTarget.dataset.thirdindex;
    var index4 = e.currentTarget.dataset.fourindex;

    this.setData({ currentIndex: null });

    if (value == '') {
      this.data.mList[index1].list[index2].list[index3].list[index4].isCheck = false;
      this.data.mList[index1].list[index2].list[index3].list[index4].checkNumber = '';
      this.mList[index1].list[index2].list[index3].list[index4].receiveType = 0;
      this.setData({
        mList: this.data.mList
      })
      console.log(this.data.mList);
    } else if (value.charAt(value.length - 1) == '.' && value.charAt(0) == '0') {
      this.data.mList[index1].list[index2].list[index3].list[index4].isCheck = false;
      this.data.mList[index1].list[index2].list[index3].list[index4].checkNumber = '';
      this.data.mList[index1].list[index2].list[index3].list[index4].receiveType = 0;
      this.setData({
        mList: this.data.mList
      })
      console.log(this.data.mList);
    } else {
      var num = this.data.mList[index1].list[index2].list[index3].list[index4].checkNumber;
      this.data.mList[index1].list[index2].list[index3].list[index4].checkNumber = parseFloat(num).toFixed(2);
      this.setData({
        mList: this.data.mList
      })
    }
  },

  isShopAllCheck: function () {
    var list = this.data.mList;
    var itemJson = [];
    for (var i = 0; i < list.length; i++) {
      for (var j = 0; j < list[i].list.length; j++) {
        for (var k = 0; k < list[i].list[j].list.length; k++) {
          if (list[i].list[j].list[k].billstatus == 1){
            for (var l = 0; l < list[i].list[j].list[k].list.length; l++){
              if (list[i].list[j].list[k].list[l].isCheck) {
                var item = {
                  id: list[i].list[j].list[k].list[l].id,
                  qty: list[i].list[j].list[k].list[l].checkNumber,
                  receiveType: list[i].list[j].list[k].list[l].receiveType,
                };
                itemJson.push(item);
              } /*else {
                this.showTips(
                  list[i].itemcategoryname1
                  + '-' + list[i].list[j].itemcategoryname2
                  + '-' + list[i].list[j].list[k].list[l].itemname
                  + '还没验收'
                );
                return false;
              }*/
            }
          }else{
            console.log('list[i].list[j].list[k].billstatus:' + list[i].list[j].list[k].billstatus)
          }
        }
      }
    }
    if(itemJson.length==0){
      this.showTips('没有要验收的商品')
      return false;
    }
    this.data.itemJson = itemJson;
    return true;
  },

  bindInput:function(e){
    this.setData({remarkValue:e.detail.value})
  },

  addMsg:function(){
    if (this.data.remarkValue.length == 0) {
      this.setData({ isShowInput: false });
    } else {
      this.setData({ isShowRemark: true, isShowInput: false });
      this.data.noteJson = { checkName: this.data.mName, ApplyText: this.data.remarkValue }
    }
  },

  deleteMsg: function () {
    this.data.noteJson = undefined;
    this.setData({ isShowRemark: false, remarkValue:'' });
  },

  bbLeftTap: function (e) {
    console.log('leftTap index=' + e.detail)
    if (e.detail == 0) {
      if (this.data.deviceId == '') {
        this.startSearchBluetooth();
      } else {
        this.disconnectBluetooth();
      }
    } else {
      this.setData({ isShowInput: true});
    }
  },

  bbMainTap: function () {
    console.log('mainTap')
    if (this.data.orderDetail.billStatus == 5) {
      if (this.isShopAllCheck()) {
        console.log(this.data.itemJson)
        this.checkOrderShop();
      }
    } else if (this.data.orderDetail.billStatus == 6) {
      this.printOrder();
    }
  },

  playVoice:function(e){
    console.log('playVoice')
    var vm = this;
    var index = e.currentTarget.dataset.index;
    if (vm.data.orderDetail.checkNote[index].isPlay) {
      vm.data.currentPlayIndex = index;
      voiceCenter.stop();
    }else{
      if (!voiceCenter.paused) {
        console.log('still playing last voice')
        voiceCenter.stop();
      }
      vm.data.currentPlayIndex = index;
      voiceCenter.src = vm.data.orderDetail.checkNote[index].ApplyVoice.src;
      voiceCenter.play();
    }
  },

  initVoice: function () {
    console.log('voiceCenter initVoice')
    var vm = this;
    voiceCenter.onPlay(() => {
      console.log('voiceCenter onPlay')
      vm.data.orderDetail.checkNote[vm.data.currentPlayIndex].isPlay = true;
      vm.setData({
        orderDetail: vm.data.orderDetail
      })
    });
    voiceCenter.onStop(() => {
      console.log('voiceCenter onStop')
      vm.data.orderDetail.checkNote[vm.data.currentPlayIndex].isPlay = false;
      vm.setData({
        orderDetail: vm.data.orderDetail
      })
    });
    voiceCenter.onEnded(() => {
      console.log('voiceCenter onEnded')
      vm.data.orderDetail.checkNote[vm.data.currentPlayIndex].isPlay = false;
      vm.setData({
        orderDetail: vm.data.orderDetail
      })
    });
    voiceCenter.onError((res) => {
      vm.data.orderDetail.checkNote[vm.data.currentPlayIndex].isPlay = false;
      vm.setData({
        orderDetail: vm.data.orderDetail
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