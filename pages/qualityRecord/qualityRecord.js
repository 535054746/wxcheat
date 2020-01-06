const app = getApp()

Page({
  data: {
    performanceId:'',
    storeid:'',
    eid:'',
    qualityData:null,
    showFlagArray:[]
  },
  onLoad: function (option) {
    this.setData({
      performanceId: option.performanceId,
      storeid: option.storeid,
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
  getOrderDetail: function () {
    var vm = this;
    var url = app.globalData.url;
    console.log(vm.data.performanceId);
    console.log(vm.data.storeid);
    wx.request({
      url: url + 'srm/quality/getQuality', //仅为示例，并非真实的接口地址
      data: {
        id: vm.data.performanceId,
        storeid: vm.data.storeid,
      },
      dataType: 'json',
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId
      },
      method: 'get',
      success: function (res) {
        if (res.data.code == "1") {
          console.log(res.data);
          vm.dataFormat(res.data.data);
        } else {

        }
      }, error: function (res) {
      }
    })
  },
  dataFormat: function(data){
    for(var i=0;i<data.length;i++){
      var datas=data[i];
      if (datas.voice){
        data[i].voice = JSON.parse(datas.voice);
      }
      if (datas.description){
        data[i].description = this.decodeUTF8(datas.description);
      }
      if (datas.srmBasePerformancedetail){
        for (var h = 0; h < datas.srmBasePerformancedetail.length; h++) {
          console.log(datas.srmBasePerformancedetail[h].photos)
          data[i].srmBasePerformancedetail[h].photos = JSON.parse(datas.srmBasePerformancedetail[h].photos);
        }
      }
    }
    this.setData({
      qualityData: data
    });
    console.log(this.data.qualityData);
  },
  decodeUTF8: function(str){  
    return str.replace(/(\\u)(\w{4}|\w{2})/gi, function ($0, $1, $2) {
      return String.fromCharCode(parseInt($2, 16));
    });   
  },
  callPhone: function(event){
    var phone = event.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  playVoice: function (event){
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
  },
  showLarge: function (event){
    var large = event.currentTarget.dataset.large;
    var indexOne = event.currentTarget.dataset.indexOne;
    var indexTwo = event.currentTarget.dataset.indexTwo;
    console.log(indexOne);
    console.log(indexTwo);
    console.log(this.data.qualityData);
    var photos=this.data.qualityData[indexOne].srmBasePerformancedetail[indexTwo].photos;
    var photosArray=[];
    for (var i = 0; i < photos.length;i++){
      photosArray.push(photos[i].large);
    }
    console.log(large);
    console.log(photosArray);
    wx.previewImage({
      current: large, // 当前显示图片的http链接
      urls: photosArray // 需要预览的图片http链接列表
    })
  },
  showShop: function (event) {
    var index = event.currentTarget.dataset.index;
    var flag=this.data.showFlagArray[index];
    if (flag){
      this.data.showFlagArray[index] = false;
    }else{
      this.data.showFlagArray[index] = true;
    }
    this.setData({
      showFlagArray: this.data.showFlagArray
    })
    console.log(this.data.showFlagArray);
  }
})