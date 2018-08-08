// pages/FriendRangking/FriengRangKing.js
const app = getApp();
Page({
  Hindex: function() {
    wx.redirectTo({
      url: '../home/home',
    })
  },

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    userlist:{}
  },
  onLoad: function(options) {
   
  },  
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    //发起网络请求 获得排行榜名单
    wx.request({
      url: app.globalData.host + '/api/rank/rankInfo/ranking',
      data: {
        userID: app.globalData.UserID,
        // userID:10,
        top: 100
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status == 200) {
          //socket登录
          // that.data.list = res.data.data.dataSort;
          console.log(res.data.dataSort)
          that.setData({
            list: res.data.data.dataSort,
            userlist:res.data.data.userInfo[0]
            //that.data.list.concat(),
          })
          console.log(that.data.list)
          console.log(that.data.userlist)
        } else {

        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})