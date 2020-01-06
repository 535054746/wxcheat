//index.js
//获取应用实例
const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    orderStatu: '',
    openId: "",
    eId: '',
    orgno:'',
    total: '',
    orderId: '',
    ruleData: [],
    ruleValueData: [],
    ruleDataFlag:[],
    ruleValueDataFlag: [],
    currentRule:0,
    selectRuleData:[],
    itemTypeOneFlag: true,
    itemTypeTwoFlag: 0,
    kvalue:'',
    vvalue:'',
    otherTipFlag:false,
    tipMsg:'',
    leftNumber:0,
    rightNumber: 0,
    currentLeftScroll: 0,
    currentRightScroll: 0,
    skuproperty:""
  },
  onLoad: function (option){
    if(option.skuproperty){
      this.setData({
        skuproperty: JSON.parse(option.skuproperty)
      })
    }
  },
  onReady: function () {
  },
  onShow: function () {
    this.initData();
    var vm = this;
    this.data.firstLoad = false;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.orgno = res.data.orgno;
        vm.getOrderList();
      }
    })
    wx.getStorage({
      key: 'selectRule',
      success: function (res) {
        vm.data.selectRuleData = res.data.selectRuleData;
      }
    })
    if (!vm.data.selectRuleData){
      wx.setStorage({
        key: "selectRule",
        data: {
          selectRuleData: []
        }
      })
    }
  },
  initData: function () {
    
  },
  getOrderList: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getItemSkuPropertys', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        skuproperty: vm.data.skuproperty
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'get',
      success: function (res) {
        if (res.data.code == '1') {
          vm.setData({
            ruleData:res.data.data,
            ruleValueData: res.data.data[0].value
          })
          vm.addSelectFlag();
          vm.ruleDataFlagFormat();
        }

      }, error: function (res) {
      }
    })
  },
  addSelectFlag: function () {
    console.log(this.data.selectRuleData);
    for (var i = 0; i < this.data.ruleData.length; i++){
      for (var h = 0; h < this.data.ruleData[i].value.length; h++){
        for (var l = 0; l < this.data.selectRuleData.length;l++){
          if (this.data.ruleData[i].value[h].keyid == this.data.selectRuleData[l].kid && this.data.ruleData[i].value[h].valueid == this.data.selectRuleData[l].vid){
            this.data.ruleData[i].value[h].select=true;
          }
        }
      }
    }
    console.log(this.data.ruleData);
    this.setData({
      ruleData: this.data.ruleData,
      ruleValueData: this.data.ruleData[0].value
    })
  },
  ruleDataFlagFormat: function () {
    for (var i = 0; i < this.data.ruleData.length;i++){
      this.data.ruleDataFlag[i]=false;
    }
    this.setData({
      ruleDataFlag: this.data.ruleDataFlag
    })
  },
  changeRuleValue:function(event){
    var index = event.currentTarget.dataset.index;
    this.setData({
      itemTypeOneFlag: true,
      itemTypeTwoFlag: 0,
      currentRule: index,
      ruleValueData: this.data.ruleData[index].value
    })
  },
  saveRuleId: function (event) {
    var index = event.currentTarget.dataset.index;
    var vm = this;
    
    var kid = vm.data.ruleData[vm.data.currentRule].kid;
    var k = vm.data.ruleData[vm.data.currentRule].k;
    var vid = vm.data.ruleData[vm.data.currentRule].value[index].valueid;
    var v = vm.data.ruleData[vm.data.currentRule].value[index].v;
    
    var flag=false;
    console.log(vm.data.selectRuleData);
    for (var i = 0; i < vm.data.selectRuleData.length;i++){
      if (kid == vm.data.selectRuleData[i].kid && vid == vm.data.selectRuleData[i].vid){
        flag=true;
      }
    }
    if(flag){

    }else{
      var item={};
      item.kid = kid;
      item.k = k;
      item.vid = vid;
      item.v = v;
      vm.data.selectRuleData.push(item);
      wx.setStorage({
        key: "selectRule",
        data: {
          selectRuleData: vm.data.selectRuleData
        }
      })
      wx.setStorage({
        key: "currentSelectRule",
        data: {
          currentSelectRule: item
        }
      })
      wx.navigateBack({
        delta: 1
      })
    }
  },
  changeOneFlag:function(){
    if (this.data.itemTypeOneFlag){
      this.setData({
        kvalue: "",
        itemTypeTwoFlag: 2,
        leftNumber: this.data.currentLeftScroll,
        itemTypeOneFlag: false
      })
    }else{
      this.setData({
        itemTypeTwoFlag: 2,
        itemTypeOneFlag: true
      })
    }
    
  },
  changeTwoFlag: function () {
    if (this.data.itemTypeTwoFlag==1) {
      this.setData({
        vvalue: "",
        rightNumber: this.data.currentRightScroll+80,
        itemTypeTwoFlag: 0
      })
    } else {
      this.setData({
        itemTypeTwoFlag: 1
      })
    }
  },
  kValueInput: function (e) {
    this.setData({
      kvalue: e.detail.value
    })
  },
  vValueInput: function (e) {
    console.log(e.detail.value);
    this.setData({
      vvalue: e.detail.value
    })
  },
  kValueConfirm: function(e){
    var vm = this;
    var url = app.globalData.url;
    if (vm.data.kvalue.length==0){
      vm.setData({
        otherTipFlag: true,
        tipMsg: "请填写规格名称"
      })
      return;
    }
    
    wx.request({
      url: url + 'base/addItemSkuProperty', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        k: vm.data.kvalue
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        if (res.data.code == '1') {
          var item={};
          item.k = res.data.data.k;
          item.kid = res.data.data.kid;
          item.value = [];
          var itemArray=[item];
          itemArray=itemArray.concat(vm.data.ruleData);
          vm.setData({
            kvalue:'',
            vvalue: '',
            ruleData: itemArray,
            ruleValueData: itemArray[0].value,
            leftNumber:0,
            rightNumber: 0,
            currentRule: 0,
            itemTypeOneFlag: true,
            itemTypeTwoFlag: 0
          })
        } else {
          vm.setData({
            otherTipFlag: true,
            tipMsg: res.data.message
          })
        }

      }, error: function (res) {
      }
    })
  },
  vValueConfirm: function (e) {
    var vm = this;
    var url = app.globalData.url;
    if (vm.data.vvalue.length == 0) {
      vm.setData({
        otherTipFlag: true,
        tipMsg: "请填写规格值"
      })
      return;
    }
    wx.request({
      url: url + 'base/addItemSkuProperty', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        kid: vm.data.ruleData[vm.data.currentRule].kid,
        v: vm.data.vvalue
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        if (res.data.code == '1') {
          var item = {};
          item.keyid = vm.data.ruleData[vm.data.currentRule].kid;
          item.v = res.data.data.v;
          item.valueid = res.data.data.vid;
          vm.data.ruleData[vm.data.currentRule].value.push(item);
          vm.setData({
            kvalue: '',
            vvalue: '',
            ruleData: vm.data.ruleData,
            ruleValueData: vm.data.ruleData[vm.data.currentRule].value,
            itemTypeOneFlag: true,
            itemTypeTwoFlag: 0
          })
        }else{
          vm.setData({
            otherTipFlag:true,
            tipMsg: res.data.message
          })
        }

      }, error: function (res) {
      }
    })
  },
  cancelTips: function(){
    this.setData({
      otherTipFlag: false,
      tipMsg: ''
    })
  },
  leftScroll: function (event) {
    this.data.currentLeftScroll=event.detail.scrollHeight;
  }, 
  rightScroll: function (event) {
    this.data.currentRightScroll = event.detail.scrollHeight;
  }
})
