// components/yesNoBtn/yesNoBtn.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    yesText: {
      type: String,
      value: '同意'
    },
    noText: {
      type: String,
      value: '退回'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    yesText: '',
    noText: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    ynTap(e){
      this.triggerEvent('ynTap', e.currentTarget.dataset.type);
    },
    initData(yesText, noText){
      this.setData({ yesText: yesText, noText: noText })
    }
  }
})
