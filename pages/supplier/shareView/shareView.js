const app = getApp()

Page({
  data: {
    eid: '',
    orgno: '',
    openId: '',
    supplier: '',
    isTrue: false,
    httpSrc: '',
    urlFlag: -1,
    listId:"",
    itemnumber:"",
    pricePlanId: "",
    companyName: "",
    openId: "",
    customerName: "",
    customerCode: "",
    address: "",
    mobile: ""
  },
  onLoad: function (option) {
    this.setData({
      listId: option.listId,
      itemnumber: option.itemnumber,
      eid: option.eid,
      pricePlanId: option.id,
      companyName: option.companyName,
      openId: option.openId,
      customerName: option.customerName,
      mobile: option.mobile,
      contactsName: option.contactsName,
      address: option.address,
      customerCode: option.customerCode,
      urlFlag: option.urlFlag
    })
  }, 
  onReady: function () {
    var httpHref='';
    if (this.data.urlFlag == "0") {
      httpHref = 'http://192.168.1.222/vueH5/chart/shareOrder.html?eid=' + this.data.eid + '&listId=' + encodeURI(encodeURI(this.data.listId)) + '&itemnumber=' + encodeURI(encodeURI(this.data.itemnumber));
            } else if (this.data.urlFlag == "1") {
      httpHref = 'http://192.168.1.222/vueH5/chart/sharePricePlane.html?eid=' + this.data.eid + '&id=' + this.data.pricePlanId + '&openId=' + this.data.openId + '&companyName=' + encodeURI(encodeURI(this.data.companyName));
            } else if (this.data.urlFlag == "2") {
      httpHref = 'http://192.168.1.222/vueH5/chart/shareCustomer.html?customerName=' + encodeURI(encodeURI(this.data.customerName)) + '&customerCode=' + this.data.customerCode + '&contactsName=' + encodeURI(encodeURI(this.data.contactsName)) + '&mobile=' + this.data.mobile + '&address=' + encodeURI(encodeURI(this.data.address));
            }
            this.setData({
              httpSrc:httpHref
            })
           
  }
})