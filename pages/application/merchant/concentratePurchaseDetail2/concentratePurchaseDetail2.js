// pages/application/merchant/concentratePurchaseDetail2/concentratePurchaseDetail2.js
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
    openId: '',
    eId: '',
    orgno: '',

    orderDetail: null,
    expand: true,
    bbLeftBtns: [{ name: '连接蓝牙', pic: 'ljlywlj@3x' }],

    deviceId: '',
    bluetoothData: '',
    currentIndex: null,
    mList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ id: options.id });
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
    this.bluetoothDialog = this.selectComponent('#bluetoothDialog');
    this.bottomBtn = this.selectComponent('#bottomBtn');
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

  expand: function () {
    this.setData({ expand: !this.data.expand })
  },

  getOrderDetail: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'order/getOrderViewAPP',
      method: 'get',
      dataType: 'json',
      data: {
        openId: vm.data.openId,
        id: vm.data.id
      },
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == '1') {
          vm.setData({ orderDetail: vm.formatData(res.data.data), mList: res.data.data.list });
          if (res.data.data.billstatus == 1) {
            vm.startSearchBluetooth();
          }
        }
        else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        console.log(res);
        wx.hideLoading();
        vm.showTips('请求失败')
      }
    })
  },

  showTips: function (msg) {
    this.errorTips.showTips(msg);
  },

  formatData: function (data) {
    data.aogDate = wechatUtil.formatTime(new Date(data.aogDate))
    data.createTime = wechatUtil.formatTime(new Date(data.createTime))
    for (var i = 0; i < data.list.length; i++) {
      data.list[i].expand = false;
      for (var j = 0; j < data.list[i].list.length; j++) {
        data.list[i].list[j].expand = false;
      }
    }
    if (data.autoDays != undefined) {
      data.autoDay = (data.autoDays / 24).toString().split('.')[0];
      data.autoHour = data.autoDays % 24
    }
    if (data.voiceNote != undefined) {
      data.voiceNote = JSON.parse(data.voiceNote);
    }
    return data;
  },

  expandItem: function (e) {
    var list = this.data.mList;
    var i = e.currentTarget.dataset.i;
    var j = e.currentTarget.dataset.j;
    if (j == undefined) {
      list[i].expand = !list[i].expand;
    } else {
      list[i].list[j].expand = !list[i].list[j].expand;
    }
    this.setData({ mList: list })
  },

  printOrder: function () {
    var vm = this;
    if (!vm.data.mList[0].id){
      vm.showTips('获取订单号错误，打印失败');
      return;
    }
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/request/printReq',
      method: 'post',
      data: {
        id: vm.data.mList[0].id,
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
        vm.showTips(res.data.message);
      },
      fail: function (res) {
        wx.hideLoading();
        vm.showTips('请求失败');
        console.log(res);
      }
    })
  },

  checkOrderShop:function(id){
    wx.showLoading({
      title: '验收中',
      mask: true,
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/purchasereq/reqAcceptance',
      method: 'post',
      data: {
        reqId: id,
        openId: vm.data.openId,
        itemJson: vm.data.itemJson,
        subType: 1,
        biztype: 0,
        suplierId: vm.data.orderDetail.supplierId,
        suplierName: vm.data.orderDetail.titleName,
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
    if (this.data.orderDetail.billstatus == 1) {
      bluetoothUtil.disconnectBluetooth(this.data.deviceId);
      this.bluetoothDialog.clear();
      this.data.deviceId = '';
      var bottom = [{ name: '连接蓝牙', pic: 'ljlywlj@3x' }];
      this.bottomBtn.initData(bottom, '打印');
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
        var bottom = [{ name: '断开蓝牙', pic: 'ljlyylj@3x', color: true }];
        vm.bottomBtn.initData(bottom, '打印');
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
      function (res) {
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
      this.setData({ currentIndex: [index1, index2, index3, index4] });
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
          for (var l = 0; l < list[i].list[j].list[k].list.length; l++) {
            if (list[i].list[j].list[k].list[l].isCheck) {
              var item = {
                id: list[i].list[j].list[k].list[l].id,
                qty: list[i].list[j].list[k].list[l].checkNumber,
                receiveType: list[i].list[j].list[k].list[l].receiveType,
              };
              itemJson.push(item);
            } else {
              this.showTips(
                list[i].list[j].itemcategoryname1
                + '-' + list[i].list[j].list[k].itemcategoryname2
                + '-' + list[i].list[j].list[k].list[l].itemname
                + '还没验收'
              );
              return false;
            }
          }
        }
      }
    }
    if (itemJson.length == 0) {
      this.showTips('没有要验收的商品')
      return false;
    }
    this.data.itemJson = itemJson;
    return true;
  },

  bbLeftTap: function (e) {
    console.log('leftTap index=' + e.detail)
    if (this.data.deviceId == '') {
      this.startSearchBluetooth();
    } else {
      this.disconnectBluetooth();
    }
  },

  bbMainTap: function () {
    console.log('mainTap')
    if (this.data.orderDetail.billstatus == 1) {
      this.printOrder();
    }
  },

  checkTap: function (e) {
    if (this.isShopAllCheck()) {
      console.log(this.data.itemJson)
      this.checkOrderShop(e.currentTarget.dataset.id);
    }

  },

  playVoice: function () {
    console.log('playVoice')
    var vm = this;
    if (vm.data.isPlay) {
      voiceCenter.stop();
    } else {
      voiceCenter.src = vm.data.orderDetail.voiceNote.src;
      voiceCenter.play();
    }
  },

  initVoice: function () {
    console.log('voiceCenter initVoice')
    var vm = this;
    voiceCenter.onPlay(() => {
      console.log('voiceCenter onPlay')
      vm.setData({
        isPlay: true
      })
    });
    voiceCenter.onStop(() => {
      console.log('voiceCenter onStop')
      vm.setData({
        isPlay: false
      })
    });
    voiceCenter.onEnded(() => {
      console.log('voiceCenter onEnded')
      vm.setData({
        isPlay: false
      })
    });
    voiceCenter.onError((res) => {
      vm.setData({
        isPlay: false
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