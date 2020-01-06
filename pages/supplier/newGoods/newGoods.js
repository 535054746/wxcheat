//index.js
//获取应用实例
const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    orderStatu: '',
    openId: "",
    orgno: '',
    eId: '',
    shopName:'',
    itemcode1:'',
    itemcode2:'',
    itemname1:'',
    itemname2:'',
    shopunit1:'',
    shopunit2: '',
    unitTotal:'',
    unitSelectFlag1:[],
    unitSelectFlag2: [],
    unitTouchFlag1:[],
    unitTouchFlag2:[],
    unitFlag1: false,
    unitFlag2: false,
    unitId1:'',
    unitId2: '',
    unitName1: '',
    unitName2: '',
    ruleData:[],  
    currentRule:0,
    shopHavedTip:false,
    shopItemHaved:'',
    ckTipFalg: false,
    tipText: '',
    timeObj: null,
    touchNumber:0
  },
  onLoad: function (option) {
    this.setData({
      itemcode1: option.itemcode1,
      itemcode2: option.itemcode2,
      itemname1: option.itemname1,
      itemname2: option.itemname2
    })
  },
  onReady: function () {
   
  },
  onShow: function () {
    this.initData();
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.orgno = res.data.orgno;
        vm.getUnits();
      }
    })
    //将选择的规格值插入规格数组
    wx.getStorage({
      key: 'currentSelectRule',
      success: function (res) {
        if (res.data.currentSelectRule.kid){
          console.log(vm.data.currentRule);
          vm.data.ruleData[vm.data.currentRule] = res.data.currentSelectRule;
          vm.setData({
            ruleData: vm.data.ruleData
          })
          wx.setStorage({
            key: "selectRule",
            data: {
              selectRuleData: vm.data.ruleData
            }
          })
        }
        console.log(res);
      }
    })
    wx.getStorage({
      key: 'currentItemTypeData',
      success: function (res) {
        if (res.data.currentItemTypeData) {
          vm.setData({
            itemcode1: res.data.currentItemTypeData.itemcode1,
            itemcode2: res.data.currentItemTypeData.itemcode2,
            itemname1: res.data.currentItemTypeData.itemname1,
            itemname2: res.data.currentItemTypeData.itemname2
          })
        }
        console.log(res);
      }
    })
    //清除上一次选择的规格
    wx.setStorage({
      key: "currentSelectRule",
      data: {
        currentSelectRule: {}
      }
    })
    wx.setStorage({
      key: "currentItemTypeData",
      data: {
        currentSelectRule: {}
      }
    })
  },
  initData: function () {
    
  },
  getUnits: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getUnits', //仅为示例，并非真实的接口地址
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
        if (res.data.code == '1') {
          vm.setData({
            unitTotal: res.data.data
          })
          vm.selectFLagFormat();
          console.log(vm.data.unitTotal);
        }

      }, error: function (res) {
      }
    })
  },
  selectFLagFormat: function(){
    for (var i = 0; i < this.data.unitTotal.length;i++){
      this.data.unitSelectFlag1.push(false);
      this.data.unitSelectFlag2.push(false);
      this.data.unitTouchFlag1.push(false);
      this.data.unitTouchFlag2.push(false);
    }
    this.setData({
      unitSelectFlag1: this.data.unitSelectFlag1,
      unitSelectFlag2: this.data.unitSelectFlag2,
      unitTouchFlag1: this.data.unitTouchFlag1,
      unitTouchFlag2: this.data.unitTouchFlag2
    })
  },
  unitSelectOne: function(){
    if (this.data.unitFlag1){
      this.setData({
        unitFlag1:false
      })
    }else{
      this.setData({
        unitFlag1: true
      })
    }
  },
  unitSelectTwo: function () {
    if (this.data.unitFlag2) {
      this.setData({
        unitFlag2: false
      })
    } else {
      this.setData({
        unitFlag2: true
      })
    }
  },
  unitSelect1: function (event) {
    var unitId = event.currentTarget.dataset.id;
    var unitName = event.currentTarget.dataset.unitname;
    var index = parseInt(event.currentTarget.dataset.index);
    var vm = this;
    console.log(index);
    for (var i = 0; i < this.data.unitSelectFlag1.length; i++){
      this.data.unitSelectFlag1[i]=false;
    }
    this.data.unitSelectFlag1[index]=true;
    this.setData({
      unitId1: unitId,
      unitName1: unitName,
      unitSelectFlag1: this.data.unitSelectFlag1
    })
    setTimeout(function () {
      vm.setData({
        unitFlag1: false
      })
    }, 100)
    
  },
  unitSelectStartOne: function (event) {
    var index = parseInt(event.currentTarget.dataset.index);
    this.data.touchNumber = index;
    this.data.unitTouchFlag1[index] = true;
 
    this.setData({
      touchNumber: this.data.touchNumber,
      unitTouchFlag1: this.data.unitTouchFlag1
    })
  },
  unitSelectEndOne: function (event) {
    var vm=this;
    var index = parseInt(event.currentTarget.dataset.index);
    this.data.unitTouchFlag1[index] = false;
    setTimeout(function(){
      vm.setData({
        unitTouchFlag1: vm.data.unitTouchFlag1
      })
    },100)
    
  },
  unitSelect2: function (event) {
    var unitId = event.currentTarget.dataset.id;
    var unitName = event.currentTarget.dataset.unitname;
    var index = parseInt(event.currentTarget.dataset.index);
    var vm = this;
    for (var i = 0; i < this.data.unitSelectFlag2.length; i++) {
      this.data.unitSelectFlag2[i] = false;
    }
    this.data.unitSelectFlag2[index] = true;
    this.setData({
      unitId2: unitId,
      unitName2: unitName,
      unitSelectFlag2: this.data.unitSelectFlag2
    })
    setTimeout(function () {
      vm.setData({
        unitFlag2: false
      })
    },100)
  },
  unitSelectStartTwo: function (event) {
    var index = parseInt(event.currentTarget.dataset.index);
    this.data.touchNumber = index;
    this.data.unitTouchFlag2[index] = true;

    this.setData({
      touchNumber: this.data.touchNumber,
      unitTouchFlag2: this.data.unitTouchFlag2
    })
  },
  unitSelectEndTwo: function (event) {
    var vm = this;
    var index = parseInt(event.currentTarget.dataset.index);
    this.data.unitTouchFlag2[index] = false;
    setTimeout(function () {
      vm.setData({
        unitTouchFlag2: vm.data.unitTouchFlag2
      })
    }, 100)

  },
  addRule:function(){
    this.data.ruleData.push({});
    this.setData({
      ruleData: this.data.ruleData
    })
    console.log(this.data.ruleData);
  },
  ruleJumpLink: function (event) {
    var index = parseInt(event.currentTarget.dataset.index);
    this.setData({
      currentRule:index
    })
    
    wx.navigateTo({ url: '../selectSpecification/selectSpecification'});
  },
  bindKeyShopName: function (e) {
    this.setData({
      shopName: e.detail.value
    })
  },
  selectShopFlag: function (e) {
    var itemVal=e.detail.value
    if (itemVal.length==0){
      return;
    }else{
      var vm = this;
      var url = app.globalData.url;
      wx.request({
        url: url + 'base/isExistItem', //仅为示例，并非真实的接口地址
        data: {
          openId: vm.data.openId,
          itemname: itemVal,
          type:1
        },
        dataType: 'json',
        header: {
          "Content-Type": "application/json",
          eId: vm.data.eId,
          orgno: vm.data.orgno
        },
        method: 'post',
        success: function (res) {
          if (res.data.code == '1') {
            if (res.data.data.id){
              vm.setData({
                shopHavedTip:true,
                shopItemHaved: res.data.data
              })
              
            }
          }

        }, error: function (res) {
        }
      })
    }
  },
  cancelHavedTip:function(){
    this.setData({
      shopName:'',
      shopHavedTip: false
    })
  },
  comfireExit: function () {
    this.setData({
      shopHavedTip: false
    })
    var vm = this;
    wx.setStorage({
      key: 'shopItemHaved',
      data: {
        shopItemHaved: vm.data.shopItemHaved
      },
      success:function(){
        console.log(vm.data.shopItemHaved);
        wx.navigateBack({
          delta:1
        })
      }
    })
  },
  saveShopFormat: function (){
    var data = {}
    data.openId = this.data.openId;
    data.itemtypecode = this.data.itemcode2;
    data.itemname = this.data.shopName;
    data.assistantunit = this.data.unitName1;
    data.unit = this.data.unitName2;
    data.propertiesId = '';
    var propertiesId = '';
    var itemspecifications = '';
    console.log(this.data.ruleData);
    for (var i = 0; i < this.data.ruleData.length; i++) {
      if(this.data.ruleData[i].kid){
        if (propertiesId.indexOf(this.data.ruleData[i].kid) >= 0) {
          //propertiesId = this.insertFlg(propertiesId, this.data.ruleData[i].kid, propertiesId.indexOf(this.data.ruleData[i].kid));
          propertiesId = propertiesId.substr(0, propertiesId.indexOf(this.data.ruleData[i].kid) + this.data.ruleData[i].kid.length + 1) + this.data.ruleData[i].vid + '|' + propertiesId.substr(propertiesId.indexOf(this.data.ruleData[i].kid) + this.data.ruleData[i].kid.length + 1, propertiesId.length - 1);
        } else {
          propertiesId = propertiesId + this.data.ruleData[i].kid + ':' + this.data.ruleData[i].vid + ';';
        }
      }

    }
    for (var i = 0; i < this.data.ruleData.length; i++) {
      if (this.data.ruleData[i].k) {
        if (itemspecifications.indexOf(this.data.ruleData[i].k) >= 0) {
          //propertiesId = this.insertFlg(propertiesId, this.data.ruleData[i].kid, propertiesId.indexOf(this.data.ruleData[i].kid));
          itemspecifications = itemspecifications.substr(0, itemspecifications.indexOf(this.data.ruleData[i].k) + this.data.ruleData[i].k.length + 1) + this.data.ruleData[i].v + '|' + itemspecifications.substr(itemspecifications.indexOf(this.data.ruleData[i].k) + this.data.ruleData[i].k.length + 1, itemspecifications.length - 1);
        } else {
          itemspecifications = itemspecifications + this.data.ruleData[i].k + ':' + this.data.ruleData[i].v + ';';
        }
      }

    }
    data.propertiesId = propertiesId;
    data.itemspecifications = itemspecifications;
    if (!this.data.shopHavedTip){
      if (data.itemtypecode.length == 0) {
        this.showTips("请选择商品类型");
        return;
      }
      if (data.itemname.length == 0) {
        this.showTips("请填写商品名称");
        return;
      }
      if (data.unit.length == 0) {
        this.showTips("请选择验收单位");
        return;
      }
    }
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/saveItem', //仅为示例，并非真实的接口地址
      data: data,
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'post',
      success: function (res) {
        if (res.data.code == '1') {
          wx.showToast({
            title: '保存成功',
            icon:'success'
          })
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            })
          }, 1000)
        }

      }, error: function (res) {
      }
    })
  },
  selectShopType: function () {
    wx.navigateTo({ url: '../selectShopType/selectShopType?itemcode1=' + this.data.itemcode1 + '&itemname1=' + this.data.itemname1 + '&itemcode2=' + this.data.itemcode2 + '&itemname2=' + this.data.itemname2 });
  },
  showTips: function (msg) {
    var vm = this;
    if (vm.data.timeObj) {
      clearTimeout(vm.data.timeObj);
    }
    vm.setData({
      ckTipFalg: true,
      tipText: msg
    })
    vm.data.timeObj = setTimeout(function () {
      vm.setData({
        ckTipFalg: false,
        tipText: ''
      })
    }, 1500);
  },
  deleteRule: function (event) {
    var index = parseInt(event.currentTarget.dataset.index);
    console.log(index);
    var selectRuleData = [];
    var vm = this;
    wx.getStorage({
      key: 'selectRule',
      success: function (res) {
        selectRuleData = res.data.selectRuleData;
        if (vm.data.ruleData.length == 1) {
          vm.setData({
            ruleData: []
          })
          selectRuleData = [];
        } else {
          vm.data.ruleData.splice(index, 1)
          vm.setData({
            ruleData: vm.data.ruleData
          })
          selectRuleData.splice(index, 1);
        }
        wx.setStorage({
          key: "selectRule",
          data: {
            selectRuleData: selectRuleData
          }
        })
      }
    })
  }
})
