// pages/application/merchant/transfersDetail/transfersDetail.js
const app = getApp();
var wechatUtil = require('../../../../utils/util.js');
var bluetoothUtil = require('../../../../utils/bluetoothUtil.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: '',
    taskId:'',
    purchaseType:'',
    fromApproval: false,
    mTab: 0,
    expand: true,
    orderDetail: null,
    mList: [],
    msgList: [],
    inputValue: '',
    mName: '',

    leftBtnList: [{ name: '连接蓝牙', pic: 'ljlywlj@3x' }, { name: '添加备注', pic: 'spglxg@2x' }],

    deviceId:'',
    bluetoothData:'',
    currentIndex: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ id: options.id, fromApproval: options.source == 'approval', taskId: options.taskId, purchaseType: options.purchaseType })
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
    var vm = this;
    this.errorTips = this.selectComponent('#errorTips');
    this.bottomBtn = this.selectComponent('#bottomBtn');
    this.editDialog = this.selectComponent('#editDialog');
    this.bluetoothDialog = this.selectComponent('#bluetoothDialog');
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.mName = res.data.name;
        wx.getStorage({
          key: 'userInfo',
          success: function (res) {
            vm.data.orgno = res.data.user.orgno;
            vm.data.organizationid = res.data.user.organizationid;
            vm.getOrderDetail();
            vm.getOrderList();
            vm.getOrderFlow();
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
          if (res.data.data.billStatus == '5') {
            vm.startSearchBluetooth();
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
        if (res.data.code == '1') {
          vm.setData({ mList: res.data.data });
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

  getOrderFlow: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/purchasereq/getProcessAssistant',
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
        if (res.data.code == '1') {
          vm.setData({ msgList: vm.formatData2(res.data.data) });
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

  printOrder: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/request/printReqDetail',
      method: 'post',
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
        vm.showTips(res.data.message);
      },
      fail: function (res) {
        vm.showTips('请求失败');
        console.log(res);
      }
    })
  },

  sumbitRemark: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/purchasereq/addMessage',
      method: 'post',
      data: {
        reqId: vm.data.id,
        openId: vm.data.openId,
        txtNoteApply: vm.data.inputValue
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
          vm.getOrderFlow();
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

  checkOrderShop: function () {
    wx.showLoading({
      title: '验收中',
      mask: true,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/purchasereq/reqAcceptance',
      method: 'post',
      data: {
        reqId: vm.data.id,
        openId: vm.data.openId,
        itemJson: vm.data.itemJson,
        subType: 1,
        biztype: 3,
        txtNoteApply: vm.data.inputValue
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
          vm.getOrderList();
          vm.getOrderFlow();
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

  changeTab: function (e) {
    var tab = e.currentTarget.dataset.tab;
    this.setData({ mTab: tab })
  },

  expand: function () {
    this.setData({ expand: !this.data.expand })
  },

  expandItem: function (e) {
    var itemType = e.currentTarget.dataset.type;
    var firstIndex = e.currentTarget.dataset.first;
    var secondIndex = e.currentTarget.dataset.second;
    if (itemType == 'shop') {
      var list = this.data.mList;
      list[firstIndex].expand = list[firstIndex].expand == undefined ? false : !list[firstIndex].expand;
      this.setData({ mList: list });
    }
  },

  formatData: function (data) {
    data.billDate = wechatUtil.formatTime(new Date(data.billDate))
    return data;
  },

  formatData2: function (data) {
    for (var i = 0; i < data.length; i++) {
      if (data[i].createTime != undefined)
        data[i].createTime = wechatUtil.formatTime(new Date(data[i].createTime))
    }
    return data;
  },

  bindInput: function (e) {
    this.setData({ inputValue: e.detail.value });
  },

  existUnsumbit: function () {
    var list = this.data.msgList;
    for (var i = 0; i < list.length; i++) {
      if (list[i].sumbitAble)
        return true;
    }
  },

  addMsg: function () {
    if (this.data.inputValue == '')
      return;
    if (this.existUnsumbit())
      return;
    var msg = { assigneeName: this.data.mName, txtNoteApply: this.data.inputValue, sumbitAble: true };
    var list = this.data.msgList;
    list.unshift(msg);
    this.setData({ msgList: list });
  },

  deleteMsg: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.msgList;
    list.splice(index, 1);
    this.setData({ msgList: list, inputValue:'' })
  },

  sumbitMsg: function (e) {
    var index = e.currentTarget.dataset.index;
    this.sumbitRemark();
  },

  leftTap: function (e) {
    console.log('leftTap index=' + e.detail)
    if(e.detail==0){
      if (this.data.deviceId == '') {
        this.startSearchBluetooth();
      }else{
        this.disconnectBluetooth();
      }
    }else{
      this.setData({mTab:1})
    }
  },

  mainTap: function () {
    console.log('mainTap')
    if(this.data.orderDetail.billStatus==5){
      if(this.isShopAllCheck()){
        console.log(this.data.itemJson)
        this.checkOrderShop();
      }
    }else if(this.data.orderDetail.billStatus==6){
      this.printOrder();
    }
  },

  bluetoothItemTap:function(e){
    wx.showLoading({
      title: '连接中',
      mask: true,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
    var vm = this;
    var deviceid = e.detail;
    console.log('deviceid='+deviceid);
    bluetoothUtil.onStepConnDeviceAndGetMsg(
      deviceid,
      function (res) {
        vm.bluetoothDialog.initConned(res);
        vm.data.deviceId = res;
        var bottom = [{ name: '断开蓝牙', pic: 'ljlyylj@3x', color: true }, { name: '添加备注', pic: 'spglxg@2x' }];
        vm.bottomBtn.initData(bottom, '验收');
      },
      function (res) {
        vm.showTips('连接失败')
        wx.hideLoading();
      },
      function(res){
        vm.data.bluetoothData = res;
        if (vm.data.currentIndex != null) {
          var num = parseFloat(vm.formatWeight(res)).toFixed(2);
          vm.data.mList[vm.data.currentIndex[0]].list[vm.data.currentIndex[1]].list[vm.data.currentIndex[2]].number = num;
          vm.data.mList[vm.data.currentIndex[0]].list[vm.data.currentIndex[1]].list[vm.data.currentIndex[2]].receiveType = 1;
          vm.setData({ mList: vm.data.mList });
        }
        wx.hideLoading();
      },
      function (res) {
        console.log(res);
        vm.showTips('获取蓝牙设备服务失败');
      }
    )
  },

  startSearchBluetooth: function() {
    wx.showLoading({
      title: '搜索中',
      mask: true,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
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

  weightInput:function(e){
    var index1 = e.currentTarget.dataset.findex;
    var index2 = e.currentTarget.dataset.sindex;
    var index3 = e.currentTarget.dataset.tindex;


    var vm = this;
    if (this.data.mList[index1].list[index2].list[index3].number != undefined) {
      console.log(this.data.mList[index1].list[index2].list[index3].number.length);
      if (e.detail.value.length < this.data.mList[index1].list[index2].list[index3].number.length) {
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
      this.data.mList[index1].list[index2].list[index3].isCheck = e.detail.value != '';
      this.data.mList[index1].list[index2].list[index3].number = e.detail.value;
      this.data.mList[index1].list[index2].list[index3].receiveType = 0;
      this.setData({
        mList: this.data.mList
      })
      console.log(this.data.mList);
    }
  },

  weightFocus: function (e) {
    var index1 = e.currentTarget.dataset.findex;
    var index2 = e.currentTarget.dataset.sindex;
    var index3 = e.currentTarget.dataset.tindex;
    var vm = this;
    if (this.data.deviceId!='') {
      this.data.mList[index1].list[index2].list[index3].isCheck = true;
      this.setData({ currentIndex: [index1,index2,index3] });
    }
  },

  weightBlur: function (e) {
    var value = e.detail.value;
    var index1 = e.currentTarget.dataset.findex;
    var index2 = e.currentTarget.dataset.sindex;
    var index3 = e.currentTarget.dataset.tindex;

    this.setData({ currentIndex: null });

    if (value == '') {
      this.data.mList[index1].list[index2].list[index3].isCheck = false;
      this.data.mList[index1].list[index2].list[index3].number = '';
      this.mList[index1].list[index2].list[index3].receiveType = 0;
      this.setData({
        mList: this.data.mList
      })
      console.log(this.data.mList);
    } else if (value.charAt(value.length - 1) == '.' && value.charAt(0) == '0') {
      this.data.mList[index1].list[index2].list[index3].isCheck = false;
      this.data.mList[index1].list[index2].list[index3].number = '';
      this.data.mList[index1].list[index2].list[index3].receiveType = 0;
      this.setData({
        mList: this.data.mList
      })
      console.log(this.data.mList);
    } else {
      var num = this.data.mList[index1].list[index2].list[index3].number;
      this.data.mList[index1].list[index2].list[index3].number = parseFloat(num).toFixed(2);
      this.setData({
        mList: this.data.mList
      })
    }
  },

  isShopAllCheck:function(){
    var list = this.data.mList;
    var itemJson = [];
    for(var i = 0;i<list.length;i++){
      for(var j = 0;j<list[i].list.length;j++){
        for(var k = 0;k<list[i].list[j].list.length;k++){
          if (list[i].list[j].list[k].isCheck) {
            var item = {
              id: list[i].list[j].list[k].id,
              qty: list[i].list[j].list[k].number,
              receiveType: list[i].list[j].list[k].receiveType,
            };
            itemJson.push(item);
          } else {
            this.showTips(
              list[i].itemcategoryname1
              + '-' + list[i].list[j].itemcategoryname2
              + '-' + list[i].list[j].list[k].itemname
              + '还没验收'
            );
            return false;
          }
        }
      }
    }
    this.data.itemJson = itemJson;
    return true;
  },

  ynTap: function (e) {
    var data = null;

    this.data.approalType = e.detail == 'yes'?1:2;
    if (e.detail == 'yes') {
      data = { title: '审核意见', hintText: '选填/请在此输入审核意见', RightBtnText: '审核' }
    } else if (e.detail == 'no') {
      data = { title: '退回原因', hintText: '必填/请在此输入退回原因', RightBtnText: '退回' }
    }
    this.editDialog.init(data);
    this.editDialog.show();
  },

  editDialogLeftTap:function(){},

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
          vm.getOrderList();
          vm.getOrderFlow();
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
})