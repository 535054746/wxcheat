// components/shopDetailDialog/shopDetailDialog.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    source:{
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow:false,
    eId: '',
    openId: '',
    deptId: '',
    source:0,//0:集采 1:自采 2:要货
    unitValue: '',
    qty: 1,
    price:'',
    supplierId:'',
    supplierList:[],
    skuList:'',
    shopItem: null,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initData(source, eId, openId,deptId,item,supplierList){
      if (source == 0) {
        this.setData({
          eId: eId,
          openId: openId,
          deptId: deptId,
          shopItem: item,
          itemId: '',
          propertiesid: '',
          itemspecifications: '',
          unitValue: item.assistantunit ? item.assistantunit == '' ? item.unit : item.assistantunit : item.unit,
          supplierList: supplierList
        })
        if (supplierList.length == 1) {
          this.data.supplierId = supplierList[0].customerCode;
          this.data.supplierName = supplierList[0].customerName;
          this.data.itemId = supplierList[0].id;
          this.getSkuList();
        }
      } else if (source == 1) {
        this.setData({
          eId: eId,
          openId: openId,
          deptId: deptId,
          shopItem: item,
          itemId: item.id,
          propertiesid: '',
          itemspecifications: '',
          unitValue: item.assistantunit ? item.assistantunit == '' ? item.unit : item.assistantunit : item.unit,
          skuList: item.propertiesnamejson ? item.propertiesnamejson!=''?JSON.parse(item.propertiesnamejson):[] : []
        })
        if (item.propertiesnamejson == undefined || item.propertiesnamejson == '')
          this.getShopPrice();
      } else if (source == 2) {
        this.setData({
          eId: eId,
          openId: openId,
          deptId: deptId,
          shopItem: item,
          itemId: item.id,
          propertiesid: '',
          itemspecifications: '',
          unitValue: item.assistantunit ? item.assistantunit == '' ? item.unit : item.assistantunit : item.unit
        })
        this.getSkuList();
      }
    },

    show(){this.setData({isShow:true})},

    hide(){
      this.setData({
        isShow:false,
        unitValue: '',
        qty: 1,
        price: '',
        supplierId: '',
        supplierList: [],
        shopItem: null,
        skuList: ''
      })
    },

    sure() {
      if (this.data.source == 0 && this.data.supplierId == '') {
        this.showTips('请选择供应商')
        return false;
      }
      if (this.data.unitValue == '') {
        this.showTips('请填写单位')
        return false;
      }
      if (this.data.propertiesid == '' && this.data.skuList != '') {
        this.showTips('请选择规格')
        return false;
      }
      if (this.data.qty == '' || this.data.qty == 0) {
        this.showTips('请填写数量')
        return false;
      }
      var item = {};
      item.qty = this.data.qty;
      item.itemid = this.data.itemId;
      item.itemnumber = this.data.shopItem.itemnumber;
      item.assistantunit = this.data.unitValue;
      item.unit = this.data.shopItem.unit;
      item.supplierid = this.data.supplierId;
      item.suppliername = this.data.supplierName;
      item.propertiesid = this.data.propertiesid;
      item.itemname = this.data.shopItem.itemname;
      item.itemspecifications = this.data.itemspecifications;
      item.itemcategorycode1 = this.data.shopItem.itemcategorycode1;
      item.itemcategoryname1 = this.data.shopItem.itemcategoryname1;
      item.itemcategorycode2 = this.data.shopItem.itemcategorycode2;
      item.itemcategoryname2 = this.data.shopItem.itemcategoryname2;

      this.hide();
      this.triggerEvent('rebackShop', item)
    },

    unitInput(e){
      this.setData({unitValue:e.detail.value})
    },

    amountInput(e){
      this.setData({qty:e.detail})
    },

    selectSupplier(){
      this.setData({
        supplierId: e.currentTarget.dataset.id,
        supplierName: e.currentTarget.dataset.name,
        itemId: e.currentTarget.dataset.itemid
      });
    },

    selectSku(e) {
      var index1 = e.currentTarget.dataset.findex;
      var index2 = e.currentTarget.dataset.sindex;
      var list = this.data.skuList;
      for(var i = 0;i<list[index1].value.length;i++){
        if(i==index2){
          list[index1].value[i].isCheck = true;
          this.data.propertiesid = list[index1].kid + ':' + list[index1].value[i].vid;
          this.data.itemspecifications = list[index1].k + ':' + list[index1].value[i].v;
        } else {
          list[index1].value[i].isCheck = false;
        }
      }
      this.setData({skuList: list});
      if(this.data.source==1){
        this.getShopPrice(this.data.propertiesid);
      }
    },

    getSkuList() {
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
          type: vm.data.source == 0 ? '0' : vm.data.source == 2 ? '1' : '',
          itemNumber: vm.data.shopItem.itemnumber,
          deptId: vm.data.source == 0 ? vm.data.deptId : undefined,
          propertiesId: '',
          propertiesnamejson: ''
        },
        header: {
          "Content-Type": "application/json",
          eid: vm.data.eId
        },
        method: 'POST',
        dataType: 'json',
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 1) {
            if (res.data.data.propertiesnamejson != '') {
              vm.setData({ skuList: JSON.parse(res.data.data.propertiesnamejson) })
            }

            console.log(vm.data.skuList)
          } else {
            console.log(res);
          }
        },
        fail: function (res) {
          wx.hideLoading();
          console.log(res);
          vm.showTips('请求失败')
        },
      })
    },

    getShopPrice(propertiesid) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      var url = app.globalData.url;
      var vm = this;
      wx.request({
        url: url + 'base/getRefprice',
        data: {
          openId: vm.data.openId,
          itemId: vm.data.shopItem.id,
          propertiesId: propertiesid,
        },
        header: {
          "Content-Type": "application/json",
          eid: vm.data.eId
        },
        method: 'POST',
        dataType: 'json',
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 1) {
            vm.setData({ price: res.data.data.refprice })
          } else {
            console.log(res);
            vm.showTips(res.data.message)
          }
        },
        fail: function (res) {
          wx.hideLoading();
          console.log(res);
          vm.showTips('请求失败')
        },
      })
    },

    showTips(msg){
      this.triggerEvent('errorMsg',msg)
    }
    
  }
})
