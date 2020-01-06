const app = getApp()

Page({
  data: {
    remarksShowFlag: false,
    orderId:'',
    createtime:'',
    ordercode:'',
    storename:'',
    createusername:'',
    appstatus:'',
    eId: '',
    orderData:null,
    showIndex1: [],
    showIndex2: [],
    showIndex3: [],
    showTopFlag:false,
    noteLists: [],
    storeNameChange:''

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
    var notelist=this.data.orderData.order[index].noteList;
    this.setData({
      noteLists: notelist
    })
  },
  onLoad: function (option) {
    this.setData({
      orderId : option.id,
      createtime : option.createtime,
      ordercode : option.ordercode,
      storename : option.storename,
      createusername : option.createusername,
      appstatus : option.appstatus
    })
    console.log(option);
  },
  onReady: function () {
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.eId = res.data.eid;
        vm.getOrderDetail();
      }
    })
    
  },
  getOrderDetail: function(){
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'oms/order/getOrderDetailByStore', //仅为示例，并非真实的接口地址
      data: {
        id: vm.data.orderId,
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'get',
      success: function (res) {
       if(res.data.code=="1"){
         console.log(res.data.data);
         vm.dataFormat(res.data.data)
         console.log(vm.data.orderData);
       }else{

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
      + " " + hour + ":" + minute;//+ ":" + second;

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
  showIndexOne: function (event){
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
    var showIndexs=this.data.showIndex1;
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
    if (!this.data.showIndex2[parseInt(indexArray[0])]){
      this.data.showIndex2[parseInt(indexArray[0])] = [];
    }
    if (this.data.showIndex2[parseInt(indexArray[0])][0]){
      this.data.showIndex2[parseInt(indexArray[0])][0] = false;
    }else{
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
    if (this.data.showIndex3[parseInt(indexArray[0])][0][0]){
      this.data.showIndex3[parseInt(indexArray[0])][0][0] = false;
    }else{
      this.data.showIndex3[parseInt(indexArray[0])][0][0] = true
    }
    var showIndexs = this.data.showIndex3;
    this.setData({
      showIndex3: showIndexs
    })

  },
  showTop: function(){
    if(this.data.showTopFlag){
      this.setData({
        showTopFlag:false
      })
    }else{
      this.setData({
        showTopFlag: true
      })
    }
  },
  lookQuality: function (event){
    var performanceid = event.currentTarget.dataset.performanceid;
    var storeid = event.currentTarget.dataset.storeid;
    wx.navigateTo({
      url: '../qualityRecord/qualityRecord?performanceId=' + performanceid + "&storeid=" + storeid
    })
  },
  dataFormat: function (data) {
    for (var i = 0; i < data.order.length; i++) {
      console.log(1);
      var datas = data.order[i];
      if (datas.checkDate){
        data.order[i].checkDate = this.format(new Date(datas.checkDate));
      }
      if (datas.placeDate) {
        data.order[i].placeDate = this.format(new Date(datas.placeDate));
      }
      
      if (datas.noteList) {
        for (var h = 0; h < datas.noteList.length; h++) {
          if (datas.noteList[h].txtNoteApply){
            data.order[i].noteList[h].txtNoteApply = this.decodeUTF8(datas.noteList[h].txtNoteApply);
          }
          if (datas.noteList[h].voiceNoteApply) {
            data.order[i].noteList[h].voiceNoteApply = JSON.parse(datas.noteList[h].voiceNoteApply);
          }
          
        }
      }
      if (datas.code1) {
        for (var h = 0; h < datas.code1.length; h++) {
          console.log(2);
          if (datas.code1[h].code2) {
            for (var g = 0; g < datas.code1[h].code2.length; g++) {
              console.log(3);
              if (datas.code1[h].code2[g].itemList) {
                for (var j = 0; j < datas.code1[h].code2[g].itemList.length; j++) {
                  console.log(4);
                  if (datas.code1[h].code2[g].itemList[j].list){
                    var redFlag=false;
                    for (var f = 0; f < datas.code1[h].code2[g].itemList[j].list.length; f++) {
                      console.log(5);
                      if (datas.code1[h].code2[g].itemList[j].list[f].propertiesnamejson){
                        data.order[i].code1[h].code2[g].itemList[j].list[f].propertiesnamejson = JSON.parse(datas.code1[h].code2[g].itemList[j].list[f].propertiesnamejson)
                      }
                      if (datas.code1[h].code2[g].itemList[j].list[f].performanceId){
                        redFlag=true;
                      }
                    }
                    datas.code1[h].code2[g].itemList[j].redFlag = redFlag;
                  }
                }
              }
            }
          }
        }
      }
    }
    console.log(data);
    this.setData({
      orderData: data
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
  sureOrder: function(event){
    var vm = this;
    var url = app.globalData.url;
    wx.showModal({
      title: '提示',
      content: '确定全部确认吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: url + 'oms/order/confirm', //仅为示例，并非真实的接口地址
            data: {
              id: vm.data.orderId,
            },
            dataType: 'json',
            header: {
              "Content-Type": "application/json",
              eId: vm.data.eId
            },
            method: 'get',
            success: function (res) {
              if (res.data.code == '1') {
                vm.getOrderDetail();
              }
            }, error: function (res) {
            }
          })
        }
      }
    })
    
  },
  orderDelivery:function(event){
    var storeId = event.currentTarget.dataset.storeid;
    var vm = this;
    var url = app.globalData.url;
    wx.showModal({
      title: '提示',
      content: '确定发货吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: url + 'oms/order/delivery', //仅为示例，并非真实的接口地址
            data: {
              id: vm.data.orderId,
              storeId: storeId,
            },
            dataType: 'json',
            header: {
              "Content-Type": "application/json",
              eId: vm.data.eId
            },
            method: 'get',
            success: function (res) {
              if (res.data.code == '1') {
                vm.getOrderDetail();
              }
            }, error: function (res) {
            }
          })
        }
      }
    })
    
  },
  delivery: function (event) {
    var vm = this;
    var url = app.globalData.url;
    wx.showModal({
      title: '提示',
      content: '确定全部发货吗？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: url + 'oms/order/delivery', //仅为示例，并非真实的接口地址
            data: {
              id: vm.data.orderId
            },
            dataType: 'json',
            header: {
              "Content-Type": "application/json",
              eId: vm.data.eId
            },
            method: 'get',
            success: function (res) {
              if (res.data.code == '1') {
                vm.getOrderDetail();
              }
            }, error: function (res) {
            }
          })
        }
      }
    })
    
  },
  voicePlay: function (event) {
    var voice = event.currentTarget.dataset.voice;
    console.log(voice);
    const innerAudioContext = wx.createInnerAudioContext()
    innerAudioContext.src = voice;
    innerAudioContext.play();
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  }
})