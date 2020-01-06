const app = getApp()
Page({
  data: {
    openId: "",
    eId: '',
    orgno: '',
    companyName: '',
    contactsName: '',
    blNum: '',
    mobile: '',
    address: '',
    timeObj:null,
    tipFalg:false,
    tipText:'',
    searchData:[],
    selectSearchData:'',
    loading:false,
    searchFlag:false
  },
  onReady: function () {
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.orgno = res.data.orgno;
      }
    })

  },
  saveCustomer:function(event){
    var vm = this;
    var url = app.globalData.url;
    var reg = /^(?:(?![IOZSV])[\dA-Z]){2}\d{6}(?:(?![IOZSV])[\dA-Z]){10}$/;
    if (vm.data.companyName.length == 0) {
      vm.showTips("公司名称不能为空");
      return;
    }
    if (app.checkCompanyName(vm.data.companyName)) {
      vm.showTips("公司名称存在特殊字符");
      return;
    }
    if (vm.data.blNum.length == 0) {
      vm.showTips("营业执照不能为空");
      return;
    }
    if (vm.data.blNum.length != 15 && vm.data.blNum.length != 18) {
      vm.showTips("营业执照格式错误");
      return;
    }
    if (!(/^[0-9a-zA-Z]+$/.test(vm.data.blNum))) {
      vm.showTips("营业执照格式错误");
      return;
    }
    if (vm.data.contactsName.length == 0) {
      vm.showTips("联系人不能为空");
      return;
    }
    if (vm.data.mobile.length == 0) {
      vm.showTips("手机号码不能为空");
      return;
    }
    if (!(/^1[345678]\d{9}$/.test(vm.data.mobile))) {
      vm.showTips("手机号码格式不对");
      return;
    }
    if (app.checkCompanyName(vm.data.address)) {
      vm.showTips("详细地址存在特殊表情");
      return;
    }
    vm.setData({
      loading: true
    })
    wx.request({
      url: url + 'customer/addCustomer', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        companyName: vm.data.companyName,
        contactsName: vm.data.contactsName,
        blNum: vm.data.blNum,
        mobile: vm.data.mobile,
        address: vm.data.address,
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
          vm.showTips("添加成功");
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        } else {
          vm.showTips(res.data.message);
        }
        vm.setData({
          loading: false
        })
        
      }, error: function (res) {
      }
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
  inputCompanyName: function (e) {
    this.setData({
      companyName: e.detail.value
    })
    this.getSearchCompany();
  },
  inputBlNum: function (e) {
    this.setData({
      blNum: e.detail.value
    })
  },
  inputContactsName: function (e) {
    this.setData({
      contactsName: e.detail.value
    })
  },
  inputMobile: function (e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  inputAddress: function (e) {
    this.setData({
      address: e.detail.value
    })
  },
  getSearchCompany: function(e){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'customer/getCustomerList2', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        companyName: vm.data.companyName,
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
          console.log(res.data.data);
          vm.setData({
            searchData: res.data.data
          })
          vm.formatData();
        } else {
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
      }
    })
  },
  formatData : function(){
    var flag=false;
    for(var i = 0; i < this.data.searchData.length;i++){
      if (this.data.searchData[i].companyName == this.data.companyName){
        this.data.searchData[i].flag=true;
        flag=true;
      }else{
        this.data.searchData[i].flag = false;
      }
    }
    if (flag){
      this.data.searchFlag=true;
    }else{
      this.data.searchFlag = false;
    }
    this.setData({
      searchFlag: this.data.searchFlag,
      searchData: this.data.searchData
    })
    console.log(this.data.searchData);
  },
  selectCompany: function(event){
    var companyName = event.currentTarget.dataset.companyname;
    var index = event.currentTarget.dataset.index;
    this.setData({
      companyName: this.data.searchData[index].companyName,
      contactsName: this.data.searchData[index].contactsName,
      blNum: this.data.searchData[index].blNum,
      mobile: this.data.searchData[index].mobile,
      address: this.data.searchData[index].address,
      selectSearchData: this.data.searchData[index],
      searchData: []
    })
  },
  clearCompany: function (event) {
    this.setData({
      companyName: '',
      contactsName: '',
      blNum: '',
      mobile: '',
      address: '',
      selectSearchData:'',
      searchData: []
    })
  },
  hideSearchData: function (event) {
    this.setData({
      searchData: []
    })
  }
})