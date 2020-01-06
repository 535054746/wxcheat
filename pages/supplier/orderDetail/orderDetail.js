const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    remarksShowFlag: false,
    billStatus:'',
    openId: '',
    orgno: '',
    orderId: '',
    appStatus:'',
    createTime: '',
    aogDate:'',
    ordercode: '',
    storeName: '',
    createUserName:'',
    total: '',
    totalAmount: '',
    remarks: '',
    eId: '',
    orderData: [],
    shopDataFlag: [],
    shopData: [],
    shopTypeFlag: [],
    currentType:0,
    cancelTipFlag:false,
    shipTipFlag:false,
    notTipFlag:false,
    sureTipFlag:false,
    loading: false,
    isShowBluetooth: false,
    isConnectBluetooth: false,
    bluetoothList: [],
    currentConnBluetoothId: '',
    tipFalg: false,
    tipText: '',
    timeOutObj: null,
    autoDay:'',
    autoHour:'',
    phoneNumber:'',
    currentIndex: undefined,
    pageBgFlag:true
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
  onLoad: function (option) {
    this.setData({
      orderId: option.id
    })
  },
  onHide: function () {
    this.disconnectBluetooth();
  },

  onUnload: function () {
    this.disconnectBluetooth();
  },
  onReady: function () {
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.orgno = res.data.orgno,
        vm.getOrderDetail();
      }
    })

  },
  getOrderDetail: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'order/getOrderView', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        id: vm.data.orderId,
        billType:''
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'get',
      success: function (res) {
        console.log(res);
        if (res.data.code == '1') {
          vm.formatData(res.data.data);
          vm.setData({
            pageBgFlag:false
          })
        } else {
          vm.showTips(res.data.message);
        }

      }, error: function (res) {
      }
    })
  },
  formatData: function (data) {
    var vm = this;
    data.billDate = vm.format(new Date(data.billDate));
    data.aogDate = vm.format(new Date(data.aogDate));
    if (data.autoDays != undefined) {
      this.setData({ autoDay: (data.autoDays / 24).toFixed(0), autoHour: data.autoDays % 24 })
    }
    if (data.createTime){
      data.createTime = vm.format(new Date(data.createTime));
    }else{
      data.createTime = '';
    }
    vm.setData({
      phoneNumber: data.phone,
      orderData: data.list,
      appStatus: data.appStatus,
      createTime: data.createTime,
      aogDate: data.aogDate,
      ordercode: data.number,
      storeName: data.storeName,
      createUserName: data.createUserName,
      remarks: data.remarks,
      total: data.total,
      totalAmount: data.totalAmount,
      autoDays: data.autoDays
    });
    for (var i = 0; i < data.list.length;i++){
      this.data.shopData.push([]);
      if(i==0){
        this.data.shopTypeFlag.push(true);
      }else{
        this.data.shopTypeFlag.push(false);
      }
      this.data.shopDataFlag.push(false);
    }
    this.setData({
      shopTypeFlag: this.data.shopTypeFlag,
      shopDataFlag: this.data.shopDataFlag
    })
    this.getShopData();
  },
  getShopData:function(){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'order/getOrderViewByCode', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId, 
        id: vm.data.orderId,
        itemCode: vm.data.orderData[vm.data.currentType].itemcategorycode1
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'get',
      success: function (res) {
        console.log(res);
        if (res.data.code == '1') {
          vm.shopDataFormat(res.data.data);
        } else {
          vm.showTips(res.data.message);
        }

      }, error: function (res) {
      }
    })
  },
  shopDataFormat:function(data){
    this.data.shopData[this.data.currentType]=data;
    this.setData({
      shopData: this.data.shopData
    })
    var item=this.data.shopData[0]
    console.log(item);
  },
  changeShopType: function (event) {
    var vm=this;
    setTimeout(function(){
      var index = parseInt(event.currentTarget.dataset.index);
      for (var i = 0; i < vm.data.shopTypeFlag.length; i++) {
        vm.data.shopTypeFlag[i] = false;
      }
      vm.data.shopTypeFlag[index] = true;
      vm.setData({
        shopTypeFlag: vm.data.shopTypeFlag,
        currentType: index
      })
      console.log(vm.data.shopData[index].length > 0);
      if (vm.data.shopData[index].length == 0) {
        vm.getShopData();
      }
    },150)
    
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
  lookQuality: function (event) {
    var performanceid = event.currentTarget.dataset.performanceid;
    var storeid = event.currentTarget.dataset.storeid;
    wx.navigateTo({
      url: '../qualityRecord/qualityRecord?performanceId=' + performanceid + "&storeid=" + storeid
    })
  },
  dataFormat: function (data) {
    var orderData2 = [];
    var orderDataFlag = [];
    for (var i = 0; i < data.length; i++) {
      for (var h = 0; h < data[i].details.length; h++) {
        data[i].details[h].amount = common.toDecimal2(data[i].details[h].amount)
      }
      orderData2 = orderData2.concat(data[i].details);
      orderDataFlag.push(false);
    }
    this.setData({
      orderData2: orderData2,
      orderDataFlag: orderDataFlag
    });
  },
  dataShowFlag: function (data) {
    var orderDataFlag = [];
    for (var i = 0; i < data.length; i++) {
      data[i].amount = common.toDecimal2(data[i].amount);
      for (var h = 0; h < data[i].categories.length; h++) {
        for (var f = 0; f < data[i].categories[h].details.length; f++) {
          data[i].categories[h].details[f].amount = common.toDecimal2(data[i].categories[h].details[f].amount);
        }
      }
      orderDataFlag.push(false);
    }
    this.setData({
      orderDataFlag: orderDataFlag,
      orderData: data
    });
  },
  decodeUTF8: function (str) {
    return str.replace(/(\\u)(\w{4}|\w{2})/gi, function ($0, $1, $2) {
      return String.fromCharCode(parseInt($2, 16));
    });
  },
  callPhone: function (event) {
    var phone = event.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
 
  weightInput: function (event) {
    var index = event.currentTarget.dataset.index;
    
    this.setData({ currentIndex: undefined });
    if (event.detail.value.length == 0 || event.detail.value.length == '.'){
      return;
    }
    var num = parseFloat(event.detail.value).toFixed(3);
    this.data.shopData[this.data.currentType][index].number = num.substring(0, num.lastIndexOf('.') + 3);
    this.setData({
      shopData: this.data.shopData
    })
    console.log(this.data.shopData);
  },
  weightHandInput: function (event) {
    var index = event.currentTarget.dataset.index;
    if (this.data.shopData[this.data.currentType][index].number != undefined) {
      console.log(this.data.shopData[this.data.currentType][index].number.length);
      if (event.detail.value.length < this.data.shopData[this.data.currentType][index].number.length) {
        this.setData({
          currentIndex: undefined
        })
      }
    }
    this.data.shopData[this.data.currentType][index].receiveType = false;
  },
  shipOrder:function(data){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'order/orderDelivery', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        idList: [vm.data.orderId]
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        if (res.data.code == '1') {
          wx.setStorage({
            key: 'currentTab',
            data: {
              statu: 1
            }
          })
          wx.navigateBack({
            delta: 1
          })
        }else{
          vm.showTips(res.data.message);
        }

      }, error: function (res) {
        vm.showTips("系统异常");
      }
    })
  },
  formatSaveData:function(){
    this.cancelTip();
    /*var flag=true;
    var itemJson = [];
    for (var i = 0; i < this.data.shopData.length;i++){
      if (this.data.shopData[i].length==0){
        flag=false;
      }
      for (var h = 0; h < this.data.shopData[i].length; h++) {
        if (this.data.shopData[i][h].number){
          var item={};
          item.id = this.data.shopData[i][h].id;
          item.qty = this.data.shopData[i][h].number;
          itemJson.push(item);
        }else{
          flag = false;
        }
        
      }
    }
    if (flag){
      this.shipOrder(itemJson);
    }else{
      this.setData({
        notTipFlag: true
      })
    }*/
    this.shipOrder();
  },
  cancelShowTip:function(){
    this.setData({
      cancelTipFlag:true
    })
  },
  shipShowTip: function () {
    this.setData({
      shipTipFlag: true
    })
  },
  cancelTip: function () {
    this.setData({
      cancelTipFlag: false,
      shipTipFlag: false,
      sureTipFlag:false,
      notTipFlag:false
    })
  },
  cancelOrder: function (data) {
    var vm = this;
    var url = app.globalData.url;
    vm.cancelTip();
    this.setData({
      loading: true
    })
    wx.request({
      url: url + 'order/cancelOrder', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        id: vm.data.orderId,
        appstatus: '9'
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'get',
      success: function (res) {
        console.log(res);
        if (res.data.code == '1') {
          //vm.shopDataFormat(res.data.data);
          vm.setData({
            loading: false
          })
          wx.setStorage({
            key: 'currentTab',
            data: {
              statu: ''
            }
          })
          wx.navigateBack({
            delta: 1
          })
        }

      }, error: function (res) {
      }
    })
  },
  sureOrder: function (data) {
    var vm = this;
    var url = app.globalData.url;
    vm.cancelTip();
    this.setData({
      loading: true
    })
    wx.request({
      url: url + 'order/confirmOrder', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        id: vm.data.orderId
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'get',
      success: function (res) {
        console.log(res);
        if (res.data.code == '1') {
          vm.setData({
            loading: false
          })
          wx.setStorage({
            key: 'currentTab',
            data: {
              statu:3
            }
          })
          wx.navigateBack({
            delta:1
          })
        }

      }, error: function (res) {
      }
    })
  },
  shipSureTip: function () {
    this.setData({
      sureTipFlag: true
    })
  },
  decodeUTF8: function (str) {
    return str.replace(/(\\u)(\w{4}|\w{2})/gi, function ($0, $1, $2) {
      return String.fromCharCode(parseInt($2, 16));
    });
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
        var num = parseFloat(vm.formatWeight(vm.hexCharCodeToStr(vm.abhext(res.value)))).toFixed(3);

        vm.data.shopData[vm.data.currentType][vm.data.currentIndex].number = num.substring(0, num.lastIndexOf('.') + 3);
        vm.data.shopData[vm.data.currentType][vm.data.currentIndex].receiveType = true;
        vm.setData({
          shopData: vm.data.shopData
        })
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
        this.showTips('请设置蓝牙秤单位为kg')
      }
    } else {
      this.showTips('数据为负数，请检查设备')
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
  bindFocus: function (event) {
    var index = event.currentTarget.dataset.index;
    console.log(this.data.isConnectBluetooth);
    if (this.data.isConnectBluetooth) {
      /*var index = event.currentTarget.dataset.index;
      var num = parseFloat(this.formatWeight(this.getBTWeight())).toFixed(3);
      this.data.shopData[this.data.currentType][index].number = num.substring(0, num.lastIndexOf('.') + 3);
      this.data.shopData[this.data.currentType][index].receiveType = true;
      this.setData({
        shopData: this.data.shopData
      })*/
      this.setData({ currentIndex: index });
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
  }
})