const app = getApp()

Page({
  data: {
    openId: "",
    companyItem: "",
    eId: '',
    orgno: ''
  },
  onShow: function () {
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        console.log(res);
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.orgno = res.data.orgno;
        vm.getCompanyInfo();
      }
    })


  },
  getCompanyInfo: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'customer/getCompanyInfo', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId
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
        if (res.data.code == "1") {
          vm.setData({
            companyItem: res.data.data
          })

        } else {

        }
      }, error: function (res) {
      }
    })
  }
})