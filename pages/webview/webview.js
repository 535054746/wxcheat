const app = getApp()

Page({
  data: {
    eid: '',
    orgno:'',
    openId:'',
    supplier:'',
    isTrue:false,
    httpSrc:'',
    urlFlag:''
  },
  onLoad: function (options) {
    this.setData({
      urlFlag: options.url
    })
  },
  onReady: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.setData({
          eid: res.data.eid,
          orgno: res.data.orgno,
          openId: res.data.openId
        })
        var httpHref='';
        wx.request({
          url: url + 'base/getUserInfo', //仅为示例，并非真实的接口地址
          data: {
            openId: vm.data.openId
          },
          dataType: 'json',
          header: {
            "Content-Type": "application/json",
            eid: vm.data.eid
          },
          method: 'get',
          success: function (res) {
            console.log(res);
            if (vm.data.urlFlag == "SKX_MODULE_00009") {
                httpHref = 'https://api1.gdskx.com/vueH5/skxApp/procurReport.html?eid=' + vm.data.eid + '&orgno=' + vm.data.orgno + '&openId=' + vm.data.openId + '&OS=WX&supplier=' + res.data.data.supplier.id;
            } else if (vm.data.urlFlag == "SKX_MODULE_00011") {
              httpHref = 'https://api1.gdskx.com/vueH5/chart/supplySummary.html?eid=' + vm.data.eid + '&orgno=' + vm.data.orgno + '&openId=' + vm.data.openId + '&OS=WX&supplier=' + vm.data.eid;
            } else if (vm.data.urlFlag == "SKX_MODULE_00010") {
                httpHref = 'https://api1.gdskx.com/vueH5/skxApp/receiveSummary.html?eid=' + vm.data.eid + '&orgno=' + vm.data.orgno + '&openId=' + vm.data.openId + '&OS=WX&supplier=' + res.data.data.supplier.id;
            }
            console.log(httpHref)
              vm.setData({
                supplier:res.data.data.supplier.id,
                isTrue:true,
                httpSrc: httpHref
              })
          }, error: function (res) {
          }
        })
      }
    })

  }
})