const app = getApp()
Page({
  data: {
    openId: "",
    eId: '',
    orgno:'',
    customerData: [],
    deleteFlag:false,
    deleteCustomerId:'',
    ckTipFalg: false,
    tipText: '',
    timeObj: null,
    loading: false,

    currentShare: null,
    shareFlag:false,
  },
  onShow: function () {
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.orgno = res.data.orgno;
        vm.getCustomer();
      }
    })

  },
  getCustomer: function () {
    var vm = this;
    var url = app.globalData.url;
    this.setData({
      loading: true
    })
    wx.request({
      url: url + 'customer/getCustomerList', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        businessType:0
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'get',
      success: function (res) {
        vm.setData({
          loading: false
        })
        if (res.data.code == "1") {
          vm.setData({
            customerData: res.data.data
          })
          console.log(res.data);

        } else {

        }
      }, error: function (res) {
        vm.setData({
          loading: false
        })
      }
    })
  },
  deleteCustomer: function (event) {
    this.setData({
      deleteFlag: false
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'customer/deleteCustomer', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        customerId: vm.data.deleteCustomerId,
        businessType: 0
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'post',
      success: function (res) {
        if (res.data.code == "1") {
          vm.setData({
            customerData: res.data.data
          })
          console.log(res.data);
          vm.getCustomer();
        } else {
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
      }
    })
  },

  onShareAppMessage: function (res) {
    var index=res.target.dataset.index;
    var vm = this;
    console.log('pages/supplier/shareView/shareView?customerName=' + this.data.currentShare.companyName + '&customerCode=' + this.data.currentShare.blNum + '&contactsName=' + this.data.currentShare.contactsName + '&mobile=' + this.data.currentShare.mobile + '&address=' + this.data.currentShare.address + '&urlFlag=2');
    return {
      title: '客户分享',
      imageUrl:'../../common/images/icons/xcxfxbg.png',
      path: 'pages/selectLoginType/selectLoginType?customerName=' + this.data.currentShare.companyName + '&customerCode=' + this.data.currentShare.blNum + '&contactsName=' + this.data.currentShare.contactsName + '&mobile=' + this.data.currentShare.mobile + '&address=' + this.data.currentShare.address + '&urlFlag=2' + '&shareType=1',
      success: function (res) {
        // 转发成功
        vm.setData({ shareFlag: false, currentShare: null});
        console.log('succ-->' + res.target)
      },
      fail: function (res) {
        // 转发失败
        console.log('fail-->' + res.target)
      }
    }
  },

  callMobile: function (event) {
    var mobile = event.currentTarget.dataset.mobile;
    var vm = this;
    wx.makePhoneCall({
      phoneNumber: mobile //仅为示例，并非真实的电话号码
    })
  },
  addCustomer: function(event) {
    wx.navigateTo({
      url: "../Addcustomer/Addcustomer"
    })
  },
  deleteTip: function (event) {
    this.setData({
      deleteFlag: true,
      deleteCustomerId: event.currentTarget.dataset.id
    })
  },
  deleteCancel: function (event) {
    this.setData({
      deleteFlag: false
    })
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

  shareInfo: function (e) {
    this.setData({
      currentShare: e.currentTarget.dataset.index,
      shareFlag: true
    })
  },

  closeShare: function () {
    this.setData({
      currentShare: null,
      shareFlag: false
    })
  },
})