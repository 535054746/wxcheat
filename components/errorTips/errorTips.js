// components /errorTips/errorTips.js
Component({
  options: {
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    tipText: {
      type: String,
      value: ''
    },
    showTime: {
      type: Number,
      value: 1500
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    tipText: '',
    showTime: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showTips(tipText) {
      var vm = this;
      vm.setData({
        isShow: true,
        tipText: tipText
      });
      setTimeout(function () {
        vm.setData({
          isShow: false,
          tipText: ''
        });
      }, vm.data.showTime);
    },
  }
})
