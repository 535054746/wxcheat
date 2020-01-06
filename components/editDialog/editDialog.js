// components /editDialog/editDialog.js
Component({
  options: {
    multipleSlots: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '提示'
    },
    inputValue: {
      type: String,
      value: ''
    },
    hintText: {
      type: String,
      value: '请在这里输入'
    },
    leftBtnText: {
      type: String,
      value: '取消'
    },
    RightBtnText: {
      type: String,
      value: '确认'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isDialogShow: false,
    inputValue: '',
    title: '',
    hintText: '',
    leftBtnText: '',
    RightBtnText: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindSubmit(event){
      console.log(event.detail.value.textarea)
    },
    dialogInput(event) {
      this.setData({
        inputValue: event.detail.value
      })
    },
    leftTap() {
      this.triggerEvent("letTap")
      this.setData({ isDialogShow: false });
    },
    rightTap() {
      this.triggerEvent("rightTap", this.data.inputValue);
    },
    show() {
      var vm = this;
      vm.setData({
        isDialogShow: true,
      });
    },
    hide() {
      var vm = this;
      vm.setData({
        isDialogShow: false,
      });
    },
    init(data) {//data={title,hintText,leftBtnText,RightBtnText}
      var vm = this;
      vm.setData({
        title: data.title == undefined || data.title == '' ? vm.data.title : data.title,
        hintText: data.hintText == undefined || data.hintText == '' ? vm.data.hintText : data.hintText,
        leftBtnText: data.leftBtnText == undefined || data.leftBtnText == '' ? vm.data.leftBtnText : data.leftBtnText,
        RightBtnText: data.RightBtnText == undefined || data.RightBtnText == '' ? vm.data.RightBtnText : data.RightBtnText,
      });
    },
  }
})
