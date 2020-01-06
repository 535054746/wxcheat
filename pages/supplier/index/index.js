const app = getApp()

Page({
  data: {
    openId: "",
    companyName:"",
    eId: '',
    orgno:'',
    menuData: [],
    tipflag: false,
    totalNum: 0,
    totalAmount: "0.00",
    totalCount:0
  },
  onShow: function () {
    wx.hideHomeButton()
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        console.log(res);
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        // vm.data.companyName = res.data.companyName;
        vm.setData({
          // companyName: vm.data.companyName
        })
        vm.getTodaySalesOrderData();
        vm.getBaseData();
        vm.getTotalNumber();
      }
    })
    
    wx.getStorage({
      key: 'userInfo',
      success: function(res) {
        vm.setData({
          companyName:res.data.supplier.suppliername
        })
      },
    })

  },
  getTodaySalesOrderData: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'order/getTodaySalesOrderData', //仅为示例，并非真实的接口地址
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
        if (res.data.code == "1") {
          vm.setData({
            companyName: vm.data.companyName,
            totalNum: res.data.data.totalNum,
            totalAmount: res.data.data.totalAmount
          })

        } else {

        }
      }, error: function (res) {
      }
    })
  },
  linkJump: function (event) {
    console.log(event)
    var vm = this;
    var url = event.currentTarget.dataset.url;
    wx.navigateTo({ url: url });
    
    
  },
  loginOutShow: function (event) {
    var vm = this;
    vm.setData({
      loginOutIconFlag: true
    })
    setTimeout(function () {
      vm.setData({
        loginOutShowFlag: true,
        loginOutIconFlag: false
      })
    }, 200);
  },
  loginOutCancel: function (event) {
    this.setData({
      loginOutShowFlag: false
    })
  },
  loginOutComfire: function (event) {
    this.setData({
      loginOutShowFlag: false
    })
    wx.getStorage({
      key: 'userId',
      success: function (res) {
        console.log(res);
        wx.setStorage({
          key: "userId",
          data: {
            userName: res.data.userName,
            passWord: ''
          }
        })
      }
    })
    
    wx.redirectTo({
      url: '../../login/login?billtype=0'
    })
  },
  getBaseData: function (event) {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getBaseData', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        data: [{
          "type": "7",
          "version": 1
        }]
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        if (res.data.code == '1') {
          wx.setStorage({
            key: "organizationList",
            data: {
              organizationList: res.data.data.organizationList
            }
          })
        }

      }, error: function (res) {
      }
    })
  },
  jumpSaleOrder:function(){
    wx.navigateTo({
      url: '../saleOrder/saleOrder'
    })
  },
  jumpCompanyInfo: function () {
    wx.navigateTo({
      url: '../companyInfo/companyInfo'
    })
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    var vm = this;
    //模拟加载
    setTimeout(function () {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
      vm.getTodaySalesOrderData();
    }, 1500);
  },

  
  getTotalNumber: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'permission/getUserPermission', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        businessType:0,
        type: 2
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
          for (var i = 0; i < res.data.data.length; i++) {
            for (var h = 0; h < res.data.data[i].childerList.length; h++) {
              if (res.data.data[i].childerList[h].name == "配送单") {
                vm.data.totalCount = res.data.data[i].childerList[h].totalNumMap.totalCount;
                vm.setData({
                  totalCount: vm.data.totalCount
                })
              }
            }
          }
        }


      }, error: function (res) {
      }
    })
  },
  jumpCustomerDatas:function(){
    wx.navigateTo({
      url: '../customerDatas/customerDatas'
    })
  }
})