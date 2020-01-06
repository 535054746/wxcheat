// components/bluetoothDialog/bluetoothDialog.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isDialogShow: false,
    connedId:'',
    deviceList : []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    connectBluetooth(e){
      var deviceid = e.currentTarget.dataset.deviceid;
      this.triggerEvent("connectBluetooth", deviceid)
    },

    initData(list) {
      this.setData({ deviceList: list });
    },

    initConned(connedId) {
      this.setData({ connedId: connedId, deviceList: this.data.deviceList });
    },

    clear() {
      this.setData({ connedId: '', deviceList: [] });
    },

    show() {
      this.setData({ isDialogShow: true });
    },

    hide() {
      this.setData({ isDialogShow: false, deviceList: [] });
    }
  }
})
