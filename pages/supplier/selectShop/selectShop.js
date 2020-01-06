//index.js
//获取应用实例
const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    orderStatu: '',
    openId: "",
    eId: '',
    orgno: '',
    categoryId: '',
    word:'',
    shopData: [],
    shopType: [],
    shopTypeFlag: [],
    searchFlag: false,
    currentItemType: 0,
    deleteTipFlag: false,
    itemId: '',
    propertiesId: '',
    itemcode1: '',
    itemname1: '',
    showShopFlag:false,
    shopDetail:'',
    ruleDataFlag:[],
    ruleData:[],
    addRuleFLag:true,
    ruleValue:'',
    shopShowFlag:true,
    ckTipFalg: false,
    tipText: '',
    timeObj: null,
    loading: false,
    searchButFlag:true
  },
  onShow: function () {
    var vm = this;
   
    wx.getStorage({
      key: 'currentSelectRule',
      success: function (res) {
        console.log(res);
        if (res.data.currentSelectRule.kid) {
          vm.addRuleData(res.data.currentSelectRule);
        } 
      }
    })
    wx.setStorage({
      key: "currentSelectRule",
      data: {
        currentSelectRule: {}
      }
    })
    wx.getStorage({
      key: 'shopItemHaved',
      success: function (res) {
        console.log(res);
        if (res.data.shopItemHaved.id) {
          if (res.data.shopItemHaved.propertiesnamejson == '') {
            res.data.shopItemHaved.propertiesnamejson = [];
          } else {
            res.data.shopItemHaved.propertiesnamejson = JSON.parse(res.data.shopItemHaved.propertiesnamejson);
          }
          vm.setData({
            showShopFlag: true,
            shopDetail: res.data.shopItemHaved
          })
          vm.formatDataFlag();
        }

      }
    })
    wx.setStorage({
      key: "shopItemHaved",
      data: {
        shopItemHaved: {}
      }
    })
  },
  onReady: function () {
    this.initData();
    var vm = this;
    this.data.firstLoad = false;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.orgno = res.data.orgno
        vm.getShopType();

      }
    })
    
    //清除新增商品已选规格缓存
    wx.setStorage({
      key: "selectRule",
      data: {
        selectRuleData: []
      }
    })
    
  },
  initData: function () {

  },
  getShopType: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getRootCategorys', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        type: 5
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'get',
      success: function (res) {
        console.log(res);
        if (res.data.code == '1') {
          vm.setData({
            shopType: res.data.data
          })
          vm.getShopData();
          vm.addFlagArray();
        }
      }, error: function (res) {
      }
    })
  },
  addFlagArray: function () {
    for (var i = 0; i < this.data.shopType.length; i++) {
      if (i == 0) {
        this.data.shopTypeFlag.push(true);
      } else {
        this.data.shopTypeFlag.push(false);
      }

    }
    this.setData({
      shopTypeFlag: this.data.shopTypeFlag
    })
  },
  getShopData: function () {
    var vm = this;
    var url = app.globalData.url;
    this.setData({
      itemcode1: vm.data.shopType[vm.data.currentItemType].id,
      itemname1: vm.data.shopType[vm.data.currentItemType].itemcategoryname
    })
    this.setData({
      loading: true
    })
    wx.request({
      url: url + 'base/getCategorysAndItems', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        categoryId: vm.data.shopType[vm.data.currentItemType].id,
        type: 5
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'get',
      success: function (res) {
        vm.setData({
          loading: false
        })
        console.log(res);
        if (res.data.code == '1') {
          vm.setData({
            shopData: res.data.data
          })
        }
      }, error: function (res) {
      }
    })
  },
  deleteShopDataTip: function (event) {
    var itemId = event.currentTarget.dataset.itemid;
    var propertiesId = event.currentTarget.dataset.propertiesid;
    this.setData({
      itemId: itemId,
      propertiesId: propertiesId,
      deleteTipFlag: true
    })
  },
  deleteShopData: function () {
    this.setData({
      deleteTipFlag: false
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/deleteItem', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        itemId: vm.data.itemId,
        propertiesId: vm.data.propertiesId
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
          vm.getShopData();
        }
      }, error: function (res) {
      }
    })
  },
  showSearchBox: function () {
    if (this.data.searchFlag) {
      this.setData({
        searchFlag: false
      })
    } else {
      this.setData({
        searchFlag: true
      })
    }
  },
  changeItemcategory: function (event) {
    var index = event.currentTarget.dataset.index;
    var itemcode1 = event.currentTarget.dataset.itemcodeone;
    var itemname1 = event.currentTarget.dataset.itemnameone;
    for (var i = 0; i < this.data.shopTypeFlag.length; i++) {
      if (i == index) {
        this.data.shopTypeFlag[i] = true;
      } else {
        this.data.shopTypeFlag[i] = false;
      }

    }
    this.setData({
      itemcode1: itemcode1,
      itemname1: itemname1,
      shopTypeFlag: this.data.shopTypeFlag,
      currentItemType: index
    })
    this.getShopData();
  },
  cancelTip: function () {
    this.setData({
      deleteTipFlag: false  
    })
  },
  addGoods: function(event){
    var itemcode2 = event.currentTarget.dataset.itemcodetwo;
    var itemname2 = event.currentTarget.dataset.itemnametwo;
    wx.navigateTo({ url: '../newGoods/newGoods?itemcode1=' + this.data.itemcode1 + '&itemname1=' + this.data.itemname1 + '&itemcode2=' + itemcode2 + '&itemname2=' + itemname2});
  },
  selectShop: function (event) {
    this.setData({
      ruleData:[],
      ruleDataFlag:[],
      addRuleFLag:true,
      showShopFlag:true
    })
    var itemid = event.currentTarget.dataset.id;
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/getItemInfo', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        itemId: itemid
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
          if (res.data.data.propertiesnamejson==''){
            res.data.data.propertiesnamejson=[];
          }else{
            res.data.data.propertiesnamejson=JSON.parse(res.data.data.propertiesnamejson);
          }
          vm.setData({
            shopDetail: res.data.data
          })
          vm.formatDataFlag();
        }
      }, error: function (res) {
      }
    })
  },
  formatDataFlag:function(){
    this.data.ruleDataFlag=[];
    var selectRule=[];
    for (var i = 0; i < this.data.shopDetail.propertiesnamejson.length;i++){
      this.data.ruleDataFlag.push([]);
      for (var h = 0; h < this.data.shopDetail.propertiesnamejson[i].value.length; h++) {
        var item={};
        item.k = this.data.shopDetail.propertiesnamejson[i].k;
        item.kid = this.data.shopDetail.propertiesnamejson[i].kid;
        item.v = this.data.shopDetail.propertiesnamejson[i].value[h].v;
        item.vid = this.data.shopDetail.propertiesnamejson[i].value[h].vid;
        selectRule.push(item);
      }
    }
    this.setData({
      ruleDataFlag: this.data.ruleDataFlag
    })
    wx.setStorage({
      key: "selectRule",
      data: {
        selectRuleData: selectRule
      }
    })
  },
  addRuleData: function (data) {
    data.select=true;
    console.log(this.data.shopDetail.propertiesnamejson);
    var _flag=true;
    for (var i = 0; i < this.data.shopDetail.propertiesnamejson.length; i++) {
      if (this.data.shopDetail.propertiesnamejson[i].k == data.k){
        _flag=false;
        this.data.shopDetail.propertiesnamejson[i].value.push(data);
      }
    }
    if (_flag){
      var item={};
      item.k = data.k;
      item.kid = data.kid;
      item.value = [];
      item.value.push(data);
      this.data.shopDetail.propertiesnamejson.push(item);
    }
    this.setData({
      shopDetail: this.data.shopDetail
    })
    this.formatDataFlag();
  },
  showAddRuleInput:function(){
    wx.navigateTo({
      url: '../selectSpecification/selectSpecification',
    })
  },
  hideRuleInput: function () {
    this.setData({
      addRuleFLag: true
    })
  },
  addRuleItem: function () {
    if (this.data.ruleValue && this.data.ruleValue.length != 0) {
      var flag = false;
      for (var i = 0; i < this.data.shopDetail.propertiesnamejson.length; i++) {
        if (this.data.shopDetail.propertiesnamejson.k == this.data.ruleValue) {
          flag = true;
        }
      }
      if (flag) {
        console.log("规格已存在")
      } else {
        var vm = this;
        var url = app.globalData.url;
        wx.request({
          url: url + 'base/addItemSkuProperty', //仅为示例，并非真实的接口地址
          data: {
            openId: vm.data.openId,
            k: vm.data.ruleValue,
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
            console.log(res);
            if (res.data.code == '1') {
              var item = {};
              item.kid = res.data.data.kid;
              item.k = res.data.data.k;
              item.value = [];
              vm.data.shopDetail.propertiesnamejson.push(item);
              vm.setData({
                ruleValue:'',
                addRuleFLag: true,
                shopDetail: vm.data.shopDetail
              })
              vm.data.ruleDataFlag.push([]);
            }
          }, error: function (res) {
          }
        })
      }
    }else{
      console.log("规格名不能为空")
    }
    
  },
  addRuleItemValue: function (event) {
    var searchRule=[];
    if (this.data.shopDetail.propertiesnamejson) {
      for (var i = 0; i < this.data.shopDetail.propertiesnamejson.length; i++) {
          var item = {};
          item.kid = this.data.shopDetail.propertiesnamejson[i].kid;
          item.k = this.data.shopDetail.propertiesnamejson[i].k;
          searchRule.push(item);
      }
    }
    if (searchRule.length>0){
      searchRule = JSON.stringify(searchRule);
      console.log(searchRule);
      console.log(1);
      wx.navigateTo({
        url: '../selectSpecification/selectSpecification?skuproperty=' + searchRule,
      })
    }else{
      wx.navigateTo({
        url: '../selectSpecification/selectSpecification',
      })
    }
    
  },
  keyRuleValue: function (e) {
    this.setData({
      ruleValue:e.detail.value
    })
  },
  keyItemValue: function (e) {
    var index1 = e.currentTarget.dataset.index;
    var index2 = e.currentTarget.dataset.valIndex;
    this.data.ruleDataFlag[index1][index2] = e.detail.value;
    this.setData({
      ruleDataFlag: this.data.ruleDataFlag
    })
    console.log(this.data.ruleDataFlag);
  },
  comfireRuleValue: function (e) {
    var index1 = e.currentTarget.dataset.index;
    var index2 = e.currentTarget.dataset.valIndex;
    var ruleVal=this.data.ruleDataFlag[index1][index2];
    if (ruleVal && ruleVal.length!=0){
      var flag=false;
      for (var i = 0; i < this.data.shopDetail.propertiesnamejson[index1].value.length;i++){
        if (this.data.shopDetail.propertiesnamejson[index1].value[i].v == ruleVal){
          flag=true;
        }
      }
      if (flag){
        console.log("规格值已存在")
      }else{
        var vm = this;
        var url = app.globalData.url;
        wx.request({
          url: url + 'base/addItemSkuProperty', //仅为示例，并非真实的接口地址
          data: {
            openId: vm.data.openId,
            k: vm.data.shopDetail.propertiesnamejson[index1].k,
            kid: vm.data.shopDetail.propertiesnamejson[index1].kid,
            v: ruleVal,
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
            console.log(res);
            if (res.data.code == '1') {
              var item={};
              item.vid=res.data.data.vid;
              item.v = res.data.data.v;
              item.select = true;
              var item2 = {};
              item2.vid = res.data.data.vid;
              item2.v = res.data.data.v;
              item2.kid = res.data.data.kid;
              item2.k = res.data.data.k;
              
              vm.data.shopDetail.propertiesnamejson[index1].value.push(item);
              vm.setData({
                shopDetail: vm.data.shopDetail
              })
              var valArray = vm.data.ruleDataFlag[index1];
              if (valArray.length == 1) {
                vm.data.ruleDataFlag[index1] = []
              } else {
                vm.data.ruleDataFlag[index1] = valArray.splice(index2, 1);
              }
              vm.setData({
                ruleDataFlag: vm.data.ruleDataFlag
              })
            }
          }, error: function (res) {
          }
        })
      }
    }else{
      console.log("规格值不能为空")
    }
    this.setData({
      ruleDataFlag: this.data.ruleDataFlag
    })
  },
  deleteRuleValue:function(event){
    console.log(this.data.ruleDataFlag);
    var index1 = event.currentTarget.dataset.index;
    var index2 = event.currentTarget.dataset.valIndex;
    var valArray=this.data.ruleDataFlag[index1];
    if (valArray.length==1){
      this.data.ruleDataFlag[index1]=[]
    }else{
      this.data.ruleDataFlag[index1] = valArray.splice(index2, 1);
    }
    this.setData({
      ruleDataFlag: this.data.ruleDataFlag
    })
  },
  keyWord: function (e) {
    this.setData({
      searchButFlag: true
    })
    if (e.detail.value.length == 0) {
      this.setData({
        shopShowFlag: true
      })
    }
    this.data.word=e.detail.value
  },
  cancelSearchShop: function () {
    this.setData({
      word: '',
      searchButFlag:true,
      shopShowFlag: true
    })
  },
  searchShop: function () {
    if (this.data.word.length==0){
      console.log("请输入要搜索的商品名")
      return;
    }
    this.setData({
      loading: true
    })
    this.setData({
      searchButFlag: false,
      word: this.data.word
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/searchItems', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        word: vm.data.word,
        type: 5
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'get',
      success: function (res) {
        vm.setData({
          loading: false
        })
        console.log(res);
        if (res.data.code == '1') {
          vm.setData({
            shopShowFlag: false,
            shopData2: res.data.data
          })
        }
      }, error: function (res) {
      }
    })
  },
  saveItemValue: function (event) {
    var index = event.currentTarget.dataset.index;
    if (this.data.shopData2[index].propertiesnamejson == '') {
      this.data.shopData2[index].propertiesnamejson = [];
    } else {
      this.data.shopData2[index].propertiesnamejson = JSON.parse(this.data.shopData2[index].propertiesnamejson);
    }
    this.setData({
      showShopFlag:true,
      shopDetail: this.data.shopData2[index]
    })
    this.formatDataFlag();
  },
  closeShopDetail: function () {
    this.setData({
      showShopFlag: false
    })
  },
  keyInputAsunit: function (e) {
    this.data.shopDetail.assistantunit=e.detail.value;
    this.setData({
      shopDetail: this.data.shopDetail
    })
  },
  keyInputUnit: function (e) {
    this.data.shopDetail.unit = e.detail.value;
    this.setData({
      shopDetail: this.data.shopDetail
    })
  },
  saveShop:function(){
    var data = {}
    data.openId = this.data.openId;
    data.itemtypecode = this.data.shopDetail.itemcategorycode2;
    data.itemname = this.data.shopDetail.itemname;
    data.assistantunit = this.data.shopDetail.assistantunit;
    data.unit = this.data.shopDetail.unit;
    data.propertiesId = '';
    var propertiesId = '';
    var itemspecifications = '';
    var flag=false;
    var flagname='';
    if (this.data.shopDetail.propertiesnamejson){
      for (var i = 0; i < this.data.shopDetail.propertiesnamejson.length; i++) {
        var flag2=false;
        for (var h = 0; h < this.data.shopDetail.propertiesnamejson[i].value.length; h++) {
          if (this.data.shopDetail.propertiesnamejson[i].value[h].select){
            var item = {};
            item.kid = this.data.shopDetail.propertiesnamejson[i].kid;
            item.k = this.data.shopDetail.propertiesnamejson[i].k;
            item.vid = this.data.shopDetail.propertiesnamejson[i].value[h].vid;
            item.v = this.data.shopDetail.propertiesnamejson[i].value[h].v;
            this.data.ruleData.push(item);
            flag2=true;
          }
        }
        if (!flag2){
          flag=true;
          flagname = this.data.shopDetail.propertiesnamejson[i].k;
        }
      }
    }
    if (flag){
      this.showTips("请选择" + flagname);
      return;
    }
    console.log(this.data.ruleData);
    for (var i = 0; i < this.data.ruleData.length; i++) {
      if (propertiesId.indexOf(this.data.ruleData[i].kid)>=0){
        //propertiesId = this.insertFlg(propertiesId, this.data.ruleData[i].kid, propertiesId.indexOf(this.data.ruleData[i].kid));
        propertiesId = propertiesId.substr(0, propertiesId.indexOf(this.data.ruleData[i].kid) + this.data.ruleData[i].kid.length + 1) + this.data.ruleData[i].vid + '|' + propertiesId.substr(propertiesId.indexOf(this.data.ruleData[i].kid) + this.data.ruleData[i].kid.length + 1, propertiesId.length-1);  
      }else{
        propertiesId = propertiesId + this.data.ruleData[i].kid + ':' + this.data.ruleData[i].vid +';';
      }
      
    }
    for (var i = 0; i < this.data.ruleData.length; i++) {
      if (itemspecifications.indexOf(this.data.ruleData[i].k) >= 0) {
        //propertiesId = this.insertFlg(propertiesId, this.data.ruleData[i].kid, propertiesId.indexOf(this.data.ruleData[i].kid));
        itemspecifications = itemspecifications.substr(0, itemspecifications.indexOf(this.data.ruleData[i].k) + this.data.ruleData[i].k.length + 1) + this.data.ruleData[i].v + '|' + itemspecifications.substr(itemspecifications.indexOf(this.data.ruleData[i].k) + this.data.ruleData[i].k.length + 1, itemspecifications.length - 1);
      } else {
        itemspecifications = itemspecifications + this.data.ruleData[i].k + ':' + this.data.ruleData[i].v + ';';
      }

    }
    data.propertiesId = propertiesId;
    data.itemspecifications = itemspecifications;
    if (data.itemtypecode.length == 0) {
      this.showTips("请选择商品类型");
      return;
    }
    if (data.itemname.length == 0) {
      this.showTips("请填写商品名称");
      return;
    }
    if (data.unit.length == 0) {
      this.showTips("请填写验收单位");
      return;
    }
    console.log(JSON.stringify(data));
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/saveItem', //仅为示例，并非真实的接口地址
      data: data,
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId 
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        if(res.data.code=='1'){
          vm.setData({
            showShopFlag:false
          })
          wx.showToast({
            title: '添加成功',
            icon: 'success',
            duration: 1500
          })
        }else{
          vm.setData({
            showShopFlag: false
          })
          vm.showTips(res.data.message);
        }
        
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
  selectValue: function (event) {
    var indexone = event.currentTarget.dataset.indexone;
    var indextwo = event.currentTarget.dataset.indextwo;
    if (this.data.shopDetail.propertiesnamejson[indexone].value[indextwo].select){
      this.data.shopDetail.propertiesnamejson[indexone].value[indextwo].select = false;
    }else{
      this.data.shopDetail.propertiesnamejson[indexone].value[indextwo].select = true;
    }
    this.setData({
      shopDetail: this.data.shopDetail
    })
  },
  backUpPage: function (event) {
    wx.navigateBack({
      delta:1
    })
  }
})
