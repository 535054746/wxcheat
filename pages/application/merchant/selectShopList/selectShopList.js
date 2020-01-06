// pages/application/merchant/selectShopList/selectShopList.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowList: false,
    shopList:[],
    searchList:[],
    searchValue:'',
    currentIndex: null,
    leftBtnList: [{ name: '已选商品', pic:'bqlgwc@2x',color:false,count:0}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ source: options.source })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    var list = prevPage.data.allList;
    this.setData({
      shopList: list,
      leftBtnList: [{ name: '已选商品', pic: list.length == 0 ? 'bqlgwc@2x' : 'bqlgwc_pr@2x', color: list.length != 0, count: list.length }]
    })
    this.errorTips = this.selectComponent('#errorTips');
    this.shopDetailDialog = this.selectComponent('#shopDetailDialog');
    var vm = this;
    wx.getStorage({
      key: 'supplierInfo',
      success: function (res) {
        vm.data.openId = res.data.openId;
        vm.data.eId = res.data.eid;
        wx.getStorage({
          key: 'userInfo',
          success: function (res) {
            vm.data.orgno = res.data.user.orgno;
            vm.data.organizationid = res.data.user.organizationid;
            vm.getLeftList();
          },
        })
      },
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var vm = this;
    wx.getSystemInfo({
      success: function(res) {
        vm.setData({screenHeight: res.windowHeight})
      },
      fail: function(res) {},
      complete: function(res) {},
    })
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
    if(this.data.shopList.length==0){
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2];
      if (this.data.source == 0) {
        prevPage.setData({
          allList: [],
          typeList: prevPage.allList2typeList([]),
          supplierList: prevPage.allList2supplierList([])
        });
      } else if (this.data.source == 1) {
        prevPage.setData({
          allList: [],
          typeList: prevPage.allList2typeList([])
        });
      } else if (this.data.source == 2) {
        prevPage.setData({
          allList: [],
          typeList: prevPage.allList2typeList([])
        });
      }
    }
  },

  getLeftList:function(){
    wx.showLoading({
      title: '加载中',
      mask:true
    })
    
    var url = app.globalData.url;
    var vm = this;
    var reqType;
    if (vm.data.source == 0) {
      reqType = 1;
    }
    if (vm.data.source == 1) {
      reqType = 0;
    }
    if (vm.data.source == 2) {
      reqType = 3;
    }
    wx.request({
      url: url+'base/getRootCategorys',
      data: {
        type: reqType,
        deptId: vm.data.organizationid,
        openId: vm.data.openId,
      },
      header: {
        "Content-Type": "application/json",
        openId: vm.data.openId,
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'GET',
      dataType: 'json',
      success: function(res) {
        if(res.data.code==1){
          vm.setData({leftList: res.data.data});
          if (res.data.data.length>0){
            vm.setData({ currentLeftType: res.data.data[0].id});
            vm.getRightList(res.data.data[0].id);
          } else {
            wx.hideLoading();
          }
        }else{
          wx.hideLoading();
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
        vm.showTips('请求失败');
      },
    })
  },
  
  getRightList: function (categoryId) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var url = app.globalData.url;
    var vm = this;
    var reqType;
    if (vm.data.source == 0) {
      reqType = 1;
    }
    if (vm.data.source == 1) {
      reqType = 0;
    }
    if (vm.data.source == 2) {
      reqType = 3;
    }
    wx.request({
      url: url+'base/getCategorysAndItems',
      data: {
        type: reqType,
        deptId: vm.data.organizationid,
        categoryId: categoryId,
        openId: vm.data.openId,
      },
      header: {
        "Content-Type": "application/json",
        openId: vm.data.openId,
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 1) {
          vm.setData({ rightList: vm.bindCheckStatus(res.data.data) });
        } else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
        vm.showTips('请求失败');
      },
    })
  },

  getSupplierList(item) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var url = app.globalData.url;
    var vm = this;
    wx.request({
      url: url + 'srm/itemprice/getSupplierList',
      data: {
        openId: vm.data.openId,
        deptId: vm.data.organizationid,
        itemnumber: item.itemnumber
      },
      header: {
        "Content-Type": "application/json",
        eid: vm.data.eId,
        orgno: vm.data.orgno
      },
      method: 'GET',
      dataType: 'json',
      success: function(res) {
        wx.hideLoading();
        if(res.data.code==1){
          vm.shopDetailDialog.initData(vm.data.source, vm.data.eId, vm.data.openId, vm.data.organizationid,item,res.data.data)
          vm.shopDetailDialog.show();
        }else{
          vm.showTips(res.data.message);
        }
      },
      fail: function(res) {
        wx.hideLoading();
        console.log(res);
        vm.showTips('请求失败')
      },
    })
  },

  getPurchaser: function (item) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var url = app.globalData.url;
    var vm = this;
    wx.request({
      url: url + 'oms/selfReq/getPurchaser',
      data: {
        deptId: vm.data.organizationid,
        itemCate: item.itemtypecode
      },
      header: {
        "Content-Type": "application/json",
        eid: vm.data.eId,
        openId: vm.data.openId,
        orgno: vm.data.orgno
      },
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 1) {
          vm.shopDetailDialog.initData(vm.data.source, vm.data.eId, vm.data.openId, vm.data.organizationid, item)
          vm.shopDetailDialog.show();
        } else {
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
        vm.showTips('请求失败')
      },
    })
  },

  getSkuList(itemnumber) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var url = app.globalData.url;
    var vm = this;
    wx.request({
      url: url + 'base/getItemSkuJson',
      data: {
        openId: vm.data.openId,
        type: vm.data.source == 0 ? '0' : vm.data.source == 3 ? '1' : '',
        itemNumber: itemnumber,
        deptId: vm.data.source == 0 ? vm.data.organizationid : undefined,
        propertiesId: '',
        propertiesnamejson: ''
      },
      header: {
        "Content-Type": "application/json",
        eid: vm.data.eId
      },
      method: 'POST',
      dataType: 'json',
      success: function(res) {

      },
      fail: function(res) {
        wx.hideLoading();
        console.log(res);
        vm.showTips('请求失败')
      },
    })
  },

  showTips: function (msg) {
    if (msg.detail)
      this.errorTips.showTips(msg.detail);
    else
      this.errorTips.showTips(msg);
  },

  selectType:function(e){
    var typeId = e.currentTarget.dataset.id;
    this.setData({ currentLeftType: typeId})
    this.getRightList(typeId);
  },

  selectShop(e){
    var index1 = e.currentTarget.dataset.findex;
    var index2 = e.currentTarget.dataset.sindex;
    if (index2 != undefined) {
      this.data.currentIndex = [index1, index2];
      var item = this.data.rightList[index1].itemList[index2];
      console.log(index1 + '-' + index2)
    } else {
      var item = this.data.searchList[index1];
    }
    if(this.data.source==0){
      this.getSupplierList(item);
    } else if (this.data.source == 1){
      this.getPurchaser(item);
    } else if (this.data.source == 2) {
      this.shopDetailDialog.initData(this.data.source, this.data.eId, this.data.openId, this.data.organizationid, item)
      this.shopDetailDialog.show();
    }
  },

  rebackShop:function(e){
    var item = e.detail;
    var shopList = this.data.shopList;
    var rightList = this.data.rightList;
    if (!this.exsitInList(item)) {
      shopList.push(item);
      if (this.data.currentIndex != null) {//currentIndex为空就是在搜索列表添加的商品
        rightList[this.data.currentIndex[0]].itemList[this.data.currentIndex[1]].isCheck = true;
        this.data.currentIndex = null;
      }
    }
    this.setData({ 
      rightList: rightList,
      shopList: shopList,
      leftBtnList: [{ name: '已选商品', pic: shopList.length == 0 ? 'bqlgwc@2x' : 'bqlgwc_pr@2x', color: shopList.length != 0, count: shopList.length }]
    });
  },

  exsitInList: function (item) {
    var shopList = this.data.shopList;
    for(var i = 0;i<shopList.length;i++){
      if (item.itemid == shopList[i].itemid) {
        if (item.supplierid == shopList[i].supplierid) {
          if (item.propertiesid == shopList[i].propertiesid) {
            this.data.shopList[i].qty = item.qty;
            return true;
          }
          if (item.propertiesid == '' && shopList[i].propertiesid == undefined) {
            this.data.shopList[i].qty = item.qty;
            return true;
          }
        }
        if (item.supplierid == '' && shopList[i].supplierid == undefined) {
          if (item.propertiesid == shopList[i].propertiesid) {
            this.data.shopList[i].qty = item.qty;
            return true;
          }
          if (item.propertiesid == '' && shopList[i].propertiesid == undefined) {
            this.data.shopList[i].qty = item.qty;
            return true;
          }
        }
      }
    }
    return false;
  },

  bbLeftTap: function (e) {
    this.setData({ isShowList: this.data.shopList.length != 0 ? !this.data.isShowList:false })
  },

  bbMainTap:function(){
    if(this.data.shopList.length==0){
      this.showTips('请选择商品')
      return;
    }
    var list = this.data.shopList;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    if (this.data.source == 0) {
      prevPage.setData({
        allList: list,
        typeList: prevPage.allList2typeList(list),
        supplierList: prevPage.allList2supplierList(list)
      });
    } else if (this.data.source == 1) {
      prevPage.setData({
        allList: list,
        typeList: prevPage.allList2typeList(list)
      });
    } else if (this.data.source == 2) {
      prevPage.setData({
        allList: list,
        typeList: prevPage.allList2typeList(list)
      });
    }
    wx.navigateBack({
      delta: 1,
    })
  },

  clearShopList:function(){
    this.setData({
      shopList: [],
      leftBtnList: [{ name: '已选商品', pic: 'bqlgwc@2x', color: false, count: 0 }],
      isShowList: false
    })
  },

  hideShopList:function(){
    this.setData({ isShowList: false })
  },

  amountInput:function(e){
    var index = e.currentTarget.dataset.index;

    this.data.shopList[index].qty = e.detail;
    console.log(this.data.shopList)
  },

  deleteShop: function (e) {
    var index = e.currentTarget.dataset.index;
    var list = this.data.shopList;
    this.cancelCheckStatus(list[index].itemnumber);
    list.splice(index, 1);
    this.setData({
      shopList: list,
      leftBtnList: [{ name: '已选商品', pic: list.length == 0 ? 'bqlgwc@2x' : 'bqlgwc_pr@2x', color: list.length != 0, count: list.length }]
    });
  },

  cancelCheckStatus: function (itemnumber){
    var rightList = this.data.rightList;
    for(var i = 0;i<rightList.length;i++){
      for (var j = 0; j < rightList[i].itemList.length;j++){
        console.log('j='+j);
        if (rightList[i].itemList[j].itemnumber == itemnumber){
          rightList[i].itemList[j].isCheck = false;
          this.setData({rightList: rightList});
          return
        }
      }
    }
  },

  bindCheckStatus: function (rightList) {
    for (var i = 0; i < rightList.length; i++) {
      for (var j = 0; j < rightList[i].itemList.length; j++) {
        rightList[i].itemList[j].isCheck = this.checkIdInShopList(rightList[i].itemList[j].itemnumber);
      }
    }
    return rightList;
  },

  checkIdInShopList:function(itemnumber){
    var list = this.data.shopList;
    for(var i = 0;i<list.length;i++){
      if(list[i].itemnumber==itemnumber){
        return true;
      }
    }
    return false;
  },
  
  searchInput:function(e){
    var value = e.detail.value;
    this.setData({searchValue: value});
    if(value=='')
      return;
    var  searchType;
    if(this.data.source==0){
      searchType = 1
    }else if(this.data.source==1){
      searchType = 0
    }else if(this.data.source==2){
      searchType = 3
    }
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url +'base/searchItems',
      method:'GET',
      data: {
        openId: vm.data.openId,
        word: value,
        deptId: vm.data.deptId,
        type: searchType
      },
      header: {
        "Content-Type": "application/json",
        openId: vm.data.openId,
        eId: vm.data.eId,
        orgno: vm.data.orgno
      },
      dataType: 'json',
      success:function(res){
        if(res.data.code==1){
          vm.setData({searchList:res.data.data});
        }else{
          vm.showTips(res.data.message);
        }
      },
      fail: function (res) {
        wx.hideLoading();
        console.log(res);
        vm.showTips('请求失败');
      }
    })
  },
})