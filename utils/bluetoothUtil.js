function checkBluetoothStatus(callBackSuccess,callBackFail) {
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
          typeof callBackSuccess == 'function' && callBackSuccess(res);
        },
        interval: 0,
      });
    },
    fail: function (res) {
      console.log('-----openBluetoothAdapter  fail-----start1')
      console.log(res);
      console.log('-----openBluetoothAdapter  fail-----end1')
      typeof callBackFail == 'function' && callBackFail(res);
    }
  });
}

function getDevice(callBack) {
  var vm = this;
  wx.getBluetoothDevices({
    success: function (res) {
      console.log('-----getBluetoothDevices  success-----start3')
      console.log(res);
      console.log('-----getBluetoothDevices  success-----end3')
      typeof callBack == 'function' && callBack(res);
    },
  });
}

function connectBluetooth(deviceId, callBackSuccess, callBackFail) {
  var vm = this;
  wx.createBLEConnection({
    deviceId: deviceId,
    success: function (res) {
      console.log('-----createBLEConnection  success-----start4')
      console.log(res);
      console.log('-----createBLEConnection  success-----end4')
      typeof callBackSuccess == 'function' && callBackSuccess(res);
    },
    fail: function (res) {
      console.log(res);
      typeof callBackFail == 'function' && callBackFail(res);
    }
  })
}

function disconnectBluetooth(deviceId){
  wx.closeBLEConnection({
    deviceId: deviceId,
    success: function (res) {
      console.log('closeBLEConnection~~~~~~')
    },
  })
  wx.closeBluetoothAdapter({
    success: function (res) {
      console.log('closeBluetoothAdapter~~~~~~')
    },
  })
}

function getBluetoothService(deviceId, callBackSuccess, callBackFail) {
  var vm = this;
  wx.getBLEDeviceServices({
    deviceId: deviceId,
    success: function (res) {
      console.log('-----getBLEDeviceServices  success-----start5')
      console.log(res);
      console.log('-----getBLEDeviceServices  success-----end5')
      typeof callBackSuccess == 'function' && callBackSuccess(res);
    },
    fail: function (res) {
      console.log('-----getBLEDeviceServices  fail-----start5')
      console.log(res);
      console.log('-----getBLEDeviceServices  fail-----end5')
      typeof callBackFail == 'function' && callBackFail(res);
    },
  })
}

function getBLEDeviceCharacteristics(deviceId, serviceId, callBackSuccess, callBackFail) {
  var vm = this;
  wx.getBLEDeviceCharacteristics({
    deviceId: deviceId,
    serviceId: serviceId,
    success: function (res) {
      console.log('-----getBLEDeviceCharacteristics  success-----start6')
      console.log(res);
      console.log('-----getBLEDeviceCharacteristics  success-----end6')
      typeof callBackSuccess == 'function' && callBackSuccess(res);
    },
    fail: function (res) {
      console.log('-----getBLEDeviceCharacteristics  fail-----start6')
      console.log(res);
      console.log('-----getBLEDeviceCharacteristics  fail-----end6')
      typeof callBackFail == 'function' && callBackFail(res);
    }
  })
}

function getNotifyBLECharacteristicValueChange(deviceId, serviceId, characteristicId, callBackSuccess, callBackFail) {
  wx.notifyBLECharacteristicValueChange({
    deviceId: deviceId,
    serviceId: serviceId,
    characteristicId: characteristicId,
    state: true,
    success: function (res) {
      console.log('-----notifyBLECharacteristicValueChange  success-----start7')
      console.log(res);
      console.log('-----notifyBLECharacteristicValueChange  success-----end7')
      typeof callBackSuccess == 'function' && callBackSuccess(res);
    },
    fail: function (res) {
      console.log('-----notifyBLECharacteristicValueChange  fail-----start7')
      console.log(res);
      console.log('-----notifyBLECharacteristicValueChange  fail-----end7')
      typeof callBackFail == 'function' && callBackFail(res);
    },
  })
}

function getBluetoothData(callBack) {
  console.log('开始接收蓝牙秤数据');
  wx.onBLECharacteristicValueChange(function (res) {
    typeof callBack == 'function' && callBack(res);    
  });
}

function onStepGetDeviceList(callBackSuccess, callBackFail){
  checkBluetoothStatus(
    function (res) {
      setTimeout(function(){
        getDevice(function (res) {
          typeof callBackSuccess == 'function' && callBackSuccess(res);
        });
      },500);
    },
    function (res) {
      var errorMsg = '';
      if (res.errCode == 10001) {
        errorMsg='请打开蓝牙开关';
      } else if (res.errMsg.indexOf('ble not available') != -1) {
        console.log(res);
        errorMsg = '请打开蓝牙开关';
      } else {
        console.log(res);
        errorMsg = 'errCode:' + res.errCode
      }
      typeof callBackFail == 'function' && callBackFail(errorMsg);    
    }
  )
}

function onStepConnDeviceAndGetMsg(deviceId, connectSuccess, connectFail, callBackSuccess, callBackFail){
  connectBluetooth(deviceId, function (res1) {
    typeof connectSuccess == 'function' && connectSuccess(deviceId);
    getBluetoothService(deviceId,function(res2){
      getBLEDeviceCharacteristics(deviceId, res2.services[0].uuid,function(res3){
        getNotifyBLECharacteristicValueChange(deviceId, res2.services[0].uuid, res3.characteristics[0].uuid,function(res4){
          getBluetoothData(function (res5) {
            typeof callBackSuccess == 'function' && callBackSuccess(hexCharCodeToStr(abhext(res5.value)));
          });
        }, callBackFail);
      }, callBackFail);
    }, callBackFail);
  }, connectFail);
}



// ArrayBuffer转16进度字符串示例
function abhext(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

function hexCharCodeToStr(hexCharCodeStr) {
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
}

module.exports = {
  checkBluetoothStatus: checkBluetoothStatus,
  getDevice: getDevice,
  connectBluetooth: connectBluetooth,
  disconnectBluetooth: disconnectBluetooth,
  getBluetoothService: getBluetoothService,
  getBLEDeviceCharacteristics: getBLEDeviceCharacteristics,
  getNotifyBLECharacteristicValueChange: getNotifyBLECharacteristicValueChange,
  getBluetoothData: getBluetoothData,
  onStepGetDeviceList: onStepGetDeviceList,
  onStepConnDeviceAndGetMsg: onStepConnDeviceAndGetMsg
}  
