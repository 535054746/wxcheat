// components/singlePicker/singlePicker.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list:{
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow:false,
    selectItem: null,
    list:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show(){
      this.setData({isShow:true})
    },

    hide() {
      this.setData({ isShow: false })
    },

    comfirm(){
      var item = this.data.selectItem;
      this.triggerEvent('comfirm', item);
      this.setData({ isShow: false })
    },

    bindchange(event){
      this.data.selectItem = this.data.list[event.detail.value[0]];
    }
  }
})
