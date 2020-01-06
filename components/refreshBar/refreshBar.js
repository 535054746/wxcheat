// components/refreshBar/refreshBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  attached: function () {
    var showanimation = wx.createAnimation({
      duration: 300,
    })

    this.animation = showanimation
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

    showAn: function () {
      this.animation.height(40).step()
      this.setData({
        animationData: this.animation.export()
      })
    },

    hideAn: function () {
      this.animation.height(0).step()
      this.setData({
        animationData: this.animation.export()
      })
    }

  }
})
