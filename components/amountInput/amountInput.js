// components/amountInput/amountInput.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    amountInputValue: {
      type: String,
      value: ''
    },
    maxNum: {
      type: Number,
      value: 999
    },
    minNum: {
      type: Number,
      value: 0
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    amountInputPlaceholder: '数量',
    amountInputValue: '',
    maxNum: '',
    minNum: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    addNum(){
      var num = parseFloat(this.data.amountInputValue);
      if (this.data.amountInputValue==''){
        this.setData({ amountInputValue: 1 })
      } else {
        this.setData({ amountInputValue: num+1 })
      }
      this.triggerEvent('amountInput', this.data.amountInputValue);
    },

    minusNum() {
      var num = parseFloat(this.data.amountInputValue);
      if (this.data.amountInputValue == '') {

      } else if (this.data.amountInputValue == 1) {
        this.setData({ amountInputValue: '' })
      } else if (this.data.amountInputValue < 1) {

      } else {
        this.setData({ amountInputValue: num-1 })
      }
      this.triggerEvent('amountInput', this.data.amountInputValue);
    },

    bindAmountInput(e) {
      this.setData({ amountInputValue: e.detail.value });
      this.triggerEvent('amountInput',e.detail.value);
    },

    bindAmountFocus(e) {
      this.setData({ amountInputPlaceholder: '' })
    },

    bindAmountBlur(e) {
      this.setData({ amountInputPlaceholder: '数量', amountInputValue: this.data.amountInputValue == 0 ? '' : this.data.amountInputValue == '.' ? '' : this.data.amountInputValue == '0.' ? '' :this.data.amountInputValue })
    },
  }
})
