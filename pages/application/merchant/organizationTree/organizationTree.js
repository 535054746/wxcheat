// pages/application/merchant/organizationTree/organizationTree.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.errorTips = this.selectComponent('#errorTips');
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
            vm.getOrgTree();
          },
        })
      },
    });
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

  getOrgTree: function () {
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    var vm = this;
    var url = app.globalData.url;
    wx.request({
      url: url + 'framework/org/getOrgTree2',
      data: {
        openId: vm.data.openId,
        organizationid: vm.data.organizationid
      },
      header: {
        "Content-Type": "application/json",
        eId: vm.data.eId,
        orgno: vm.data.orgno,
        openId: vm.data.openId,
      },
      method: 'GET',
      dataType: 'json',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 1) {
          vm.setData({ orgList: res.data.data })
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

  showTips: function (msg) {
    this.errorTips.showTips(msg);
  },

  expandItem: function (e) {
    var index1 = e.currentTarget.dataset.firstindex;
    var index2 = e.currentTarget.dataset.secondindex;
    var index3 = e.currentTarget.dataset.thirdindex;
    var index4 = e.currentTarget.dataset.fourthindex;
    var typeId = e.currentTarget.dataset.typeid;
    if (typeId == 2) {
      this.cancelCheck();
      this.data.currentIndex = [index1, index2, index3, index4];
      if (index4 != undefined) {
          this.data.orgList[index1].orgList[index2].orgList[index3].orgList[index4].isCheck = true;
        this.data.currentDeptId = this.data.orgList[index1].orgList[index2].orgList[index3].orgList[index4].organizationid;
        this.data.currentDeptName = this.data.orgList[index1].orgList[index2].orgList[index3].orgList[index4].organizationname;
      } else if (index3 != undefined) {
        this.data.orgList[index1].orgList[index2].orgList[index3].isCheck = true;
        this.data.currentDeptId = this.data.orgList[index1].orgList[index2].orgList[index3].organizationid;
        this.data.currentDeptName = this.data.orgList[index1].orgList[index2].orgList[index3].organizationname;
      } else if (index2 != undefined) {
        this.data.orgList[index1].orgList[index2].isCheck = true;
        this.data.currentDeptId = this.data.orgList[index1].orgList[index2].organizationid;
        this.data.currentDeptName = this.data.orgList[index1].orgList[index2].organizationname;
      } else {
        this.data.orgList[index1].isCheck = true;
        this.data.currentDeptId = this.data.orgList[index1].organizationid;
        this.data.currentDeptName = this.data.orgList[index1].organizationname;
      }
      console.log(this.data.orgList)
    } else {
      if (index3 != undefined) {
        this.data.orgList[index1].orgList[index2].orgList[index3].expand = !this.data.orgList[index1].orgList[index2].orgList[index3].expand;
      } else if (index2 != undefined) {
        this.data.orgList[index1].orgList[index2].expand = !this.data.orgList[index1].orgList[index2].expand;
      } else {
        this.data.orgList[index1].expand = !this.data.orgList[index1].expand;
      }
    }
    this.setData({ orgList: this.data.orgList });
  },

  cancelCheck: function () {
    var index = this.data.currentIndex;
    if (index) {
      if (index[3] != undefined) {
        this.data.orgList[index[0]].orgList[index[1]].orgList[index[2]].orgList[index[3]].isCheck = false;
      } else if (index[2] != undefined) {
        this.data.orgList[index[0]].orgList[index[1]].orgList[index[2]].isCheck = false;
      } else if (index[1] != undefined) {
        this.data.orgList[index[0]].orgList[index[1]].isCheck = false;
      } else {
        this.data.orgList[index[0]].isCheck = false;
      }
    }
  },

  bbMainTap: function () {
    var id = this.data.currentDeptId;
    var name = this.data.currentDeptName;
    if(id==undefined||id==''){
      this.showTips('请选择部门')
      return;
    }
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({ deptName: name, deptId: id });
    wx.navigateBack({
      delta: 1,
    })
  },
})