// pages/supplier/orderDetails/orderDetails.js
const myUtil = require('../../../utils/util.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
      eid:'',
      openId: '',
      tiemStart: '近30天',
      isFlag: true,    // 控制时间
      zdyi: true,     
      isStore: true,    //控制门店
      xia: '../../common/images/xia.png',
      shang: '../../common/images/shang.png',
      dian:'',
      conter:[],
      pageNum: 1,
      startTime: '',
      endTime:'',
      hasNextPage: false,   //时间的是否有下一页
      storeNextPage: false,  // 门店的是否有下一页
      storeNum: 1,
      storeId: '',
      inputVal: '',
      storeName: '门店'

  },
  orderTodetails(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../../supplier/ordertoDetails/ordertoDetails?id='+id,
    })
  },
  storeBtn() {
    this.setData({
      isStore:(!this.data.isStore),
      isFlag : true
    })
  },
  timeSlot(e) {
    var than = this
    var index = e.currentTarget.dataset.index
    var text = e.currentTarget.dataset.text
    var dd = new Date()
    switch(index) {
      case '1':
        var startTime = `${dd.getFullYear()}-${dd.getMonth()+1}-${dd.getDate()}`
        than.setData({
          startTime: startTime,
          endTime: startTime,
          isFlag: (!than.data.isFlag),
          tiemStart: text,
          isStore: true,
          conter: [],
          pageNum: 1
        })
        than.timePost(than.data.startTime, than.data.endTime)
        break;
      case '2':
        var startTime = than.getDay(7)
        var endTime = `${dd.getFullYear()}-${dd.getMonth() + 1}-${dd.getDate()}`
        than.setData({
          isFlag: (!than.data.isFlag),
          tiemStart: text,
          startTime: startTime,
          endTime: endTime,
          conter: [],
          pageNum: 1
        })
        than.timePost(than.data.startTime, than.data.endTime)
        break;
      case '3':
        var startTime = than.getDay(30)
        var endTime = `${dd.getFullYear()}-${dd.getMonth() + 1}-${dd.getDate()}`
        than.setData({
          isFlag: (!than.data.isFlag),
          tiemStart: text,
          startTime: startTime,
          endTime: endTime,
          conter: [],
          pageNum: 1
        })
        than.timePost(than.data.startTime, than.data.endTime)
        break;
      case '4':
        than.setData({
          zdyi: false,
          tiemStart:text
        })      
    }
  },
  timesloeBtn() {
    console.log('1')
    if(this.data.startTime == '' && this.data.endTime == ''){
      wx.showToast({
        title: '请先填写时间段',
        icon: 'none'
      })
    } else {
      this.timePost(this.data.startTime, this.data.endTime)
      this.setData({
        isFlag: true,
        zdyi: true,
        conter: [],
        pageNum: 1
      })
    }
  },

  searchInput(e) {      //搜索框
    this.setData({
      inputVal: e.detail.value
    })
  },
  searchBtn() {
    var than = this
    if(than.data.inputVal == ''){
      wx.showToast({
        title: '请先输入值',
        icon:'none'
      })
    } else {
      wx.showLoading({
        title: '请稍等...',
        mask: true
      })
      wx.request({
        url: app.globalData.url + 'supplyOrders/findStoreOrdersList',
        method: 'POST',
        header: {
          "Content-Type": "application/json",
          'eId': than.data.eid,
          'openId': than.data.openId
        },
        data:{
          keyword: than.data.inputVal
        },
        success(res) {
          if(res.data.code == 1) {
            if(res.data.data.list.length == 0) {
              wx.showToast({
                title: '暂无数据',
                icon: 'none'
              })
              than.setData({
                conter: res.data.data.list
              })
            } else {
              wx.hideLoading()
              var contentList = than.data.conter
              res.data.data.list.forEach(item => {
                item.xiadanTime = myUtil.formatTime(new Date(item.orderTime))
                item.orderTime = myUtil.formatTimeDate(new Date(item.orderTime))
              })
              var c = than.dataDeal(res.data.data.list)
              contentList = contentList.concat(c)

              than.setData({
                conter: c
              })
            }
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        },
        fail(res){
          wx.showToast({
            title: res.message,
            icon: 'none'
          })
        }
      })
    }
  },


  bindDateChangeStart(e) {
    this.setData({
      startTime: e.detail.value
    })
  },
  bindDateChangeEnd(e) {
    this.setData({
      endTime: e.detail.value
    })
  },

  isStoreBtn(e) {
    var storeId = e.currentTarget.dataset.id
    var storeName = e.currentTarget.dataset.name
    this.setData({
      isStore: true,
      storeId: this.data.storeId,
      conter: [],
      storeNum: 1,
      storeName: storeName
    })
    this.storePost(storeId)
  },

  tiem() {
    this.setData({
      isFlag: (!this.data.isFlag)
    })
  },


  timePost(startTime,endTime,type) {
    var than = this
    var supplyId = wx.getStorageSync('userInfo').supplier.id
    var openId = wx.getStorageSync('supplierInfo').openId
    than.setData({
      openId: openId,
      
    })
    if(type == 1) {
      than.data.pageNum++
    }
    var postData = {
      timeStart: startTime,
      timeEnd: endTime,
      supplyId: supplyId,
      pageNumber: than.data.pageNum
    }
    wx.request({
      url: app.globalData.url +'supplyOrders/findStoreOrdersList',
      method: 'POST',
      header: {
        "Content-Type": "application/json",
        'eId': than.data.eid,
        'openId': than.data.openId
      },
      data: postData,
      success(res) {
        if(res.data.code == 1) {
          if(res.data.data.list.length == 0) {
            wx.showToast({
              title: '暂无数据',
              icon: 'none'
            })
            than.setData({
              conter: res.data.data.list
            })
          }
          var contentList = than.data.conter
          res.data.data.list.forEach(item => {
            item.xiadanTime = myUtil.formatTime(new Date(item.orderTime))
            item.orderTime = myUtil.formatTimeDate(new Date(item.orderTime))
          })
          var c = than.dataDeal(res.data.data.list)
          contentList = contentList.concat(c)
          console.log(contentList)
          than.setData({
            conter: contentList,
            hasNextPage: res.data.data.hasNextPage
          })

        } else {
          wx.showToast({
            title: res.data.message,
            icon:'none'
          })
        }
      }
    })
  },

  dataDeal: function (data) {
    var listArr = [];
    data.forEach(function (el, index) {
      for (var i = 0; i < listArr.length; i++) {
        // 对比相同的字段key，相同放入对应的数组
        if (listArr[i].orderTime == el.orderTime) {
          listArr[i].listInfo.push({
            orderTime: el.orderTime,
            id: el.id,
            storeName: el.storeName,
            orderTime: el.orderTime,
            moneyAmount: el.moneyAmount,
            xiadanTime: el.xiadanTime
          });
          return;
        }
      }
      // 第一次对比没有参照，放入参照
      listArr.push({
        orderTime: el.orderTime,
        listInfo: [{
          orderTime: el.orderTime,
          id: el.id,
          storeName: el.storeName,
          orderTime: el.orderTime,
          moneyAmount: el.moneyAmount,
          xiadanTime: el.xiadanTime
        }]
      });
    });
    return listArr;
  },


  storePost(id,storeNum) {
    var supplyId = wx.getStorageSync('userInfo').supplier.id
    console.log(supplyId)
    var than = this
    wx.request({
      url: app.globalData.url + 'supplyOrders/findStoreOrdersList',
      method: 'POST',
      header: {
        "Content-Type": "application/json",
        'eId': than.data.eid,
        'openId': than.data.openId
      },
      data:{
        storeId: id,
        pageNumber: storeNum,
        supplyId: supplyId,
        timeStart:than.data.startTime,
        timeEnd:than.data.endTime,
      },
      success(res) {
        if(res.data.code == 1) {
          var contentList = than.data.conter
          res.data.data.list.forEach(item => {
            item.xiadanTime = myUtil.formatTime(new Date(item.orderTime))
            item.orderTime = myUtil.formatTimeDate(new Date(item.orderTime))
          })
          var c = than.dataDeal(res.data.data.list)
          contentList = contentList.concat(c)
          than.setData({
            conter: contentList,
            storeNextPage: res.data.data.storeNextPage
          })
          if(res.data.data.list.length == 0) {
            wx.showToast({
              title: '暂无数据',
              icon: 'none'
            })
            than.setData({
              conter: res.data.data.list
            })
          }
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }
    })
  },
  doNotMove() {
    return
  },
  doClose() {
    this.setData({
      isFlag: true
    })
  },
  doCloseStr() {
    this.setData({
      isStore: true
    })
  },
  getDay(day){
        var today = new Date();
        var targetday_milliseconds = today.getTime() - 1000 * 60 * 60 * 24 * day;
        today.setTime(targetday_milliseconds); 
        var tYear = today.getFullYear();
        var tMonth = today.getMonth();
        var tDate = today.getDate();
        tMonth = this.doHandleMonth(tMonth + 1);
        tDate = this.doHandleMonth(tDate);
        return tYear + "-" + tMonth + "-" + tDate;
  },
 doHandleMonth(month) {
        var m = month;
        if (month.toString().length == 1) {
           m = "0" + month;
        }
        return m;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var than = this
    var eid = wx.getStorageSync('eid')
    var userInfo = wx.getStorageSync('userInfo')
    let supplierId = userInfo.supplier.id 
    than.setData({
      eid: eid,
      supplierId: supplierId
    })
    console.log(than.data.supplierId)
    wx.request({
      url: app.globalData.url + 'framework/getStoreList',
      method: 'POST',
      header: {
        "Content-Type": "application/json",
        'eId':than.data.eid,
      },
      success(res) {
        than.setData({
          dian: res.data.data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var than = this
    var dd = new Date()
    var startTime = than.getDay(30)
    var endTime = `${dd.getFullYear()}-${dd.getMonth() + 1}-${dd.getDate()}`
    than.setData({
      startTime: startTime,
      endTime: endTime
    })
    than.timePost(than.data.startTime, than.data.endTime)
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
    var than = this
    // var pageNum = than.data.pageNum + 1
    var storeNum =  than.data.storeNum + 1
    than.setData({
      storeNum: storeNum
    })
    if (than.data.hasNextPage) {
      than.timePost(than.data.startTime,than.data.endTime,1)
    }
    if (than.data.storeNextPage) {
      than.storePost(than.data.storeId,than.data.storeNum)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})