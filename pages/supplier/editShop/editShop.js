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
    shopName: '',
    shopName2: '',
    itemcode1: '',
    itemcode2: '',
    itemname1: '',
    itemname2: '',
    shopunit1: '',
    shopunit2: '',
    unitTotal: '',
    unitSelectFlag1: [],
    unitSelectFlag2: [],
    unitFlag1: false,
    unitFlag2: false,
    unitId1: '',
    unitId2: '',
    unitName1: '',
    unitName2: '',
    ruleData: [],
    currentRule: 0,
    shopHavedTip: false,
    shopItemHaved: '',
    itemId:'',
    fristLoad:true,
    ckTipFalg:false,
    tipText:'',
    timeObj:null,
    searchRule:[]
  },
  onLoad: function (option) {
    this.setData({
      itemId: option.id,
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
        if (vm.data.fristLoad){
          vm.getUnits();
          vm.getShopData();
        }
        vm.data.fristLoad=false;
      }
    })
    //将选择的规格值插入规格数组
    wx.getStorage({
      key: 'currentSelectRule',
      success: function (res) {
        if (res.data.currentSelectRule.kid) {
          console.log(vm.data.currentRule);
          vm.data.ruleData[vm.data.currentRule] = res.data.currentSelectRule;
          vm.setData({
            ruleData: vm.data.ruleData
          })
          vm.formatRuleFlag();
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
  getShopData: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getItemInfo', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        itemId: vm.data.itemId
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
          vm.setData({
            shopName: res.data.data.itemname,
            shopName2: res.data.data.itemname,
            itemcode1: res.data.data.itemcategorycode1,
            itemcode2: res.data.data.itemcategorycode2,
            itemname1: res.data.data.itemcategoryname1,
            itemname2: res.data.data.itemcategoryname2,
            unitName1: res.data.data.assistantunit,
            unitName2: res.data.data.unit,
          })
          if (res.data.data.propertiesnamejson && res.data.data.propertiesnamejson.length>0)
          vm.formatRuleData(JSON.parse(res.data.data.propertiesnamejson));
        }
      }, error: function (res) {
      }
    })
  },
  formatRuleData:function(data){
    var ruleData = []
    var searchRule = []
    for(var i=0;i<data.length;i++){
      var item1 = {};
      item1.kid = data[i].kid;
      item1.k = data[i].k;
      searchRule.push(item1);
      for(var h=0;h<data[i].value.length;h++){
        var item={};
        item.kid = data[i].kid;
        item.k = data[i].k;
        item.vid = data[i].value[h].vid;
        item.v = data[i].value[h].v;
        ruleData.push(item)
      }
    }
    console.log(ruleData);
    this.setData({
      ruleData: ruleData,
      searchRule: searchRule
    })
    this.formatRuleFlag();
    wx.setStorage({
      key: "selectRule",
      data: {
        selectRuleData: ruleData
      }
    })
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
  selectFLagFormat: function () {
    for (var i = 0; i < this.data.unitTotal.length; i++) {
      this.data.unitSelectFlag1.push(false);
      this.data.unitSelectFlag2.push(false);
    }
    this.setData({
      unitSelectFlag1: this.data.unitSelectFlag1,
      unitSelectFlag2: this.data.unitSelectFlag2
    })
  },
  unitSelectOne: function () {
    if (this.data.unitFlag1) {
      this.setData({
        unitFlag1: false
      })
    } else {
      this.setData({
        unitFlag1: true
      })
    }
    for (var i = 0; i < this.data.unitTotal.length; i++) {
      if (this.data.unitName1 == this.data.unitTotal[i].unitname){
        this.data.unitSelectFlag1[i] = true;
      }else{
        this.data.unitSelectFlag1[i] = false;
      }
    }
    this.setData({
      unitSelectFlag1: this.data.unitSelectFlag1
    })
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
    for (var i = 0; i < this.data.unitTotal.length; i++) {
      if (this.data.unitName2 == this.data.unitTotal[i].unitname ) {
        this.data.unitSelectFlag2[i] = true;
      } else {
        this.data.unitSelectFlag2[i] = false;
      }
    }
    this.setData({
      unitSelectFlag2: this.data.unitSelectFlag2
    })
  },
  unitSelect1: function (event) {
    var unitId = event.currentTarget.dataset.id;
    var unitName = event.currentTarget.dataset.unitname;
    var index = parseInt(event.currentTarget.dataset.index);
    console.log(index);
    for (var i = 0; i < this.data.unitSelectFlag1.length; i++) {
      this.data.unitSelectFlag1[i] = false;
    }
    this.data.unitSelectFlag1[index] = true;
    this.setData({
      unitId1: unitId,
      unitName1: unitName,
      unitFlag1: false,
      unitSelectFlag1: this.data.unitSelectFlag1
    })
    
  },
  unitSelect2: function (event) {
    var unitId = event.currentTarget.dataset.id;
    var unitName = event.currentTarget.dataset.unitname;
    var index = parseInt(event.currentTarget.dataset.index);
    for (var i = 0; i < this.data.unitSelectFlag2.length; i++) {
      this.data.unitSelectFlag2[i] = false;
    }
    this.data.unitSelectFlag2[index] = true;
    this.setData({
      unitId2: unitId,
      unitName2: unitName,
      unitFlag2: false,
      unitSelectFlag2: this.data.unitSelectFlag2
    })
  },
  addRule: function () {
    this.data.ruleData.push({});
    this.setData({
      ruleData: this.data.ruleData
    })
    console.log(this.data.ruleData);
  },
  ruleJumpLink: function (event) {
    var index = parseInt(event.currentTarget.dataset.index);
    this.setData({
      currentRule: index
    })

    if (this.data.searchRule.length > 0) {
      this.data.searchRule = JSON.stringify(this.data.searchRule);
      console.log(this.data.searchRule);
      console.log(1);
      wx.navigateTo({
        url: '../selectSpecification/selectSpecification?skuproperty=' + this.data.searchRule,
      })
    } else {
      wx.navigateTo({
        url: '../selectSpecification/selectSpecification',
      })
    }
  },
  bindKeyShopName: function (e) {
    this.setData({
      shopName: e.detail.value
    })
  },
  selectShopFlag: function (e) {
    var itemVal = e.detail.value
    if (itemVal.length == 0) {
      return;
    } else {
      if (this.data.shopName2 == itemVal){
        return;
      }
      var vm = this;
      var url = app.globalData.url;
      wx.request({
        url: url + 'base/isExistItem', //仅为示例，并非真实的接口地址
        data: {
          openId: vm.data.openId,
          itemname: itemVal,
          type: 1
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
            if (res.data.data.id) {
              vm.setData({
                shopHavedTip: true,
                shopItemHaved: res.data.data
              })

            }
          }

        }, error: function (res) {
        }
      })
    }
  },
  cancelHavedTip: function () {
    this.setData({
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
      success: function () {
        console.log(vm.data.shopItemHaved);
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },
  saveShopFormat: function () {
    var data = {}
    data.openId = this.data.openId;
    data.itemId = this.data.itemId;
    data.itemtypecode = this.data.itemcode2;
    data.itemname = this.data.shopName;
    data.assistantunit = this.data.unitName1;
    data.unit = this.data.unitName2;
    data.type = 0;
    data.propertiesId = '';
    var propertiesId = '';
    var itemspecifications = '';
    console.log(this.data.ruleData);
    for (var i = 0; i < this.data.ruleData.length; i++) {
      if (this.data.ruleData[i].kid) {
        if (propertiesId.indexOf(this.data.ruleData[i].kid)>=0){
          //propertiesId = this.insertFlg(propertiesId, this.data.ruleData[i].kid, propertiesId.indexOf(this.data.ruleData[i].kid));
          propertiesId = propertiesId.substr(0, propertiesId.indexOf(this.data.ruleData[i].kid) + this.data.ruleData[i].kid.length + 1) + this.data.ruleData[i].vid + '|' + propertiesId.substr(propertiesId.indexOf(this.data.ruleData[i].kid) + this.data.ruleData[i].kid.length + 1, propertiesId.length-1);  
        }else{
          propertiesId = propertiesId + this.data.ruleData[i].kid + ':' + this.data.ruleData[i].vid +';';
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
    if (data.itemtypecode.length==0){
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
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/editItem', //仅为示例，并非真实的接口地址
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
          wx.navigateBack({
            delta: 1
          })
        }else{
          this.showTips(res.data.message);
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
    var vm=this;
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
        vm.formatRuleFlag();
        wx.setStorage({
          key: "selectRule",
          data: {
            selectRuleData: selectRuleData
          }
        })
      }
    })
  },
  cancelBack:function(){
    wx.navigateBack({
      delta:1
    })
  },
  formatRuleFlag: function () {
    
    for (var i = 0; i < this.data.ruleData.length; i++) {
      var _length=0;
      for (var h = 0; h < this.data.ruleData.length; h++) {
        if (this.data.ruleData[i].kid == this.data.ruleData[h].kid){
          _length++;
        }
      }
      if (_length>=2){
        this.data.ruleData[i].flag=true;
      }else{
        this.data.ruleData[i].flag = false;
      }
    }
    this.setData({
      ruleData: this.data.ruleData
    })
    console.log(this.data.ruleData)
  }
})
