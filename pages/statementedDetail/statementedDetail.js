const app = getApp()
import common from "../common/js/common.js";
Page({
  data: {
    remarksShowFlag: false,
    openId: '',
    orderId: '',
    createtime: '',
    ordercode: '',
    storeName: '',
    receivename: '',
    billStatus: '',
    eId: '',
    orderData: null,
    orderData2: null,
    orderShowFlag: [],
    showIndex1: [],
    showIndex2: [],
    showIndex3: [],
    showTopFlag: false,
    noteLists: [],
    storeNameChange: '',
    totaldays:0,
    total: '',
    totalamount:'',
    mean: 1,
    editFlag:1
  },
  closeRemarks: function (event) {
    this.setData({
      remarksShowFlag: false
    })
  },
  showRemarks: function (event) {
    var storename = event.currentTarget.dataset.storename;
    this.setData({
      remarksShowFlag: true,
      storeNameChange: storename
    })
    var index = parseInt(event.currentTarget.dataset.index);
    var notelist = this.data.orderData.order[index].noteList;
    this.setData({
      noteLists: notelist
    })
  },
  onLoad: function (option) {
    this.setData({
      orderId: option.id
    })
    console.log(option);
  },
  onReady: function () {
    var vm = this;
    wx.setStorage({
      key: "statementId",
      data: {
        id: ''
      }
    })
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        vm.getOrderDetail();
      }
    })

  },
  getOrderDetail: function () {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'srm/statement/getStmDetail', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        id: vm.data.orderId,
        itemCode1:[],
        itemCode2:[]
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        if (res.data.code == "1") {
          console.log(res.data.data.createTime);
          vm.setData({
            createtime: vm.format(new Date(res.data.data.createtime)),
            ordercode: res.data.data.number,
            billStatus: res.data.data.billstatus,
            storeName: res.data.data.storename,
            receivename: res.data.data.createusername,
            totalamount: common.toDecimal2(res.data.data.totalamount),
            totaldays: res.data.data.totaldays
          })
          vm.dataFormat(res.data.data.list);
        } else {

        }
      }, error: function (res) {
      }
    })
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
    var curTime = date.getFullYear() + "-" + month + "-" + day

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
  showIndexOne: function (event) {
    var index = parseInt(event.currentTarget.dataset.index);
    if (this.data.showIndex1[index]) {
      this.data.showIndex1[index] = false;
    } else {
      this.data.showIndex1[index] = true;
    }
    if (!this.data.showIndex2[parseInt(index)]) {
      this.data.showIndex2[parseInt(index)] = [];
    }
    if (this.data.showIndex2[parseInt(index)][0]) {
      this.data.showIndex2[parseInt(index)][0] = false;
    } else {
      this.data.showIndex2[parseInt(index)][0] = true;
    }
    var showIndexs = this.data.showIndex1;
    this.setData({
      showIndex1: showIndexs
    })
    var showIndexs = this.data.showIndex2;
    this.setData({
      showIndex2: showIndexs
    })

  },
  showIndexTwo: function (event) {
    console.log(event);
    var index = event.currentTarget.dataset.index;
    var indexArray = index.split("-");
    console.log(index);
    if (!this.data.showIndex2[parseInt(indexArray[0])]) {
      this.data.showIndex2[parseInt(indexArray[0])] = [];
    }
    if (this.data.showIndex2[parseInt(indexArray[0])][0]) {
      this.data.showIndex2[parseInt(indexArray[0])][0] = false;
    } else {
      this.data.showIndex2[parseInt(indexArray[0])][0] = true;
    }
    var showIndexs = this.data.showIndex2;
    this.setData({
      showIndex2: showIndexs
    })

  },
  showIndexThree: function (event) {
    var index = event.currentTarget.dataset.index;
    var indexArray = index.split("-");
    if (!this.data.showIndex3[parseInt(indexArray[0])]) {
      this.data.showIndex3[parseInt(indexArray[0])] = [];
    }
    if (!this.data.showIndex3[parseInt(indexArray[0])][0]) {
      this.data.showIndex3[parseInt(indexArray[0])][0] = [];
    }
    if (this.data.showIndex3[parseInt(indexArray[0])][0][0]) {
      this.data.showIndex3[parseInt(indexArray[0])][0][0] = false;
    } else {
      this.data.showIndex3[parseInt(indexArray[0])][0][0] = true
    }
    var showIndexs = this.data.showIndex3;
    this.setData({
      showIndex3: showIndexs
    })

  },
  showTop: function () {
    if (this.data.showTopFlag) {
      this.setData({
        showTopFlag: false
      })
    } else {
      this.setData({
        showTopFlag: true
      })
    }
  },
  lookQuality: function (event) {
    var performanceid = event.currentTarget.dataset.performanceid;
    var storeid = event.currentTarget.dataset.storeid;
    wx.navigateTo({
      url: '../qualityRecord/qualityRecord?performanceId=' + performanceid + "&storeid=" + storeid
    })
  },
  dataFormat: function (data) {
    var orderShowFlag=[];
    for (var i = 0; i < data.length; i++) {
      for (var h = 0; h < data[i].details.length; h++){
        data[i].details[h].amount = common.toDecimal2(data[i].details[h].amount)
      }
      data[i].amount = common.toDecimal2(data[i].amount)
      data[i].billdate = this.format(new Date(data[i].billdate));
      orderShowFlag.push(false);
    }
    this.setData({
      orderData: data,
      orderShowFlag: orderShowFlag
    });
  },
  decodeUTF8: function (str) {
    return str.replace(/(\\u)(\w{4}|\w{2})/gi, function ($0, $1, $2) {
      return String.fromCharCode(parseInt($2, 16));
    });
  },
  callPhone: function (event) {
    var phone = event.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  clickEdit: function (event) {
    if (this.data.editFlag==1){
      this.setData({
        editFlag: 2
      });
    }else{
      this.setData({
        editFlag: 1
      });
    }
    
  },
  deleteOrder: function (event) {
    var vm = this;
    var url = app.globalData.url;
    wx.showModal({
      title: '提示',
      content: '确定删除对账单吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: url + 'srm/statement/removeStm', //仅为示例，并非真实的接口地址
            data: {
              openId: vm.data.openId,
              id: vm.data.orderId,
            },
            dataType: 'json',
            header: {
              "Content-Type": "application/json",
              eId: vm.data.eId
            },
            method: 'post',
            success: function (res) {
              console.log(res);
              if (res.data.code == "1") {
                wx.navigateBack({
                  delta: 1
                })
              } else {

              }
            }, error: function (res) {
            }
          })

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  },
  deleteDept: function (event) {
    var vm = this;
    var url = app.globalData.url;
    var id = event.currentTarget.dataset.id;
    var indexOne = event.currentTarget.dataset.indexOne;
    var indexTwo = event.currentTarget.dataset.indexTwo;
    if (this.data.orderData[indexOne].details.length==1){
      if (this.data.orderData.length==1){
        this.data.orderData= []
      }else{
        this.data.orderData.splice(indexOne, 1);
      }
      
    }else{
      this.data.orderData[indexOne].details.splice(indexTwo,1);
    }
    this.setData({
      orderData:this.data.orderData
    })
    wx.request({
      url: url + 'srm/statement/removeStmDetail', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        id: vm.data.orderId,
        rkdList: [id]
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        if (res.data.code == "1") {
          //vm.getOrderDetail();
        } else {

        }
      }, error: function (res) {
      }
    })
  },
  deleteAllDept: function (event) {
    var vm = this;
    var url = app.globalData.url;
    var mean = event.currentTarget.dataset.mean;
    var rkdList=[];
    for (var i = 0; i < vm.data.orderData[parseInt(mean)].details.length;i++){
      rkdList.push(vm.data.orderData[parseInt(mean)].details[i].id);
    }
    wx.request({
      url: url + 'srm/statement/removeStmDetail', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        id: vm.data.orderId,
        rkdList: rkdList
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'post',
      success: function (res) {
        console.log(res);
        if (res.data.code == "1") {
          vm.getOrderDetail();
        } else {

        }
      }, error: function (res) {
      }
    })
  },
  addStatement: function(event) {
    var vm=this;
    wx.setStorage({
      key: "statementId",
      data: {
        id: vm.data.orderId,
        orderStatu:''
      }
    })
    wx.navigateBack({
      delta: 1
    })
  },
  comfireStatement: function (event) {
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'srm/statement/createStm', //仅为示例，并非真实的接口地址
      data: {
        openId: vm.data.openId,
        id: vm.data.orderId
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'post',
      success: function (res) {
        wx.navigateBack({
          delta:-1
        })
      }, error: function (res) {
      }
    })
  },
  jumpPage: function (event) {
    var orderId = event.currentTarget.dataset.id;
    console.log(orderId);
    wx.navigateTo({
      url: '../statementDetail/statementDetail?id=' + orderId
    })
  },
  changeShow: function (event) {
    var index = event.currentTarget.dataset.index;
    if (this.data.orderShowFlag[index]){
      this.data.orderShowFlag[index] = false;
    }else{
      this.data.orderShowFlag[index] = true;
    }
    this.setData({
      orderShowFlag: this.data.orderShowFlag
    });
  }
})