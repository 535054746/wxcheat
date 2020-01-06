// components/bottomBtn/bottomBtn.js
Component({
  options: {
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    mainBtnText: {
      type: String,
      value: '按钮'
    },
    leftBtns:{
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    mainBtnText: '',
    leftBtns: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    leftTap(e) {
      this.triggerEvent("leftTap", e.currentTarget.dataset.index)
    },
    mainTap() {
      this.triggerEvent("mainTap");
    },
    initData(leftBtns, mainBtnText){
      this.setData({ leftBtns: leftBtns, mainBtnText: mainBtnText })
    }
  }
})
