// components/shopShowType/shopShowType.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    checkIndex: {
      type: Number,
      value: 0
    },
    mode: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    checkIndex:0,
    mode:0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    selectTab(event){
      this.setData({ checkIndex: event.currentTarget.dataset.index });
      this.triggerEvent("selectTab", event.currentTarget.dataset.index);
    }
  }
})
