const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    remarksShowFlag: false,
    billStatus: '0',
    openId: '',
    orderId: '',//订单Id
    suplierId: '',
    phoneNumber: '',
    orgno: '',
    eId: '',
    orderData: null,
    showTopFlag: false,
    shopTypeFlag: [],
    shopDataFlag: [],
    shopData: [],
    storeNameChange: '',
    total: '',
    amount: '0.00',
    currentType: 0,
    mean: 1,
    itemJson: [],

    currentIndex: undefined,

    isShowComfirm: false,
    tipsText: '',
    comfirmFunction: '',

    isShowBluetooth: false,
    isConnectBluetooth: false,
    bluetoothList: [],
    currentConnBluetoothId: '',
    currentUUIDs: [],
    currentCharacteristics: [],
    currentWeight: 0,

    tipFalg: false,
    tipText: '',
    timeOutObj: null,

    autoDay: '',
    autoHour: '',

    isLoad: false,
  },
  closeRemarks: function (event) {
    this.setData({
      remarksShowFlag: false
    })
  },
  showRemarks: function (event) {
    var storename = event.currentTarget.dataset.storename;
    this.setData({
      remarksShowFlag: true,
      storeNameChange: storename
    })
    var index = parseInt(event.currentTarget.dataset.index);
    var notelist = this.data.orderData.order[index].noteList;
    this.setData({
      noteLists: notelist
    })
  },
  onPullDownRefresh:function(res){
    var vm = this;
    setTimeout(function () {
      vm.getOrderDetail();
    },500);
  },
  onLoad: function (option) {
    this.setData({
      orderId: option.id,
      suplierId: option.suplierId,
      phoneNumber: option.phone,
      person: option.person,
      suplierName: option.suplierName
    })
    console.log(option);
  },
  onReady: function () {
    wx.showLoading({
      title: '加载中',
    });
    var vm = this;
    wx.getStorage({
      key: 'userInfo',
      success: function (res) {
        vm.data.orgno = res.data.user.orgno;
        wx.getStorage({
          key: 'supplierInfo',
          success: function (res) {
            vm.data.openId = res.data.openId;
            vm.data.eId = res.data.eid;
            vm.getOrderDetail();
          }
        })
      },
    })

  },

  onHide: function () {
    this.disconnectBluetooth();
  },

  onUnload: function () {
    this.disconnectBluetooth();
    this.saveOrderCheckedData();
  },

  saveOrderCheckedData:function(){
    var vm = this;
    if (vm.data.orderData.appStatus == '1'){
      wx.getStorage({
        key: 'userCheckedData',
        success: function(res) {
          var userData = res.data;
          for (var i = 0; i < userData.length;i++){
            if (userData[i].openId==vm.data.openId){
              if (userData[i].orderList.length == 0) {
                var orderCheckData = {
                  orderId: vm.data.orderData.id,
                  shopData: vm.data.shopData,
                  checkData: vm.data.orderData.list
                };
                userData[i].orderList.push(orderCheckData);
              } else {
                for (var j = 0; j < userData[i].orderList.length; j++) {
                  if (userData[i].orderList[j].orderId == vm.data.orderData.id) {
                    userData[i].orderList[j].shopData = vm.data.shopData;
                    userData[i].orderList[j].checkData = vm.data.orderData.list;
                    break;
                  } else {
                    if (j == userData[i].orderList.length - 1) {
                      var orderCheckData = {
                        orderId: vm.data.orderData.id,
                        shopData: vm.data.shopData,
                        checkData: vm.data.orderData.list
                      };
                      userData[i].orderList.push(orderCheckData);
                      break;
                    }
                  }
                }
              }
              break;
            }else{
              if (i == userData.length-1){
                var userCheckData = {
                  openId: vm.data.openId,
                  orderList: [{
                    orderId: vm.data.orderData.id,
                    shopData: vm.data.shopData,
                    checkData: vm.data.orderData.list
                  }]
                };
                userData.push(userCheckData);
                break;
              }
            }
          }
          console.log(userData)
          wx.setStorage({
            key: 'userCheckedData',
            data: userData,
          })
        },
        fail:function(res){
          var userData = [{
            openId:vm.data.openId,
            orderList:[{
              orderId: vm.data.orderData.id,
              shopData: vm.data.shopData,
              checkData: vm.data.orderData.list
            }]
          }];
          wx.setStorage({
            key: 'userCheckedData',
            data: userData,
          })
        }
      })
    }
  },

  getOrderCheckedData:function(){
    var vm = this;
    wx.getStorage({
      key: 'userCheckedData',
      success: function (res) {
        var userData = res.data;
        for (var i = 0; i < userData.length; i++) {
          if (userData[i].openId == vm.data.openId) {
            if (userData[i].orderList.length == 0) {
              vm.getShopData();
            } else {
              for (var j = 0; j < userData[i].orderList.length; j++) {
                if (userData[i].orderList[j].orderId == vm.data.orderData.id) {
                  if (userData[i].orderList[j].shopData && userData[i].orderList[j].shopData.length > 0) {
                    var orderData = vm.data.orderData;
                    orderData.list = userData[i].orderList[j].checkData
                    vm.setData({ shopData: userData[i].orderList[j].shopData, orderData: orderData })
                    wx.stopPullDownRefresh();
                    wx.hideLoading();
                    break;
                  }
                } else {
                  if (j == userData[i].orderList.length - 1) {
                    vm.getShopData();
                  }
                }
              }
            }
            break;
          } else {
            if (i == userData.length-1) {
              vm.getShopData();
            }
          }
        }
      },
      fail:function(res){
        vm.getShopData();
      }
    })
  },

  removeOrderCheckedData: function () {
    var vm = this;
    wx.getStorage({
      key: 'userCheckedData',
      success: function (res) {
        var userData = res.data;
        for (var i = 0; i < userData.length; i++) {
          if (userData[i].openId == vm.data.openId) {
            for (var j = 0; j < userData[i].orderList.length; j++) {
              if (userData[i].orderList[j].orderId == vm.data.orderData.id) {
                userData[i].orderList.splice(j,1);
                break;
              }
            }
            break;
          }
        }
        wx.setStorage({
          key: 'userCheckedData',
          data: userData,
        })
      }
    })
  },

  getOrderDetail: function () {//获取订单详情
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'order/getOrderView', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        id: vm.data.orderId,
        billType: 0
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'get',
      success: function (res) {
        if (res.data.code == '1') {
          console.log(res);
          vm.formatData(res.data.data);
        } else {
          wx.stopPullDownRefresh();
          wx.hideLoading();
          vm.showTips(res.data.message);
        }

      }, error: function (res) {
        wx.stopPullDownRefresh();
        console.log(123);
        wx.hideLoading();
      }
    })
  },

  formatData: function (data) {
    var vm = this;
    data.aogDate = vm.format(new Date(data.aogDate));
    data.billDate = vm.format(new Date(data.billDate));
    if (data.autoDays != undefined) {
      this.setData({ autoDay: (data.autoDays / 24).toFixed(0), autoHour: data.autoDays % 24 })
    }
    for (var i = 0; i < data.list.length; i++) {
      this.data.shopData.push([]);
      if (i == 0) {
        this.data.shopTypeFlag.push(true);
      } else {
        this.data.shopTypeFlag.push(false);
      }
      this.data.shopDataFlag.push(false);
    }
    this.setData({
      orderData: data,
      shopTypeFlag: this.data.shopTypeFlag,
      shopDataFlag: this.data.shopDataFlag
    })
    if (data.appStatus == '1') {
      vm.checkBluetoothStatus();
      this.getOrderCheckedData();
    }else{
      this.getShopData();
    }

  },

  getShopData: function () {//获取商品列表
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'order/getOrderViewByCode', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        id: vm.data.orderId,
        itemCode: vm.data.orderData.list[vm.data.currentType].itemcategorycode1
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'get',
      success: function (res) {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        console.log(res);
        if (res.data.code == '1') {
          vm.shopDataFormat(res.data.data);
          vm.data.orderData.list[vm.data.currentType].list = res.data.data;
        } else {
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
        wx.stopPullDownRefresh();
        console.log(123);
        wx.hideLoading();
      }
    })
  },

  shopDataFormat: function (data) {
    this.data.shopData[this.data.currentType] = data;
    this.setData({
      shopData: this.data.shopData
    })
    var item = this.data.shopData[0]
    console.log(item);
  },

  format: function (fmt) { //author: meizz 
    var vm = this;
    var date = fmt;//当前时间  
    var month = vm.zeroFill(date.getMonth() + 1);//月  
    var day = vm.zeroFill(date.getDate());//日  
    var hour = vm.zeroFill(date.getHours());//时  
    var minute = vm.zeroFill(date.getMinutes());//分  
    var second = vm.zeroFill(date.getSeconds());//秒  

    //当前时间  
    var curTime = date.getFullYear() + "-" + month + "-" + day
      + " " + hour + ":" + minute;//+ ":" + second;

    return curTime;
  },
  /** 
 * 补零 
 */
  zeroFill: function (i) {
    if (i >= 0 && i <= 9) {
      return "0" + i;
    } else {
      return i;
    }
  },

  comfirmDialog: function (e) {//确认操作弹窗
    if (!this.data.isLoad) {
      var comfirmType = e.currentTarget.dataset.type;
      var tipsText = '';
      var comfirmFunction = '';
      if (this.data.isShowComfirm == false) {
        if (comfirmType == 'cancelOrder') {
          tipsText = '确定要取消订单吗？';
          comfirmFunction = 'cancelOrder';
        } else if (comfirmType == 'printOrder') {
          tipsText = '确定要打印吗？';
          comfirmFunction = 'printOrder';
        } else if (comfirmType == 'checkOrder') {
          tipsText = '确定要验收吗？';
          comfirmFunction = 'isOrderAllCheck';
        } else {
          tipsText = '';
          comfirmFunction = '';
        }
      }
      this.setData({ isShowComfirm: !this.data.isShowComfirm, tipsText: tipsText, comfirmFunction: comfirmFunction })
    }
  },

  checkOrder: function () {//验收订单
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'order/acceptanceCheck',
      method: 'post',
      dataType: 'json',
      data: {
        openId: vm.data.openId,
        id: vm.data.orderId,
        itemJson: vm.data.itemJson,
        subType: 1,
      },
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res.data)
        if (res.data.code == '1') {
          vm.disconnectBluetooth();
          wx.showToast({
            title: '验收成功',
          });
          vm.removeOrderCheckedData();
          vm.setData({ shopData: [] })
          vm.getOrderDetail();
        } else {
          vm.data.isLoad = false;
          vm.showTips(res.data.message);
        }
      },
      error: function (res) {
        vm.data.isLoad = false;
        wx.hideLoading();
        console.log(res.data)
      }
    })
  },

  cancelOrder: function () {//取消订单
    this.setData({
      isShowComfirm: false
    });
    this.data.isLoad = true;
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'order/cancelOrder',
      method: 'get',
      dataType: 'json',
      data: {
        openId: vm.data.openId,
        id: vm.data.orderId,
      },
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == '1') {
          wx.showToast({
            title: '取消成功',
          });
          vm.getOrderDetail();
        } else {
          vm.data.isLoad = false;
          vm.showTips(res.data.message);
        }
      },
      error: function (res) {
        vm.data.isLoad = false;
        console.log(res.data)
      }
    })
  },

  printOrder: function () {//打印订单
    this.setData({
      isShowComfirm: false
    });
    this.data.isLoad = true;
    wx.showLoading({
      title: '打印中',
    });
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/order/printOrder',
      method: 'get',
      dataType: 'json',
      data: {
        openId: vm.data.openId,
        id: vm.data.orderId,
      },
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      success: function (res) {
        console.log(res.data)
        wx.hideLoading();
        if (res.data.code == '1') {
          wx.showToast({
            title: '打印成功',
          });
        } else {
          vm.data.isLoad = false;
          vm.showTips(res.data.message)
        }
      },
      error: function (res) {
        vm.data.isLoad = false;
        console.log(res.data)
        wx.hideLoading();
      }
    })
  },

  showTop: function () {
    if (this.data.showTopFlag) {
      this.setData({
        showTopFlag: false
      })
    } else {
      this.setData({
        showTopFlag: true
      })
    }
  },

  changeShopType: function (e) {
    var index = e.currentTarget.dataset.index;
    var shopData = this.data.shopData;
    this.setData({
      currentType: index,
    });
    if (shopData[index] == undefined || shopData[index].length == 0) {
      wx.showLoading({
        title: '加载中',
      });
      this.getShopData();
    }
  },

  decodeUTF8: function (str) {
    return str.replace(/(\\u)(\w{4}|\w{2})/gi, function ($0, $1, $2) {
      return String.fromCharCode(parseInt($2, 16));
    });
  },

  callPhone: function (event) {
    var phone = this.data.phoneNumber;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  voicePlay: function (event) {
    var voice = event.currentTarget.dataset.voice;
    console.log(voice);
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = voice;
    innerAudioContext.play();
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },

  weightInput: function (event) {
    var vm = this;
    var index = event.currentTarget.dataset.index;
    if (this.data.shopData[this.data.currentType][index].number != undefined) {
      console.log(this.data.shopData[this.data.currentType][index].number.length);
      if (event.detail.value.length < this.data.shopData[this.data.currentType][index].number.length) {
        this.setData({
          currentIndex: undefined
        })
      }
    }
    var value = event.detail.value;
    if (value.charAt(0) == '.') {
      vm.setData({ shopData: vm.data.shopData });
      return
    }
    var pattern = /^(0|[1-9][0-9]*|[1-9]\d*[.]?\d{0,3}|[0][.]\d?\d?[1-9]?)$/;
    if (value != '' && !pattern.test(value)) {
      vm.setData({ shopData: vm.data.shopData });
      return
    }
    // if (value != '' && value != '0' && value.charAt(value.length - 1) != '.') {
    //   this.data.orderData.list[this.data.currentType].list[index].isCheck = event.detail.value != '';
    //   this.data.shopData[this.data.currentType][index].number = event.detail.value;
    //   this.data.shopData[this.data.currentType][index].receiveType = 0;
    //   this.setData({
    //     shopData: this.data.shopData
    //   })
    //   console.log(this.data.shopData);
    // }
    if (value != '' && value.charAt(value.length - 1) != '.') {
      this.data.orderData.list[this.data.currentType].list[index].isCheck = event.detail.value != '';
      this.data.shopData[this.data.currentType][index].number = event.detail.value;
      this.data.shopData[this.data.currentType][index].receiveType = 0;
      this.setData({
        shopData: this.data.shopData
      })
      console.log(this.data.shopData);
    }
  },

  bindFocus: function (event) {
    var vm = this;
    var index = event.currentTarget.dataset.index;
    if (this.data.isConnectBluetooth) {
      this.data.orderData.list[this.data.currentType].list[index].isCheck = true;
      // var num = parseFloat(this.formatWeight(this.getBTWeight())).toFixed(3);
      // this.data.shopData[this.data.currentType][index].number = num.substring(0, num.lastIndexOf('.') + 3);
      // this.data.shopData[this.data.currentType][index].receiveType = 1;
      // this.setData({
      //   shopData: this.data.shopData
      // })
      this.setData({ currentIndex: index });
    }
  },

  bindBlur: function (event) {
    var value = event.detail.value;
    var index = event.currentTarget.dataset.index;
    this.setData({ currentIndex: undefined });
    // if (value == '' || value == '0') {
    //   this.data.orderData.list[this.data.currentType].list[index].isCheck = false;
    //   this.data.shopData[this.data.currentType][index].number = '';
    //   this.data.shopData[this.data.currentType][index].receiveType = 0;
    //   this.setData({
    //     shopData: this.data.shopData
    //   })
    //   console.log(this.data.shopData);
    // } else if (value.charAt(value.length - 1) == '.' && value.charAt(0) == '0') {
    //   this.data.orderData.list[this.data.currentType].list[index].isCheck = false;
    //   this.data.shopData[this.data.currentType][index].number = '';
    //   this.data.shopData[this.data.currentType][index].receiveType = 0;
    //   this.setData({
    //     shopData: this.data.shopData
    //   })
    //   console.log(this.data.shopData);
    // } else if (value == '0.0' || value == '0.00') {
    //   this.data.orderData.list[this.data.currentType].list[index].isCheck = false;
    //   this.data.shopData[this.data.currentType][index].number = '';
    //   this.data.shopData[this.data.currentType][index].receiveType = 0;
    //   this.setData({
    //     shopData: this.data.shopData
    //   })
    //   console.log(this.data.shopData);
    // } else {
    //   var num = this.data.shopData[this.data.currentType][index].number;
    //   this.data.shopData[this.data.currentType][index].number = parseFloat(num).toFixed(2);
    //   this.setData({
    //     shopData: this.data.shopData
    //   })
    // }
    if (value == '') {
      this.data.orderData.list[this.data.currentType].list[index].isCheck = false;
      this.data.shopData[this.data.currentType][index].number = '';
      this.data.shopData[this.data.currentType][index].receiveType = 0;
      this.setData({
        shopData: this.data.shopData
      })
      console.log(this.data.shopData);
    } else if (value.charAt(value.length - 1) == '.' && value.charAt(0) == '0') {
      this.data.orderData.list[this.data.currentType].list[index].isCheck = false;
      this.data.shopData[this.data.currentType][index].number = '';
      this.data.shopData[this.data.currentType][index].receiveType = 0;
      this.setData({
        shopData: this.data.shopData
      })
      console.log(this.data.shopData);
    } else {
      var num = this.data.shopData[this.data.currentType][index].number;
      this.data.shopData[this.data.currentType][index].number = parseFloat(num).toFixed(2);
      this.setData({
        shopData: this.data.shopData
      })
    }
  },

  isOrderAllCheck: function () {
    var tips = '';
    var isOrderAllCheck = true;
    var list = this.data.orderData.list;
    for (var i = 0; i < list.length; i++) {
      if (list[i].list == undefined || list[i].list.length == 0) {
        isOrderAllCheck = false;
        tips = list[i].itemcategoryname1 + '还没验收呢';
        break;
      } else {
        for (var j = 0; j < list[i].list.length; j++) {
          if (list[i].list[j].isCheck == undefined || list[i].list[j].isCheck == false) {
            isOrderAllCheck = false;
            tips = list[i].itemcategoryname1 + '的' + list[i].list[j].itemName + '还没验收呢';
            break;
          }
        }
      }
    }
    if (tips != '')
      this.showTips(tips);
    this.setData({ isShowComfirm: false });
    if (isOrderAllCheck) {
      this.formatItemJson();
    }
  },

  formatItemJson: function () {
    wx.showLoading({
      title: '验收中',
    });
    this.data.isLoad = true;
    var vm = this;
    var shopData = vm.data.shopData;
    var itemList = [];
    for (var i = 0; i < shopData.length; i++) {
      for (var j = 0; j < shopData[i].length; j++) {
        var itemJson = {
          id: shopData[i][j].id,
          qty: shopData[i][j].number,
          receiveType: shopData[i][j].receiveType,
        };
        itemList.push(itemJson);
      }
    }
    console.log(itemList);
    vm.data.itemJson = itemList;
    vm.checkOrder();
  },

  closeBluetoothDialog: function () {
    this.setData({ isShowBluetooth: false })
  },

  checkBluetoothStatus: function () {
    var vm = this;
    wx.openBluetoothAdapter({
      success: function (res) {
        console.log('-----openBluetoothAdapter  success-----start1')
        console.log(res);
        console.log('-----openBluetoothAdapter  success-----end1')
        wx.startBluetoothDevicesDiscovery({
          services: [],
          success: function (res) {
            console.log('-----startBluetoothDevicesDiscovery  success-----start2')
            console.log(res);
            console.log('-----startBluetoothDevicesDiscovery  success-----end2')
            setTimeout(function () {
              vm.getDevice();
            }, 500);
          },
          interval: 0,
        });
      },
      fail: function (res) {
        console.log('-----openBluetoothAdapter  fail-----start1')
        console.log(res);
        console.log('-----openBluetoothAdapter  fail-----end1')
        if (res.errCode == 10001) {
          vm.showTips('请打开蓝牙开关');
        } else if (res.errMsg.indexOf('ble not available') != -1) {
          console.log(res);
          vm.showTips('请打开蓝牙开关');
        } else {
          console.log(res);
          vm.showTips('errCode:' + res.errCode);
        }

      }
    });
  },

  getDevice: function () {
    var vm = this;
    wx.getBluetoothDevices({
      success: function (res) {
        console.log('-----getBluetoothDevices  success-----start3')
        console.log(res);
        console.log('-----getBluetoothDevices  success-----end3')
        vm.setData({ isShowBluetooth: true, bluetoothList: res.devices });
      },
    });
  },

  connectBluetooth: function (e) {
    var vm = this;
    var deviceId = e.currentTarget.dataset.deviceid;
    wx.createBLEConnection({
      deviceId: deviceId,
      success: function (res) {
        console.log('-----createBLEConnection  success-----start4')
        console.log(res);
        console.log('-----createBLEConnection  success-----end4')
        vm.setData({ currentConnBluetoothId: deviceId });
        vm.getBluetoothService();
      },
      fail: function (res) {
        console.log(res);
      }
    })
  },

  getBluetoothService: function () {
    var vm = this;
    wx.getBLEDeviceServices({
      deviceId: vm.data.currentConnBluetoothId,
      success: function (res) {
        console.log('-----getBLEDeviceServices  success-----start5')
        console.log(res);
        console.log('-----getBLEDeviceServices  success-----end5')
        vm.setData({ currentUUIDs: res.services });
        vm.getBLEDeviceCharacteristics();
      },
      fail: function (res) {
        console.log('-----getBLEDeviceServices  fail-----start5')
        console.log(res);
        console.log('-----getBLEDeviceServices  fail-----end5')
      },
    })
  },

  getBLEDeviceCharacteristics: function () {
    var vm = this;
    wx.getBLEDeviceCharacteristics({
      deviceId: vm.data.currentConnBluetoothId,
      serviceId: vm.data.currentUUIDs[0].uuid,
      success: function (res) {
        console.log('-----getBLEDeviceCharacteristics  success-----start6')
        console.log(res);
        console.log('-----getBLEDeviceCharacteristics  success-----end6')
        vm.setData({ currentCharacteristics: res.characteristics });
        wx.notifyBLECharacteristicValueChange({
          deviceId: vm.data.currentConnBluetoothId,
          serviceId: vm.data.currentUUIDs[0].uuid,
          characteristicId: vm.data.currentCharacteristics[0].uuid,
          state: true,
          success: function (res) {
            console.log('-----notifyBLECharacteristicValueChange  success-----start7')
            console.log(res);
            console.log('-----notifyBLECharacteristicValueChange  success-----end7')
            vm.getBluetoothData();
          },
          fail: function (res) {
            console.log('-----notifyBLECharacteristicValueChange  fail-----start7')
            console.log(res);
            console.log('-----notifyBLECharacteristicValueChange  fail-----end7')
          },
        })
      },
    })
  },

  getBluetoothData: function () {
    console.log('开始接收蓝牙秤数据');
    var vm = this;
    vm.setData({ isConnectBluetooth: true, isShowBluetooth: false });
    wx.onBLECharacteristicValueChange(function (res) {
      vm.data.currentBluetoothWeight = vm.hexCharCodeToStr(vm.abhext(res.value));
      if (vm.data.currentIndex != undefined) {
        var num = parseFloat(vm.formatWeight(vm.hexCharCodeToStr(vm.abhext(res.value)))).toFixed(2);

        vm.data.shopData[vm.data.currentType][vm.data.currentIndex].number = num;
        vm.data.shopData[vm.data.currentType][vm.data.currentIndex].receiveType = 1;
        vm.setData({ shopData: vm.data.shopData });
      }
    })
  },

  getBTWeight: function () {
    return this.data.currentBluetoothWeight;
  },

  // 16进度字符串转字符串示例
  hexCharCodeToStr: function (hexCharCodeStr) {
    var trimedStr = hexCharCodeStr.trim();
    var rawStr =
      trimedStr.substr(0, 2).toLowerCase() === "0x"
        ?
        trimedStr.substr(2)
        :
        trimedStr;
    var len = rawStr.length;
    if (len % 2 !== 0) {
      console.log("Illegal Format ASCII Code!");
      return "";
    }
    var curCharCode;
    var resultStr = [];
    for (var i = 0; i < len; i = i + 2) {
      curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
      resultStr.push(String.fromCharCode(curCharCode));
    }
    return resultStr.join("");
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

  // ArrayBuffer转16进度字符串示例
  abhext: function (buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function (bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('');
  },

  disconnectBluetooth: function () {
    var vm = this;
    wx.closeBLEConnection({
      deviceId: vm.data.currentConnBluetoothId,
      success: function (res) {
        console.log('closeBLEConnection~~~~~~')
      },
    })
    wx.closeBluetoothAdapter({
      success: function (res) {
        console.log('closeBluetoothAdapter~~~~~~')
      },
    })
    vm.setData({
      isConnectBluetooth: false,
      bluetoothList: [],
      currentConnBluetoothId: '',
      currentUUIDs: [],
      currentCharacteristics: [],
      currentWeight: 0,
    });
  },

  controlBluetooth: function () {
    if (this.data.isConnectBluetooth) {
      this.disconnectBluetooth();
    } else {
      this.checkBluetoothStatus();
    }
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
  },
})