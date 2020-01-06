// pages/mine/addOrderPerson/addOrderPerson.js
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchList:[],

    companyName:'',
    business:'',
    person: '',
    phone: '',

    maskFlag:false,

    isCompanyNameFocus: false,
    isBusinessFocus: false,
    isPersonFocus: false,
    isPhoneNameFocus:false,
    forbiddenInput:false,

    eid:'',
    orgno:'',
    openId:'',
    address:'',

    tipFalg: false,
    tipText: '',
    timeOutObj: null,
    
    isLoad : false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.setData({
          eid: res.data.eid,
          orgno: res.data.orgno,
          openId: res.data.openId,
        });
      },
    })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  companyInput: function (e) {
    this.setData({ companyName: e.detail.value });
    if (e.detail.value!='')
      this.getSupplierListByKey();
    else
      this.setData({ searchList: '', maskFlag:false });
  },

  businessInput: function (e) {
    this.setData({ business: e.detail.value });
  },

  personInput: function (e) {
    this.setData({ person: e.detail.value });
  },

  phoneInput: function (e) {
    this.setData({ phone: e.detail.value });
  },

  bindFocus: function (e) { 
    var inputType = e.currentTarget.dataset.type;
    if (inputType == 'company'){
      this.setData({ isCompanyNameFocus: true });
    } else if (inputType == 'business') {
      this.setData({ isBusinessFocus: true });
    } else if (inputType == 'person') {
      this.setData({ isPersonFocus: true });
    } else if (inputType == 'phone') {
      this.setData({ isPhoneFocus: true });
    }
  },

  bindBlur: function (e) {
    var inputType = e.currentTarget.dataset.type;
    if (inputType == 'company') {
      this.setData({ isCompanyNameFocus: false });
    } else if (inputType == 'business') {
      this.setData({ isBusinessFocus: false });
    } else if (inputType == 'person') {
      this.setData({ isPersonFocus: false });
    } else if (inputType == 'phone') {
      this.setData({ isPhoneFocus: false });
    }
  },

  checkInput: function () {
    if (!this.data.isLoad) {
      this.data.isLoad = true;
      var companyName = this.data.companyName;
      var business = this.data.business;
      var person = this.data.person;
      var phone = this.data.phone;
      var vm = this;
      if (companyName == '') {
        this.showTips('公司不能为空');
        this.data.isLoad = false;
        return;
      }
      if (app.checkCompanyName(companyName)) {
        this.showTips('公司名称必须由数字，字母，中文组成');
        this.data.isLoad = false;
        return;
      }
      if (business == '') {
        this.showTips('营业执照不能为空');
        this.data.isLoad = false;
        return;
      }
      var pattern = /^[a-zA-Z\d]+$/;
      if (!pattern.test(business)) {
        this.showTips('营业执照只能由数字和字母组成');
        this.data.isLoad = false;
        return;
      }
      if (business.length == 15 || business.length == 18) {
      } else {
        this.showTips('营业执照只能15位或者18位组成');
        this.data.isLoad = false;
        return;
      }
      if (person == '') {
        this.showTips('联系人不能为空');
        this.data.isLoad = false;
        return;
      }
      if (phone == '') {
        this.showTips('手机号码不能为空');
        this.data.isLoad = false;
        return;
      }
      if (!app.checkPhone(phone)) {
        this.showTips('手机号码格式不正确');
        this.data.isLoad = false;
        return;
      }
      wx.showLoading({
        title: '保存中',
      });
      wx.getStorage({
        key: 'supplierInfo',
        success: function (res) {
          vm.setData({
            eid: res.data.eid,
            orgno: res.data.orgno,
            openId: res.data.openId,
          });
          vm.sumbit();
        },
      })
    }
  },

  sumbit:function(){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'customer/addCustomer',
      data: {
        openId: vm.data.openId,
        companyName: vm.data.companyName,
        contactsName: vm.data.person,
        blNum: vm.data.business,
        mobile: vm.data.phone,
        address: '',
        businessType: 1,
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eid: vm.data.eid,
        orgno: vm.data.orgno,
      },
      method: 'post',
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        if (res.data.code == '1') {
          wx.showToast({
            title: '保存成功',
          });
          wx.navigateBack({
            delta: 1
          });
        } else {
          vm.data.isLoad = false;
          vm.showTips(res.data.message);
        }
      },
      error: function (res) {
        vm.data.isLoad = false;
        console.log(res);
        wx.hideLoading();
      }
    })
  },

  closeBg:function(){
    var isMatch = false;
    for (var item of this.data.searchList){
      if (item.companyName == this.data.companyName){
        isMatch=true;
        break;
      }
    }
    if(!isMatch)
      this.setData({ maskFlag:false})
  },

  toBack: function () {
    setTimeout(function () {
      wx.navigateBack({
        delta: 1
      });
    }, 500);},

  getSupplierListByKey:function(){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url +'customer/getCustomerList2',
      method:'get',
      dataType:'json',
      data:{
        openId: vm.data.openId,
        companyName: vm.data.companyName,
        businessType: '1'
      },
      header:{
        eid: vm.data.eid,
        orgno: vm.data.orgno
      },
      success:function(res){
        if (res.data.code == '1') {
          console.log(res.data.data.length);
          vm.setData({ searchList: res.data.data, maskFlag:true });
        }
      },
      error:function(res){
        console.log(res.data);
      }
    })
  },

  bindData:function(event){
    var mData = event.currentTarget.dataset.supplier;
    this.setData({
      companyName: mData.companyName,
      business: mData.blNum,
      person: mData.contactsName,
      phone: mData.mobile,
      searchList:'',
      forbiddenInput:true
    })
  },

  clearData:function(){
    this.setData({
      companyName: '',
      business: '',
      person: '',
      phone: '',
      searchList: '',
      forbiddenInput: false
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
  }
})