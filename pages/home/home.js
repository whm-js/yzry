const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    plain: true,
    BattleID: null, //对战id
    options: {}, //跳转到首页时，url带的参数
    myuserid: null, //存储用户id
    list: [], //排行榜列表数据
    myInfo: {} //头像部的数据
  },
  onLoad: function(options) {
    console.log(options)
    let that = this
    that.data.options = options; //保存连接携带的参数
    app.socket();

    // 查看是否授权
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          that.getUserData();
        } else {
          //当前页打开
          wx.redirectTo({
            url: '../authorize/index?' + app.getoptions(options)
          })
        }
      }
    });

  },
  getCode: function() {
    var that = this;
    //登录
    wx.login({
      success: function(res) { /*请求微信API获得code*/
        if (res.code) {
          app.globalData.code = res.code;
          if (that.data.myuserid != null) {
            console.log('UserID从配置中获取=' + that.data.myuserid);
            that.leaveHome(that.data.options.type)
            that.onShow();
          } else {
            that.getUserId();
          }

        } else {
          console.log('登录微信API---login失败！' + res.errMsg);
        }
      }
    });
  },
  getUserData: function() { /*请求微信API---getUserInfo获得用户资料*/
    var that = this;
    wx.getUserInfo({
      success: function(res) {
        app.globalData.userInfo = res.userInfo;
        that.getCode();
      }
    })
  },
  getUserId: function() { /*请求后台服务获取用户id*/
    var that = this;
    //发起网络请求
    wx.request({
      url: app.globalData.host + '/api/user/loginApi/login',
      data: {
        code: app.globalData.code,
        wxName: app.globalData.userInfo.nickName, //微信昵称
        handImagUrl: app.globalData.userInfo.avatarUrl //图片路径
      },
      method: 'POST',
      success: function(res) {
        if (res.data.status == 200) {
          app.globalData.UserID = res.data.data.userID;
          that.data.myuserid = res.data.data.userID;
          //socket登录
          wx.sendSocketMessage({
            data: JSON.stringify({
              "type": "create user",
              "userID": res.data.data.userID
            })
          });
          /**成功之后跳转页面 */
          wx.showLoading({
            title: '登录中',
            mask: true,
            success: function() {
              setTimeout(function() {
                wx.hideLoading();
                console.log('登录成功UserID=' + that.data.myuserid);
                that.onShow();
                that.leaveHome(that.data.options.type)
              }, 2000);

            }
          })

        } else {
          wx.showModal({
            title: '提示',
            content: res.data.data,
            success: function(res) {
              if (res.confirm) {
                /// console.log('用户点击确定')
              } else if (res.cancel) {
                // console.log('用户点击取消')
              }
            }
          })
          console.log(res);
        }
      }
    });
  },
  FdRaind: function() {
    wx.navigateTo({
      url: '../FriendRangking/FriengRangKing',
    })
  },
  onReady: function() {
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
  },
  onShow: function() {
    /**
     * 生命周期函数--监听页面显示
     */
    var that = this;
    //每次返回主页都更新排名信息
    if (that.data.myuserid != null) {
      that.rank();

      //请求接口获得对战id
      wx.request({
        url: app.globalData.host + '/api/battle/battleInfo/createBattleTmp',
        data: {
          userID: that.data.myuserid
        },
        method: 'POST',
        success: function(res) {
          that.data.BattleID = res.data.data.battleID;
        }
      });
    }



  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(options) {
    var that = this;　　 // 设置菜单中的转发按钮触发转发事件时的转发内容   
    var shareObj = {
      title: '知道的越多，才会发现不知道的更多', //转发的标题  默认是小程序的名称(可以写slogan等)
      path: 'pages/authorize/index', // 默认是当前页面，必须是以‘/’开头的完整路径
      imgUrl: '', //自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径，支持PNG及JPG，不传入 imageUrl 则使用默认截图。显示图片长宽比是 5:4
      success: function(res) { // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
          // 来自页面内的按钮的转发
          if (options.target.id == 'pk' || options.target.id == 'pk2') {
            wx.redirectTo({
              url: '../waitwar/waitwar?id=' + that.data.BattleID + '&usertype=Create'
            })
          }else{
            wx.showToast({
              title: '分享成功',
              icon: 'success',
              duration: 2000
            })
          }
        }
      },
      fail: function(res) { // 转发失败之后的回调        　　　　　　
        if (res.errMsg == 'shareAppMessage:fail cancel') {　　　　　　　　 // 用户取消转发

        } else if (res.errMsg == 'shareAppMessage:fail') {　　　　　　　　 // 转发失败，其中 detail message 为详细失败信息

        }
      },
      complete: function() { // 转发结束之后的回调（转发成不成功都会执行）

      }
    };

    // 来自页面内的按钮的转发
    if (options.target.id == 'pk' || options.target.id == 'pk2') {
      // 此处可以修改 shareObj 中的内容      　　
      shareObj.title = '你真的弱爆了！敢不敢与我一战？【' + that.data.BattleID + '】';
      shareObj.path = 'pages/authorize/index?type=waitwar&BattleID=' + that.data.BattleID;
    }

    // 返回shareObj    　　
    return shareObj;

  },
  /**
   * 获得排行榜数据
   */
  rank: function() {
    var that = this;
    //发起网络请求 获得排行榜名单
    wx.request({
      url: app.globalData.host + '/api/rank/rankInfo/ranking',
      data: {
        userID: that.data.myuserid,
        top: 3
      },
      method: 'POST',
      success: function(res) {
        if (res.data.status == 200) {
          //socket登录
          that.data.list = res.data.data.dataSort;
          that.data.myInfo = res.data.data.userInfo[0];
          that.setData({
            list: that.data.list.concat(),
            myInfo: that.data.myInfo,
            myuserid: that.data.myuserid
          })
        } else {
          console.log("ERR---/api/rank/rankInfo/ranking");
        }
      }
    });

  },
  /**
   * 跳转至其他页面
   */
  leaveHome: function(opt) {
    var that = this;
    switch (opt) {
      case "help": //跳转到
        console.log(app.getoptions(that.data.options))
        wx.redirectTo({
          url: '../test/testHelp/testHelp?' + app.getoptions(that.data.options)
        });
        break;

      case "waitwar": //跳转到等待对战页
        wx.redirectTo({
          url: '../waitwar/waitwar?id=' + that.data.options.BattleID + '&usertype=Accept'
        });
        break;

      case "helpWaitwar": //跳转到等待对战页
        wx.redirectTo({
          url: '../waitwar/waitwar?id=' + that.data.options.battleID + '&usertype=Accept'
        });
        break;
      case "zhanbao": //跳转到战报
        wx.redirectTo({
          url: "../warend/warend?" + app.getoptions(that.data.options)
        });
        break;
        
      default:
        // that.onShow();
        break;
    }
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

  }
})