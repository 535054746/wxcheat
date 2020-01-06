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
    priceData:[],
    startTime: '',
    endTime: '',
    currentDateFlag: '',
    saveFlag:false,
    timeFlag:false,
    currentStartTime:'',
    setPriceTipFlag:false,
    updataTimeFlag:false,
    setTimeFlag:false,
    timeData:null,
    companyName:'',
    loading: false,
    noDataTipFlag:false,
    loading: false,
    ckTipFalg: false,
    timeObj: null,
    tipText: ''
  },
  onReady: function () {
    this.setData({
      currentStartTime:this.format2(new Date())
    })
  },
  onShow: function (option) {
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.data.orgno = res.data.orgno;
        vm.data.companyName = res.data.companyName;
        vm.getPriceList();
      }
    })
    wx.setStorage({
      key: 'selectShopItem',
      data: []
    })
  },
  initData: function () {
    
  },
  getPriceList: function () {
    var vm = this;
    var url = app.globalData.url;
    this.setData({
      loading: true
    })
    wx.request({
      url: url + 'base/getPricePlanList', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId
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
        if (res.data.code == '1') {
          vm.formatData(res.data.data);
          console.log(res);
        }
      }, error: function (res) {
      }
    })
  },
  formatData: function (data) {
    var vm = this;
    for (var i = 0; i < data.length; i++) {
      if (data[i].default){
        if (data[i].default.startPeriod){
          data[i].default.startPeriod = vm.format(new Date(data[i].default.startPeriod));
        }else{
          data[i].default.startPeriod = null;
        }
        if (data[i].default.endPeriod) {
          data[i].default.endPeriodNum = parseInt(data[i].default.endPeriod);
          data[i].default.endPeriodData = vm.format2(new Date(data[i].default.endPeriod));
          data[i].default.endPeriod = vm.format(new Date(data[i].default.endPeriod));
          data[i].default.currentDataTime = parseInt(new Date().getTime());
          data[i].default.currentData = vm.format2(new Date());
          console.log(data[i].default.endPeriodNum)
          console.log(data[i].default.currentDataTime)
        } else {
          data[i].default.endPeriod = null;
        }
        
      }
      if (data[i].next) {
        if (data[i].next.startPeriod) {
          data[i].next.startPeriod = vm.format(new Date(data[i].next.startPeriod));
        }else{
          data[i].next.startPeriod = null;
        }
        if (data[i].next.endPeriod) {
          data[i].next.endPeriod = vm.format(new Date(data[i].next.endPeriod));
        } else {
          data[i].next.endPeriod = null;
        }
      }
    }
    if (data.length==0){
      this.setData({
        noDataTipFlag:true
      });
    }else{
      this.setData({
        noDataTipFlag: false
      });
    }
    this.setData({
      priceData: data
    });
  },
  format: function (fmt) { //author: meizz 
    var vm = this;
    var date = fmt;//当前时间  
    var month = vm.zeroFill(date.getMonth() + 1);//月  
    var day = vm.zeroFill(date.getDate());//日  
    var hour = vm.zeroFill(date.getHours());//时  
    var minute = vm.zeroFill(date.getMinutes());//分  
    var second = vm.zeroFill(date.getSeconds());//秒  

    //当前时间  
    var curTime = date.getFullYear() + "/" + month + "/" + day;
      //+ " " + hour + ":" + minute;//+ ":" + second;

    return curTime;
  },
  format2: function (fmt) { //author: meizz 
    var vm = this;
    var date = fmt;//当前时间  
    var month = vm.zeroFill(date.getMonth() + 1);//月  
    var day = vm.zeroFill(date.getDate());//日  
    var hour = vm.zeroFill(date.getHours());//时  
    var minute = vm.zeroFill(date.getMinutes());//分  
    var second = vm.zeroFill(date.getSeconds());//秒  

    //当前时间  
    var curTime = date.getFullYear() + "-" + month + "-" + day;
    //+ " " + hour + ":" + minute;//+ ":" + second;

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
  clickJumpDetail: function (event) {
    var orderId = event.currentTarget.dataset.id;
    //var createtime = event.currentTarget.dataset.createtime;
    //var ordercode = event.currentTarget.dataset.ordercode;
    //var storename = event.currentTarget.dataset.storename;
    //var createusername = event.currentTarget.dataset.createusername;
    //var appstatus = event.currentTarget.dataset.appstatus;
    if (this.data.orderStatu == '1' || this.data.orderStatu == '2') {
      wx.navigateTo({
        url: '../statementedDetail/statementedDetail?id=' + orderId
      })
    } else {
      wx.navigateTo({
        url: '../statementDetail/statementDetail?id=' + orderId
      })
    }

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
    wx.setStorage({
      key: "userId",
      data: {
        userName: '',
        passWord: ''
      }
    })
    wx.navigateBack({
      delta: 1
    })
  },
  
  changeSearchFlag: function () {
    if (this.data.search_flag) {
      this.setData({
        search_flag: false
      })
    } else {
      this.setData({
        search_flag: true
      })
    }
  },
  changeFilterFlag: function () {
    if (this.data.rule_flag) {
      this.setData({
        rule_flag: false
      })
    } else {
      this.setData({
        rule_flag: true
      })
    }
    this.resetRule();
  },
  saveKeyWord: function (e) {
    this.setData({
      keyword: e.detail.value
    })
  },
  searchData: function (e) {
    if (this.data.orderStatu == '') {
      this.getOrderList();
    } else {
      this.getOrderList2();
    }
    this.setData({
      search_flag: false
    })
  },
  saveStoreId: function (event) {
    var index = parseInt(event.currentTarget.dataset.index);
    console.log(this.data.organizationListFlag);
    if (this.data.organizationListFlag[index]) {
      this.data.organizationListFlag[index] = false;
    } else {
      this.data.organizationListFlag[index] = true;
    }
    this.setData({
      organizationListFlag: this.data.organizationListFlag
    })
    this.checkIsAll();
  },
  checkIsAll: function (event) {
    var isAll = true;
    for (var i = 0; i < this.data.organizationListFlag.length; i++) {
      if (!this.data.organizationListFlag[i]) {
        isAll = false;
      }
    }
    if (isAll) {
      this.setData({
        isAllStore: true
      })
    } else {
      this.setData({
        isAllStore: false
      })
    }
  },
  selectAllStore: function () {
    var vm = this;
    if (this.data.isAllStore) {
      this.setData({
        isAllStore: false
      })
    } else {
      this.setData({
        isAllStore: true
      })
    }
    for (var i = 0; i < this.data.organizationListFlag.length; i++) {
      if (this.data.isAllStore) {
        this.data.organizationListFlag[i] = true;
      } else {
        this.data.organizationListFlag[i] = false;
      }
    }
    this.setData({
      organizationListFlag: vm.data.organizationListFlag
    })
  },
  bindDateChangeTip: function(event) {
    var exitflag = parseInt(event.currentTarget.dataset.exitflag);
    var customerid = event.currentTarget.dataset.customerid;
    this.setData({
      loading: true
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'base/judgingPrice', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        customerId: customerid
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
          /*if (exitflag == "1") {
            vm.setData({
              timeData: event,
              //updataTimeFlag: true
            })
            
          } else {
            vm.bindDateChange(event)
          }*/
          vm.bindDateChange(event)
        }else{
          vm.showTips(res.data.message);
        }
      }, error: function (res) {
        vm.setData({
          loading: false
        })
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
  sureUpdataTime: function () {
    this.setData({
      updataTimeFlag: false
    })
    this.bindDateChange(this.data.timeData)
  },
  bindDateChange: function (event) {
    var mean = parseInt(event.currentTarget.dataset.mean);
    var index = parseInt(event.currentTarget.dataset.index);
    var status = parseInt(event.currentTarget.dataset.status);
    // var date = new Date(event.detail.value);
    var val = event.detail.value.replace(/-/g,"/");
    // var month='';
    // if (date.getMonth() < 9){
    //   month = '0' + (date.getMonth()+1);
    // }
    // if (date.getDate() < 10) {
    //   month = '0' + date.getDate();
    // }
    // var val = date.getFullYear() + '/' + month + '/' + date.getDate();
    var _flag=false;
    var _flag2=false;
    var _text='';
    if (status == "0"){
      if (mean == "0") {
        if ((!this.data.priceData[index].default.endPeriod) || this.data.priceData[index].default.endPeriod == '') {
          this.data.priceData[index].default.startPeriod = val;
          _flag = true;
        }else{
          var startTime = parseInt(val.replace("/", "").replace("/", ""));
          var endTime = parseInt(this.data.priceData[index].default.endPeriod.replace("/", "").replace("/", ""));
          if (startTime > endTime){
            _flag2=true;
          }else{
            this.data.priceData[index].default.startPeriod = val;
          }
        }
      } else {
        if ((!this.data.priceData[index].default.startPeriod) || this.data.priceData[index].default.startPeriod == '') {
          this.data.priceData[index].default.endPeriod = val;
          _flag = true;
        }else {
          var endTime = parseInt(val.replace("/", "").replace("/", ""));
          var startTime = parseInt(this.data.priceData[index].default.startPeriod.replace("/", "").replace("/", ""));
          if (startTime > endTime) {
            _flag2 = true;
          } else {
            this.data.priceData[index].default.endPeriod = val;
          }
        }
      }
    }else{
      if (mean == "0") {
        if ((!this.data.priceData[index].next.endPeriod) || this.data.priceData[index].next.endPeriod == '') {
          this.data.priceData[index].next.startPeriod = val;
          _flag = true;
        }else {
          var startTime = parseInt(val.replace("/", "").replace("/", ""));
          var endTime = parseInt(this.data.priceData[index].next.endPeriod.replace("/", "").replace("/", ""));
          if (startTime > endTime) {
            _flag2 = true;
          } else {
            this.data.priceData[index].next.startPeriod = val;
          }
        }
      } else {
        if ((!this.data.priceData[index].next.startPeriod) || this.data.priceData[index].next.startPeriod == '') {
          this.data.priceData[index].next.endPeriod = val;
          _flag = true;
        }else {
          var endTime = parseInt(val.replace("/", "").replace("/", ""));
          var startTime = parseInt(this.data.priceData[index].next.startPeriod.replace("/", "").replace("/", ""));
          if (startTime > endTime) {
            _flag2 = true;
          } else {
            this.data.priceData[index].next.endPeriod = val;
          }
        }
      }
    }
    this.setData({
      priceData: this.data.priceData
    })
    if (_flag2) {
      this.setData({
        timeFlag:true
      })
      return;
    }
    if (_flag){
      return;
    }
    this.setCurrentTime(index, status);
    
  },
  setCurrentTime: function (index, status) {
    var vm = this;
    var url = app.globalData.url;
    var id = '';
    var startPeriod = '';
    var endPeriod = '';
    if (status == "0"){
      id = this.data.priceData[index].default.customerId;
      startPeriod = this.data.priceData[index].default.startPeriod;
      endPeriod = this.data.priceData[index].default.endPeriod;
    }else{
      id = this.data.priceData[index].next.customerId;
      startPeriod = this.data.priceData[index].next.startPeriod;
      endPeriod = this.data.priceData[index].next.endPeriod;
    }
    wx.request({
      url: url + 'base/editPricePlans', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        customerId: id,
        startPeriod: startPeriod,
        endPeriod: endPeriod
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
        } else {
        }

      }, error: function (res) {
      }
    })
  },
  dateFormat: function (fmt, day) {
    var date = new Date();
    date.setDate(date.getDate() - day);
    var o = {
      "M+": date.getMonth() + 1, //月份   
      "d+": date.getDate(), //日   
      "h+": date.getHours(), //小时   
      "m+": date.getMinutes(), //分   
      "s+": date.getSeconds(), //秒   
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
      "S": date.getMilliseconds() //毫秒   
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
  },
  changeTime: function (event) {
    var mean = parseInt(event.currentTarget.dataset.mean);
    if (mean == "0") {
      this.setData({
        startTime: this.dateFormat("yyyy-MM-dd", 0),
        endTime: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag: '0'
      })
    }
    if (mean == "7") {
      this.setData({
        startTime: this.dateFormat("yyyy-MM-dd", 6),
        endTime: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag: '7'
      })
    }
    if (mean == "30") {
      this.setData({
        startTime: this.dateFormat("yyyy-MM-dd", 30),
        endTime: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag: '30'
      })
    }
    if (mean == "365") {
      this.setData({
        startTime: this.dateFormat("yyyy-MM-dd", 365),
        endTime: this.dateFormat("yyyy-MM-dd", 0),
        currentDateFlag: '365'
      })
    }
  },
  resetRule: function (event) {
    for (var i = 0; i < this.data.organizationListFlag.length; i++) {
      this.data.organizationListFlag[i] = false;
    }
    this.setData({
      isAllStore: false,
      selectFilterId: '',
      amount: '0.00',
      startTime: '',
      endTime: '',
      currentTime: this.dateFormat("yyyy-MM-dd", 0),
      currentDateFlag: '',
      organizationListFlag: this.data.organizationListFlag
    })
  },
  getAllFilter: function (event) {
    var selectFilterId = []
    for (var i = 0; i < this.data.organizationList.length; i++) {
      if (this.data.organizationListFlag[i]) {
        selectFilterId.push(this.data.organizationList[i].organizationid)
      }
    }
    if (selectFilterId.length == 0) {
      selectFilterId = '';
    } else {
      this.setData({
        selectFilterId: selectFilterId
      })
    }
  },
  sureFilter: function (event) {
    this.getAllFilter();
    if (this.data.orderStatu == '') {
      this.getOrderList();
    } else {
      this.getOrderList2();
    }
    this.setData({
      search_flag: false,
      rule_flag: false
    })
  },
  priceDateFormat: function () {
    for (var i = 0; i < this.data.orderData.length; i++) {

    }
  },
  jumpAdd: function () {
    wx.navigateTo({
      url: '../addCustomer/addCustomer'
    })
  },
  jumpSet: function (event) {
    var id = event.currentTarget.dataset.id;
    var status = event.currentTarget.dataset.status;
    var customerId = event.currentTarget.dataset.customerid;
    wx.navigateTo({
      url: '../priceSet/priceSet?id=' + id + '&status=' + status + '&customerId=' + customerId
    })
  },
  jumpShopPriceSet: function (event) {
    var id = event.currentTarget.dataset.id;
    var mean = event.currentTarget.dataset.mean;
    var index = event.currentTarget.dataset.index;
    var customerId = event.currentTarget.dataset.customerid;
    var vm = this;
    var url = app.globalData.url;
    
    var timeFlag=false;
    var startflag = false;
    if (this.data.priceData[index].default.startPeriod != null) { 
      var date = vm.format(new Date()).replace("/", "").replace("/", "");
      console.log(date);
      var startPeriod = this.data.priceData[index].default.startPeriod.replace("/", "").replace("/", "");
      console.log(startPeriod);
      if (parseInt(startPeriod) > parseInt(date)) {
        startflag = true;
      } else {
        startflag = false;
      }
    }
    
    if (mean=="1"){
      if (this.data.priceData[index].default.startPeriod != null && this.data.priceData[index].default.endPeriod != null){
        timeFlag=true;
      }
    }else{
      if (this.data.priceData[index].next.startPeriod != null && this.data.priceData[index].next.endPeriod != null) {
        timeFlag = true;
      }
    }
    this.setData({
      loading:true
    })
    wx.request({
      url: url + 'base/getStore', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        customerId: customerId
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
        if (res.data.code == '1') {
          if(res.data.date.length==0){
            wx.navigateTo({
              url: '../shopPriceSet/shopPriceSet?id=' + id + "&timeFlag=" + timeFlag + "&startflag=" + startflag + '&customerid=' + customerId
            })
          }else{
            console.log(customerId);
            wx.navigateTo({
              url: '../selectCustomer/selectCustomer?id=' + id + '&customerid=' + customerId + "&timeFlag=" + timeFlag + "&startflag=" + startflag
            })
          }
        }
      }, error: function (res) {
        this.setData({
          loading: false
        })
      }
    })
    /*wx.navigateTo({
      url: '../shopPriceSet/shopPriceSet?id=' + id
      //url: '../sharePricePlane/sharePricePlane?id=' + id + '&companyName=' + this.data.companyName + '&eId=' + this.data.eId + '&openId=' + this.data.openId
    })*/
  },
  cancelTip: function (event) {
    this.setData({
      updataTimeFlag:false,
      timeFlag: false,
      setPriceTipFlag:false,
      setingTimeFlag:false,
      setTimeFlag: false
    })
  },
  setPriceTip: function (event) {
    this.setData({
      setPriceTipFlag: true
    })
  },
  setTimeTips: function (event) {
    this.setData({
      setTimeFlag: true
    })
  },
  setingTimeTips: function (event) {
    this.setData({
      setingTimeFlag: true
    })
  },
  setTimePrice:function(){
    
  }
})
