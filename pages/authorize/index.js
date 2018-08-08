/**授权登录 */
const app = getApp();
Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    options: {}//页面的参数
  },
  onLoad: function(options) {
    var that = this;
    that.data.options = options;
    // 查看是否授权
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          //跳转到主页
          wx.redirectTo({
            url: '../home/home?' + app.getoptions(options)
          })
        }
      }
    })
  },
  bindGetUserInfo: function(e) {
    var that = this;
    wx.redirectTo({
      url: '../home/home?' + app.getoptions(that.data.options)
    })
  }
})







 
