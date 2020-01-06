Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: 'http://member.gdskx.com:90/sso-server/images/zsewm.png'
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
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  openPic: function (e) {
    var vm = this;
    wx.previewImage({
      urls: [vm.data.picUrl]
    })
  },

  savePic: function () {
    var vm = this;
    wx.downloadFile({
      url: vm.data.picUrl,
      success: function (res) {
        let path = res.tempFilePath;
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success: function (res) {
            console.log(res)
          },
          fail: function (res) {
            console.log(res)
          }
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },

  onShareAppMessage: function () {
    return {
      title: '食食通 事事通 时时通',
      imageUrl: '../common/images/logo.png',
      path: 'pages/application/shareApp',
      success: function (res) {
        console.log('success-->' + res.target)
      },
      fail: function (res) {
        // 转发失败
        console.log('fail-->' + res.target)
      }
    }
  },
})