//app.js
var that;
var socketFailCount = 0;
App({
  onLaunch: function () {
    console.log("onlaunch");
    that = this;
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
    //开启socket
    // that.socket();
    //屏幕常亮
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
    wx.showLoading({
      title: '登录中',
      mask: true,
      success: function () {
        // setTimeout(function () {
        //  // wx.hideLoading();
        //  // console.log('登录成功UserID=' + that.data.myuserid);
        //  // that.onShow();
        //  // that.leaveHome(that.data.options.type)
        // }, 2000);
      }
    })
  },
  socket: function () {
    wx.connectSocket({
      url: 'wss://yzryserver.tibosi.com:8046',
      success: function (e) {
        wx.onSocketOpen(function (res) {
          console.log('WebSocket连接已打开！');
          that.globalData.onSocketOpen = true;
        })
      },
      fail: function (e) { //Socket创建连接失败
        console.log('WebSocket连接创建失败！');
        console.log(e);
        wx.onSocketError(function (res) {
          socketOpen = false;
          socketFailCount++;
          wx.showLoading({
            title: '尝试第' + socketFailCount + '次连接',
          });
          wx.hideLoading();
          if (socketFailCount < 6) {
            that.socket();
          } else {
            wx.showModal({
              title: '',
              content: 'WebSocket连接失败,请检查您的网络',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }
        })
      },
      complete: function (e) {
        //创建连接结束后触发
      }
    });

    // wx.onSocketClose(function (res) {
    //   console.log('WebSocket 已关闭！')
    // })
  },

  globalData: {
    host: "https://yzryserver.tibosi.com:8046",
    getSetting: null,
    onSocketOpen: false,
    userInfo: null,
    code: null,
    UserID: null
  },
  /**
   * 获得URL中的参数
   */
  getoptions: function (options) {
    var arr = [];
    for (var K in options) {
      arr.push(K + "=" + options[K]);
    }
    return arr.join('&');
  }
})