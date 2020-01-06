//index.js
//获取应用实例
const app = getApp()
import common from "../../common/js/common.js";
Page({
  data: {
    openId: "",
    eId: '',
    orgno: '',
    organizationid:'',
    shopSelectFlag: [[false, false]],//商品选择数组
    companyFlag: [false],//公司商品全选数组
    allFlag: false,//所有商品选择
    numberArray: [[1, 1]],
    deleteShowFlag: [[false, false]],//商品选择数组
    clientX: '',
    clientY: '',
    carShopData: [],//购物车商品列表
    itemIndex: 0,
    listJson: [],

    totalOrder: 0,
    totalPrice: 0,

    currentShopData: {},
    currentIndex:[],
    collectShowFlag: false,
    collectText:'',
    collectId:'',
    collectStatus:'',

    specialShowFlag: false,

    timeShowFlag:false,
    dateList:[],
    dates: [],
    hours: 
      [
      '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', 
      '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'
      ],
    minutes: 
      [
      '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', 
      '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', 
      '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', 
      '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', 
      '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', 
      '50', '51', '52', '53', '54', '55', '56', '57', '58', '59',
      ],
    selectDate: '',//收获日期

    orderShopData: [],//下单列表
    orderShopData2: [],//下单列表
    remarkList:[],

    tipFalg: false,
    tipText: '',
    timeOutObj: null,

    orderRedCount:0,
    footerData: {
      number: 0,
      orderRedCount:0,
      status: 2,
      zindex:2
    },

    windowHeight:0,
    tempQty:'',
    isLoad:false,
  },
  onReady: function () {

  },
  onShow: function () {
    var vm = this;
    wx.getSystemInfo({
      success: function(res) {vm.setData({windowHeight:res.windowHeight})},
    })
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        wx.getStorage({
          key: 'userInfo',
          success: function (res) {
            vm.setData({ organizationid: res.data.user.organizationid, orgno: res.data.user.orgno })
            console.log(res.data);
            app.getRedCount(vm.data.eId, vm.data.orgno, vm.data.openId);
          }
        });
      }
    });
    this.getOrderList();

  },
  initData: function () {
  },
  getOrderList: function () {
    var vm = this;
    wx.getStorage({
      key: 'userShopCart',
      success: function (res) {
        console.log(123);
        console.log(res.data);
        for (var i = 0; res.data.length; i++) {
          if (res.data[i].openId == vm.data.openId) {
            var total = 0;
            for (var j = 0; j < res.data[i].shopList.length; j++) {
              total += res.data[i].shopList[j].shopList.length;
            }
            for (var k = 0; k < res.data[i].shopList.length;k++){
              res.data[i].shopList[k].isSelected = true;
              for (var l = 0; l < res.data[i].shopList[k].shopList.length;l++){
                res.data[i].shopList[k].shopList[l].isSelected = true;
              }
            }
            vm.setData({ carShopData: res.data[i].shopList, footerData: { number: total, status: 2, zindex: 2 }, orderRedCount: vm.data.orderRedCount });
            vm.isAll();
            break;
          }
        }
      }
    })
    console.log(1);
    console.log(this.data.carShopData);
  },
  
  allChoose: function (event) {//全选按钮
    var carShopData = this.data.carShopData;
    for (var i = 0; i < carShopData.length; i++) {
      carShopData[i].isSelected = !this.data.allFlag;
      for (var j = 0; j < carShopData[i].shopList.length; j++) {
        carShopData[i].shopList[j].isSelected = !this.data.allFlag;
      }
    }
    this.setData({ allFlag: !this.data.allFlag, carShopData: carShopData });
    this.isAll();
  },
  companyAllSelect: function (event) {//公司全选按钮
    var index = event.currentTarget.dataset.index;
    var carShopData = this.data.carShopData;
    carShopData[index].isSelected = carShopData[index].isSelected == undefined ? true : !carShopData[index].isSelected;
    for (var i = 0; i < carShopData[index].shopList.length; i++) {
      carShopData[index].shopList[i].isSelected = carShopData[index].isSelected;
    }
    this.setData({ carShopData: carShopData })
    this.isAll();
  },

  shopSelect: function (event) {//商品选择按钮
    var carShopData = this.data.carShopData;
    var index = event.currentTarget.dataset.index;
    var index2 = event.currentTarget.dataset.itemsIndex;
    carShopData[index].shopList[index2].isSelected = carShopData[index].shopList[index2].isSelected == undefined ? true : !carShopData[index].shopList[index2].isSelected;
    carShopData[index].isSelected = this.isCompanyAll(index);
    this.setData({ carShopData: carShopData })
    this.isAll();
  },

  previewImage: function (e) {
    var photoPath = e.currentTarget.dataset.url;
    if (photoPath == undefined || photoPath == '') {
      photoPath = 'http://member.gdskx.com:90/sso-server/images/logo.png';
    }
    wx.previewImage({
      urls: [photoPath],
    })
  },

  isAll: function () {
    var carShopData = this.data.carShopData;
    var orderShopData = [];
    var orderShopData2 = [];
    var remarkList = [];
    var isAll = true;
    var totalOrder = 0;
    var totalPrice = parseFloat(0).toFixed(2);

    var isAllEmtry = true;
    for(var i = 0;i<carShopData.length;i++){
      if(carShopData[i].shopList.length!=0){
        isAllEmtry = false;
        break;
      }
    }
    this.setData({ isAllEmtry: isAllEmtry })
    if(isAllEmtry==true){
      isAll = false;
    }else{
      for (var i = 0; i < carShopData.length; i++) {
        if (carShopData[i].shopList.length > 0) {
          if (carShopData[i].isSelected == undefined || carShopData[i].isSelected == false) {
            isAll = false;
            break;
          } else {
            if (i == carShopData.length - 1) {
              isAll = true;
            }
          }
        }
      }
    }

    for (var i = 0; i < carShopData.length; i++) {
      carShopData[i].total = carShopData[i].shopList.length;
      if (carShopData[i].shopList.length != 0) {
        if (carShopData[i].remark != undefined && carShopData[i].remark!=''){
          //myMap.set(carShopData[i].companyId, carShopData[i].remark);
          var companyId = carShopData[i].companyId;
          var remark = { id: companyId, text: carShopData[i].remark}
          //var remark={};
          //remark[companyId] = carShopData[i].remark;
          remarkList.push(remark);
        }
        var company = {
          "id": carShopData[i].companyId,
          "name": carShopData[i].companyName,
          "txtNoteApply": carShopData[i].remark == undefined ? '' : carShopData[i].remark,
          "list": [],
        };

        for (var j = 0; j < carShopData[i].shopList.length; j++) {
          if (carShopData[i].shopList[j].isSelected == true) {
            var shop = {
              "itemId": carShopData[i].shopList[j].itemId,
              "itemId2": carShopData[i].shopList[j].itemnumber,
              "supplierId": carShopData[i].companyId,
              "propertiesId": carShopData[i].shopList[j].propertiesid,
              "qty": carShopData[i].shopList[j].qty,
              "price": carShopData[i].shopList[j].price,
              "assistantunit": carShopData[i].shopList[j].unit,
            };
            orderShopData2.push(shop);
            company.list.push(shop);
            totalOrder++;
            var price = parseFloat(parseFloat(carShopData[i].shopList[j].qty) * parseFloat(carShopData[i].shopList[j].price)).toFixed(2);
            totalPrice = (parseFloat(totalPrice) + parseFloat(price)).toFixed(2);
          }
        }
        orderShopData.push(company);
      }
    }
    if(remarkList.length==0)
      remarkList='';
    this.setData({ allFlag: isAll, totalOrder: totalOrder, totalPrice: totalPrice, orderShopData: orderShopData, orderShopData2: orderShopData2, remarkList: remarkList });
    this.modifyCart();
  },

  isCompanyAll: function (index) {
    var isCompanyAll = true;
    var carShopData = this.data.carShopData;

    if (carShopData[index].shopList.length == 0){
      isCompanyAll = false;
    } else {
      for (var i = 0; i < carShopData[index].shopList.length; i++) {
        if (carShopData[index].shopList[i].isSelected == undefined || carShopData[index].shopList[i].isSelected == false) {
          isCompanyAll = false;
          break;
        }
      }
    }
    return isCompanyAll;
  },

  jumpCompanyShop: function (e) {
    var index = e.currentTarget.dataset.index;
    var companyId = this.data.carShopData[index].companyId;
    app.globalData.jumpCompany = companyId;
    wx.switchTab({ url: '../../business/commodity/commodity' });
  },

  remarkInput: function (event) {
    var index = event.currentTarget.dataset.index;
    var carShopData = this.data.carShopData;
    carShopData[index].remark = event.detail.value;
    this.setData({ carShopData: carShopData })
    this.isAll();
  },
  clearInput: function (e) {
    var index = e.currentTarget.dataset.index;
    var carShopData = this.data.carShopData;
    carShopData[index].remark = '';
    this.setData({ carShopData: carShopData })
    this.isAll();
  },

  showShopInputDialog: function (event) {
    var vm = this;
    var index = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var currentShopData = vm.data.carShopData[index].shopList[index2];
    var currentIndex = [];
    currentIndex.push(index);
    currentIndex.push(index2);
    
    vm.setData({ specialShowFlag: true, currentShopData: currentShopData, currentIndex: currentIndex })
  },

  bindInput: function (event) {
    var vm = this;
    var index = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var value = event.detail.value;
    var carShopData = this.data.carShopData;
    if (value.charAt(0) == '.') {
      vm.setData({ carShopData: vm.data.carShopData });
      return
    }
    var pattern = /^(0|[1-9][0-9]*|[1-9]\d*[.]?\d{0,2}|[0][.]\d?[1-9]?)$/;
    if (value != '' && !pattern.test(value)) {
      vm.setData({ carShopData: vm.data.carShopData });
      return
    }
    if (value != '' && value != '0' && value.charAt(value.length - 1) != '.') {
      carShopData[index].shopList[index2].qty = parseFloat(value);
      this.setData({ carShopData: carShopData })
      this.modifyCart();
    }
    this.isAll();
  },

  bindFocus: function (event) {
    var vm = this;
    var index = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var carShopData = this.data.carShopData;
    this.setData({ tempQty: carShopData[index].shopList[index2].qty })
    carShopData[index].shopList[index2].qty = undefined;
    this.setData({ carShopData: carShopData })
  },

  bindBlur: function (event) {
    var vm = this;
    var index = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var value = event.detail.value;
    var carShopData = this.data.carShopData;
    if ( value == '0') {
      carShopData[index].shopList[index2].qty = 0;
      vm.setData({ carShopData: carShopData })
      vm.modifyCart();
    } else if (value == '') {
      carShopData[index].shopList[index2].qty = vm.data.tempQty;
      vm.setData({ carShopData: carShopData })
    } else if (value.charAt(value.length - 1) == '.') {
      vm.setData({ carShopData: vm.data.carShopData });
    } else {
      carShopData[index].shopList[index2].qty = parseFloat(carShopData[index].shopList[index2].qty).toFixed(2);
      vm.setData({ carShopData: carShopData })
      vm.modifyCart();
    }
    this.isAll();
  },

  updateShopNumber: function () {
    var vm = this;
    var carShopData = vm.data.carShopData;
    var currentShopData = vm.data.currentShopData;
    var currentIndex = vm.data.currentIndex;
    carShopData[currentIndex[0]].shopList[currentIndex[1]].qty = currentShopData.qty;
    this.setData({ carShopData: carShopData })
    this.modifyCart();
    vm.setData({
      currentShopData: '',
      currentIndex: [],
      specialShowFlag: false,
    });
  },

  specialAdd: function () {//规格弹窗中的增加按钮
    var currentShopData = this.data.currentShopData;
    currentShopData.qty = parseFloat(currentShopData.qty) + 1;
    this.setData({ currentShopData: currentShopData });
  },

  specialMinus: function () {//规格弹窗中的减少按钮
    var currentShopData = this.data.currentShopData;
    if (currentShopData.qty >= 1) {
      currentShopData.qty = parseFloat(currentShopData.qty) - 1;
      this.setData({ currentShopData: currentShopData });
    }
  },

  closeBg: function () {
    this.setData({
      currentShopData: '',
      currentIndex: [],
      specialShowFlag: false,
      collectShowFlag: false,
      timeShowFlag:false,
      isLoad:false,
    })
    this.changeZindex();
  },

  delNumber: function (event) {
    var index = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var carShopData = this.data.carShopData;
    if (carShopData[index].shopList[index2].qty >= 1) {
      carShopData[index].shopList[index2].qty = (parseFloat(carShopData[index].shopList[index2].qty) - 1).toFixed(2);
      this.setData({ carShopData: carShopData })
      this.modifyCart();
      this.isAll();
    }
  },
  addNumber: function (event) {
    var index = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var carShopData = this.data.carShopData;
    carShopData[index].shopList[index2].qty = (parseFloat(carShopData[index].shopList[index2].qty) + 1).toFixed(2);
    this.setData({ carShopData: carShopData })
    this.modifyCart();
    this.isAll();
  },
  deleteShop: function (event) {
    var index = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var carShopData = this.data.carShopData;
    carShopData[index].shopList.splice(index2, 1);
    carShopData[index].isSelected = this.isCompanyAll(index);
    this.setData({ carShopData: carShopData })
    this.modifyCart();
    
    this.isAll();
  },

  modifyCart: function () {
    var vm = this;
    var carShopData = vm.data.carShopData;
    var total = 0;
    for(var i = 0;i<carShopData.length;i++){
      total += carShopData[i].shopList.length;
    }
    vm.setTabBar(total);
    vm.setData({ footerData: { number: total, status: 2, zindex: 2, orderRedCount: vm.data.orderRedCount}});
    wx.getStorage({
      key: 'userShopCart',
      success: function (res) {
        var userCart = res.data;
        for (var i = 0; userCart.length; i++) {
          if (userCart[i].openId == vm.data.openId) {
            userCart[i].shopList = carShopData;
            wx.setStorage({
              key: 'userShopCart',
              data: userCart,
            })
            break;
          }
        }
      }
    })
  },

  deleteShowStart: function (event) {
    console.log(event);
    this.data.clientX = event.changedTouches[0].clientX;//滑动起始x
    this.data.clientY = event.changedTouches[0].clientY;//滑动起始y
  },
  deleteShowEnd: function (event) {
    console.log(event);
    var index = event.currentTarget.dataset.index;
    var index2 = event.currentTarget.dataset.itemsIndex;
    var carShopData = this.data.carShopData;
    console.log(event.changedTouches[0].clientX - this.data.clientX);
    if (Math.abs(this.data.clientX - event.changedTouches[0].clientX) >= 50 && Math.abs(this.data.clientY - event.changedTouches[0].clientY) <= 30) {
      carShopData[index].shopList[index2].isDelete = true;
    }
    if ((this.data.clientX - event.changedTouches[0].clientX) <= -50) {
      carShopData[index].shopList[index2].isDelete = false;
    }
    this.setData({ carShopData: carShopData });
    this.isAll();
  },
  
  jumpLink: function (event) {
    var vm = this;
    var url = event.currentTarget.dataset.url;
    wx.redirectTo({ url: url });
  },
  
  comfireCar: function () {
    this.setData({ timeShowFlag: false});
    wx.showLoading({
      title: '加载中',
    });
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/purchasereq/savePurchasereq', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        DeptId: vm.data.organizationid,
        itemJson: vm.data.orderShopData2,
        deliveryDate: vm.data.selectDate,
        templateId:'',
        source:'wx',
        biztype:0,
        TxtNoteApply:vm.data.remarkList,
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
        wx.hideLoading();
        if(res.data.code=='1'){
          vm.afterOrderDelete();
          wx.showToast({
            title: '下单成功',
          });
          vm.data.isLoad = false;
          setTimeout(function(){
            var vm = this;
            var url = '../../business/purchaseOrder/purchaseOrder';
            wx.switchTab({ url: url });
          },500);
        } else {
          vm.data.isLoad = false;
          vm.showTips(res.data.message);
        }
        

      }, fail: function (res) {
        vm.data.isLoad = false;
        wx.hideLoading();
        vm.showTips("请求失败");
        console.log(res);
      }
    })
  },
  afterOrderDelete:function(){
    var orderShopData = this.data.orderShopData;
    var orderShopData2 = this.data.orderShopData2;
    var carShopData = this.data.carShopData;
    var indexList = [];
    for(var i =0; i<orderShopData2.length; i++){
      for (var j = 0; j < carShopData.length; j++){
        var isBreak = false;
        for (var k = 0; k < carShopData[j].shopList.length;k++){
          if (carShopData[j].shopList[k].itemId == orderShopData2[i].itemId){
            isBreak = true;
            carShopData[j].shopList.splice(k,1);
          }
        }
        if (isBreak) { break;}
      }
    }
    
    for(var i = 0;i<carShopData.length;i++){
      carShopData[i].remark = '';
      if(carShopData[i].shopList.length==0){
        carShopData[i].isSelected = false;
      }
    }

    orderShopData = [];
    orderShopData2 = [];
    this.setData({ carShopData: carShopData, orderShopData: orderShopData, orderShopData2: orderShopData2 });
    this.modifyCart();
    this.isAll();
  },

  collectShop: function () {//收藏商品
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/keepItem', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        id: vm.data.collectId,
        keepStatus: vm.data.collectStatus
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
          vm.changeCollectStatus();
          wx.showToast({
            title: vm.data.collectStatus == 0 ? "取消收藏成功" : "收藏成功",
          });
        } else {
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
        console.log(res);
        wx.showToast({
          title: vm.data.collectStatus == 0 ? "取消收藏失败" : "收藏失败",
        });
      }
    })
  },

  check0shop:function(){
    var vm = this;
    var is0shop = false;
    var orderShopData2 = vm.data.orderShopData2;
    for (var i = 0; i < orderShopData2.length;i++){
      if (orderShopData2[i].qty==0){
        is0shop = true;
        break;
      }
    }
    return is0shop;
  },

  showTimeDialog:function(){
    if(!this.data.isLoad){
      this.data.isLoad = true;
      var vm = this;
      if (this.data.orderShopData2.length == 0) {
        this.showTips('请选择商品');
        this.data.isLoad = false;
        return;
      }
      if (vm.check0shop()) {
        this.showTips('存在数量为0的商品无法下单');
        this.data.isLoad = false;
        return;
      }
      var date = new Date();
      var dateList = [];
      var dateList2 = [];
      for (var i = 0; i < 30; i++) {
        date.setDate(date.getDate() + 1);;
        dateList2.push(date.getTime());
        dateList.push((date.getMonth() + 1) + '月' + date.getDate() + '日')
      }
      this.setData({ timeShowFlag: true, dateList: dateList2, dates: dateList, selectDate: vm.format(dateList2[0]) + ' 09:00' })
      this.changeZindex();
    }
  },
  
  bindDateChange: function (event) {
    var selectDate = this.format(this.data.dateList[event.detail.value[0]])
      + ' ' 
      + this.data.hours[event.detail.value[1]] + ':'
      + this.data.minutes[event.detail.value[2]]
    this.setData({ selectDate: selectDate })
    console.log(this.data.selectDate);
  },

  format: function (fmt) { //author: meizz 
    var vm = this;
    var date = new Date(fmt);//当前时间  
    var month = vm.zeroFill(date.getMonth() + 1);//月  
    var day = vm.zeroFill(date.getDate());//日  
    var hour = vm.zeroFill(date.getHours());//时  
    var minute = vm.zeroFill(date.getMinutes());//分  
    var second = vm.zeroFill(date.getSeconds());//秒  

    //当前时间  
    var curTime = date.getFullYear() + "-" + month + "-" + day;

    return curTime;
  },
  /** 
 * 补零 
 */
  zeroFill: function (i) {
    if (i >= 0 && i <= 9) {
      return "0" + i;
    } else {
      return i;
    }
  },

  showCollectDialog: function (event) {//显示收藏窗口
    var carShopData = this.data.carShopData;
    var index1 = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var currentIndex = [];
    currentIndex.push(index1);
    currentIndex.push(index2);
    var collectId = carShopData[index1].shopList[index2].itemId;
    var collectStatus = carShopData[index1].shopList[index2].keepStatus==0?1:0;
    var collectText = carShopData[index1].shopList[index2].keepStatus==0?'收藏':'取消收藏';
    this.setData({ currentShopData: carShopData[index1].shopList[index2], collectShowFlag: true, collectText: collectText, currentIndex: currentIndex, collectId: collectId, collectStatus: collectStatus });
    this.changeZindex();
  },

  showCollectDialog2: function (event) {
    var carShopData = this.data.carShopData;
    var index1 = event.currentTarget.dataset.indexone;
    var index2 = event.currentTarget.dataset.indextwo;
    var currentIndex = [];
    currentIndex.push(index1);
    currentIndex.push(index2);
    var collectId = carShopData[index1].shopList[index2].itemId;
    var collectStatus = carShopData[index1].shopList[index2].keepStatus == 0 ? 1 : 0;
    this.setData({ currentIndex: currentIndex, collectId: collectId, collectStatus: collectStatus });
    this.collectShop();
  },

  changeCollectStatus: function () {
    var carShopData = this.data.carShopData;
    var currentIndex = this.data.currentIndex;
    carShopData[currentIndex[0]].shopList[currentIndex[1]].keepStatus = carShopData[currentIndex[0]].shopList[currentIndex[1]].keepStatus==0?1:0;
    this.setData({ carShopData: carShopData });
    this.modifyCart();
    this.hideCollectDialog();
    wx.hideLoading();
  },

  hideCollectDialog: function (event) {//显示收藏窗口
    this.setData({ isLoad:false,collectShowFlag: false, timeShowFlag:false,currentShopData:'',currentIndex:[] });
    this.changeZindex();
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

  changeZindex: function () {
    var footerData = this.data.footerData;
    var collectShowFlag = this.data.collectShowFlag;
    var timeShowFlag = this.data.timeShowFlag;
    timeShowFlag
    var is2 = collectShowFlag || timeShowFlag ? 0 : 2;
    footerData.zindex = is2;
    this.setData({ footerData: footerData });
  },

  getRedCount: function () {
    var vm = this;
    var url = app.globalData.url;
    var footerData = vm.data.footerData;
    wx.request({
      url: url + 'permission/getUserPermission',
      data: {
        openId: vm.data.openId,
        type: 1
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
        if (res.data.code == '1') {
          for (var i of res.data.data) {
            if (i.name == '采购管理') {
              for (var j of i.childerList) {
                if (j.url == 'SKX_MODULE_00001') {
                  var redCount = j.totalNumMap["3"];
                  footerData.orderRedCount = redCount;
                  vm.setData({ footerData: footerData });
                  console.log(redCount);
                }
              }
            }
          }
        }
      },
      error: function (res) {
        console.log(321);
      }
    })
  },

  setTabBar: function (total) {
    if (total > 0) {
      wx.setTabBarBadge({
        index: 1,
        text: total.toString(),
        success: function (res) {
          console.log("setTabBarBadge--success");
        },
        fail: function (res) {
          console.log("setTabBarBadge--fail");
        }
      })
    } else {
      wx.removeTabBarBadge({
        index: 1,
        success: function (res) {
          console.log("removeTabBarBadge--success");
        },
        fail: function (res) {
          console.log("removeTabBarBadge--fail");
        }
      })
    }
  },
})
