const app = getApp();
var that;
Page({
  review: function () {
    wx.setStorageSync('waitendtoUrl', 'testRead');
    wx.navigateTo({
      url: `../test/testRead/testRead?battleID=${that.data.BattleID}`
    })
  },
  waragain: function () {
    wx.setStorageSync('waitendtoUrl', 'waitwar');
    console.log('新battleID' + that.data.newBattleID)
    if (that.data.newBattleID != 0) {
      wx.redirectTo({
        url: '../waitwar/waitwar?id=' + that.data.newBattleID + '&usertype=Accept'
      });
      return
    }
    if (that.data.role === 'Create') {
      that.setData({
        acceptUserID: that.data.users.Accept
      })
    } else {
      that.setData({
        acceptUserID: that.data.users.Create
      })
    }
    wx.request({
      url: app.globalData.host + '/api/battle/battleApp/createBattleTmp_again',
      data: {
        userID: app.globalData.UserID,
        acceptUserID: that.data.acceptUserID
      },
      method: 'POST',
      success: function (res) {
        console.log('继续dui')
        console.log(res.data.data)
        if (res.data.status === 200) {
          that.setData({
            newBattleID: res.data.data.battleID
          })
          wx.redirectTo({
            url: `../waitwar/waitwar?id=${that.data.newBattleID}&usertype=Create`
          });
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }

        //   BattleID = res.data.data.battleID;
      }
    });
  },
  waitwar: function () {
    wx.request({
      url: app.globalData.host + '/api/battle/battleInfo/createBattleTmp',
      data: {
        userID: app.globalData.UserID
      },
      method: 'POST',
      success: function (res) {

        if (res.data.status === 200) {
          console.log(res.data.data)
          that.setData({
            newBattleID: res.data.data.battleID
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
        // wx.navigateTo({
        //   url: `../waitwar/waitwar?id=${that.data.BattleID}&usertype=Create`
        // });
        //   BattleID = res.data.data.battleID;
      }
    });
  },
  getUserInfo: function () {
    wx.request({
      url: app.globalData.host + '/api/battle/battleApp/getBattleUserInfo',
      data: {
        battleID: that.data.BattleID
      },
      method: 'POST',
      success: function (res) {

        if (res.data.status === 200) {
          console.log(res.data)
          that.setData({
            users: res.data.data
          })
          that.getUserScore()
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      }
    });
  },
  getUserScore: function () {
    wx.request({
      url: app.globalData.host + '/api/battle/battleApp/battleScore',
      header: {
        'content-type': 'application/json'
      },
      data: {
        battleID: that.data.BattleID,
        createUserID: that.data.users.Create,
        acceptUserID: that.data.users.Accept
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status === 200) {
          console.log(res.data.data)
          if (that.data.role === 'Create') {
            if (res.data.data.createInfo.IsTie == 1) {
              that.setData({
                warendimg: 'https://yzryimg.tibosi.com/images/ui_battle_tie.png'
              })
            } else {
              if (res.data.data.createInfo.IsWin == 1) {
                that.setData({
                  warendimg: 'https://yzryimg.tibosi.com/images/ui_battle_victory.png'
                })
              } else {
                that.setData({
                  warendimg: 'https://yzryimg.tibosi.com/images/ui_battle_fail.png'
                })
              }
            }
          } else {
            if (res.data.data.accpetInfo.IsTie == 1) {
              that.setData({
                warendimg: 'https://yzryimg.tibosi.com/images/ui_battle_tie.png'
              })
            } else {
              if (res.data.data.accpetInfo.IsWin == 1) {
                that.setData({
                  warendimg: 'https://yzryimg.tibosi.com/images/ui_battle_victory.png'
                })
              } else {
                that.setData({
                  warendimg: 'https://yzryimg.tibosi.com/images/ui_battle_fail.png'
                })
              }
            }
          }
          that.setData({
            accpetInfo: res.data.data.accpetInfo,
            createInfo: res.data.data.createInfo
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
        // console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  gohome: function () {
    wx.redirectTo({
      url: `../home/home`
    });
  },
  data: {
    warendimg: '',
    accpetInfo: {},
    createInfo: {},
    users: '',
    role: '',
    userInfo: '',
    BattleID: 0,
    newBattleID: 0,
    acceptUserID: 0,
    selecter: ''
  },

  onReady() { },
  onLoad(options) {
    that = this
    if (options.fromUrl === 'share') {
      that.setData({
        selecter: options.usertype,
        BattleID: options.battleID,
        role: options.usertype
      })
    } else {
      wx.setStorageSync('waitendtoUrl', '');
      that.setData({
        role: wx.getStorageSync('usertype'),
        userInfo: app.globalData.userInfo,
        BattleID: options.battleID //wx.getStorageSync('BattleID')
      })
    }
    that.getUserInfo()
    console.log('BattleID:' + that.data.BattleID)

    wx.onSocketMessage(function (data) {
      console.log('已创建');

      var objData = JSON.parse(data.data);
      console.log(objData);
      if (objData.type === 'create battle') {
        that.setData({
          newBattleID: objData.data.battleID
        })
      }
    })

  },
  onUnload: function () {
    let toUrl = wx.getStorageSync('waitendtoUrl');
    console.log('waitendtoUrl:' + toUrl)
    if (toUrl == '') {
      wx.reLaunch({
        url: `../home/home`
      })
    }
  },
  onShareAppMessage: function () {
    console.log(`pages/home/home?usertype=${that.data.role}&battleID=${that.data.BattleID}&createUserID=${that.data.users.Create}&acceptUserID=${that.data.users.Accept}&fromUrl=share`)
    return {
      title: 'TA已被我打爆，不服？来战！',
      path: `pages/home/home?usertype=${that.data.role}&battleID=${that.data.BattleID}&createUserID=${that.data.users.Create}&acceptUserID=${that.data.users.Accept}&fromUrl=share&type=zhanbao`,
      success: function (res) {
        // wx.redirectTo({
        //   url: `../waitwar/waitwar?id=${this.data.newBattleID}&usertype=Create`
        // });
        console.log(res)
      },
      fail: function (res) {
        // 分享失败
        console.log(res)
      }
    }
  }
});