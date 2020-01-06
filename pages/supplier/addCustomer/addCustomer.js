const app = getApp()
Page({
  data: {
    openId: "",
    eId: '',
    orgno: '',
    customerData: [],
    dataSelectFlag:[],
    isAllSelect:false,
    customerList:[],
    tipFalg: false,
    tipText: '',
    timeOutObj: null,
    loading:false
  },
  onReady: function () {
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
    wx.request({
      url: url + 'base/getCustomerList', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        businessType: 0
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
            customerData: res.data.data
          })
          vm.formatSelectFlag();
          console.log(res.data);

        } else {

        }
      }, error: function (res) {
      }
    })
  },
  selectCustomer: function (event){
    var index = event.currentTarget.dataset.index;
    if (this.data.dataSelectFlag[index]){
      this.data.dataSelectFlag[index] = false;
    }else{
      this.data.dataSelectFlag[index] =true;
    }
    this.setData({
      dataSelectFlag: this.data.dataSelectFlag
    })
    this.isAll();
  },
  formatSelectFlag: function (event) {
    for (var i = 0; i < this.data.customerData.length;i++){
      this.data.dataSelectFlag.push(false);
    }
    this.setData({
      dataSelectFlag: this.data.dataSelectFlag
    })
    console.log(this.data.dataSelectFlag);
  },
  isAll: function(){
    var flag=true
    for (var i = 0; i < this.data.customerData.length; i++) {
      if (!this.data.customerData[i].select){
        if (!this.data.dataSelectFlag[i]){
          flag=false;
        }
      }
    }
    if (flag){
      this.setData({
        isAllSelect: true
      })
    }else{
      this.setData({
        isAllSelect: false
      })
    }
  },
  saveData: function () {
    for (var i = 0; i < this.data.customerData.length; i++) {
      if (!this.data.customerData[i].select) {
        if (this.data.dataSelectFlag[i]) {
          var item={};
          item.customerId = this.data.customerData[i].id;
          item.customerName = this.data.customerData[i].companyName;
          this.data.customerList.push(item);
        }
      }
    }
    var vm = this;
    var url = app.globalData.url;
    this.setData({
      loading: true
    })
    wx.request({
      url: url + 'base/addBatchPricePlan', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        customerList: vm.data.customerList
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'post',
      success: function (res) {
        vm.setData({
          loading: false
        })
        console.log(res);
        if (res.data.code == "1") {
          wx.navigateBack({
            delta: 1
          })
        } else {
          if (res.data.message){
            vm.showTips(res.data.message);
          }else{
            vm.showTips("系统异常");
          }
        } 
      }, error: function (res) {
        vm.showTips("系统异常");
      }
    })
  },
  selectAll: function () {
    for (var i = 0; i < this.data.customerData.length; i++) {
      if (!this.data.customerData[i].select) {
        if (this.data.isAllSelect) {
          this.data.dataSelectFlag[i] = false;
        }else{
          this.data.dataSelectFlag[i] = true;
        }
      }
    }
    console.log(this.data.dataSelectFlag);
    if (this.data.isAllSelect) {
      this.setData({
        isAllSelect: false,
        dataSelectFlag: this.data.dataSelectFlag
      })
    }else{
      this.setData({
        isAllSelect: true,
        dataSelectFlag: this.data.dataSelectFlag
      })
    }
  },
  showTips: function (msg) {
    console.log(msg);
    var vm = this;
    if (vm.data.timeObj) {
      clearTimeout(vm.data.timeObj);
    }
    console.log(msg);
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
  }
})