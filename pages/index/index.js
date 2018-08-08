const app = getApp();

Page({
  onShareAppMessage: function (res) {
    return {
      title: 'ECharts',
      path: '/pages/index/index',
      success: function () {},
      fail: function () {}
    }
     
  },
  waitwar: function () {
    wx.redirectTo({
      url: `../waitwar/waitwar`
    })
  },
  data: {
    charts: [
       {
      id: 'radar',
      name: '雷达图'
    }
    ]
  },

  onReady() {
  },
  open: function (e) {
    wx.redirectTo({
      url: '../' + e.target.dataset.chart.id + '/index'
    });
  }
});
