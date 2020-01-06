const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const formatTimeDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}


const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const app = getApp();

function getRedCount(callback) {
  wx.getStorage({
    key: 'supplierInfo',
    success: function (res) {
      var url = app.globalData.url;
      wx.request({
        url: url +'permission/getUserPermission',
        data: {
          openId: res.data.openId,
          businessType: res.data.businessType,
          type: 2
        },
        header: {
          "Content-Type": "application/json",
          eId: res.data.eid
        },
        method: 'GET',
        dataType: 'json',
        success: function(res) {
          if (res.data.code == 1) {
            typeof callback == 'function' && callback(res.data.data);
          }else{
            console.log(res);
          }
        },
        fail: function(res) {
          console.log(res)
        },
      })
    }
  })
}

module.exports = {
  formatTime: formatTime,
  getRedCount: getRedCount,
  formatTimeDate: formatTimeDate
}
