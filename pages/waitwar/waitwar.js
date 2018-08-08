
const app = getApp();
var that;

var total_micro_second = 3 * 60;
var oldbattleID = 0
function countdown(that) {
  // console.log(that.data.clock
  that.data.clocktag = setInterval(function () {
    total_micro_second -= 1;
    that.setData({
      clock: dateformat(total_micro_second)
    });
    if (total_micro_second <= 0) {
      clearInterval(that.data.clocktag);
      that.setData({
        clock: "该对战已过期"
      });
      that.clockend()
      if (that.data.role === 'Create') {
        wx.showModal({
          title: '提示',
          content: '该对战已过期！',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
              that.userLeave()
              wx.redirectTo({
                url: '../home/home',
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    }
    // countdown(that);
  }, 1000)
}

function dateformat(micro_second) {
  // 秒数
  var second = Math.floor(micro_second);
  // 小时位
  var hr = Math.floor(second / 3600);
  // 分钟位
  var min = Math.floor((second - hr * 3600) / 60);
  // 秒位
  var sec = (second - hr * 3600 - min * 60);// equal to => var sec = second % 60;
  if (sec < 10) {
    sec = '0' + sec
  }
  return "0" + min + ":" + sec;
}

Page({
  warend: function () {
    wx.redirectTo({
      url: `../warend/warend`
    })
  },
  quitwar: function () {
    clearInterval(that.data.clocktag);
    that.userLeave()
    wx.reLaunch({
      url: `../home/home`
    })
  },
  replacepeople: function () {

  },
  beginwar: function () {
    wx.setStorageSync('waitwartoUrl', 'doExam');
    let data = {
      type: 'accept in battle',
      userID: app.globalData.UserID,
      battleID: that.data.BattleID,
      userType: that.data.role
    }
    data = JSON.stringify(data)
    wx.sendSocketMessage({
      data: data
    })

    var userID = 'userInfo.userID'
    that.setData({
      [userID]: app.globalData.UserID
    })

    wx.setStorageSync('createrInfo', app.globalData.userInfo);
    wx.setStorageSync('acceptInfo', that.data.opponentinfo);
    clearInterval(that.data.clocktag);
    wx.redirectTo({
      url: `../test/doExam/doExam?usertype=${that.data.role}&BattleID=` + that.data.BattleID
    })
    // wx.request({
    //   url: app.globalData.host + '/api/battle/questionInfo/beginBattle',
    //   header: {
    //     'content-type': 'application/json'
    //   },
    //   data: {
    //     userID: app.globalData.UserID,
    //     battleID: that.data.BattleID
    //   },
    //   method: 'POST',
    //   success: function (res) {
    //     // console.log(res)
    //     wx.setStorageSync('BattleID', that.data.BattleID);
    //     wx.setStorageSync('createrInfo', app.globalData.userInfo);
    //     wx.setStorageSync('acceptInfo', that.data.opponentinfo);
    //     wx.navigateTo({
    //       url: `../test/doExam/doExam?usertype=${that.data.role}`
    //     })
    //   },
    //   fail: function (res) {
    //     console.log(res)
    //   }

    // })
  },
  createIn: function () {
    wx.request({
      url: app.globalData.host + '/api/battle/battleInfo/updateBattle_tmpTime',
      header: {
        'content-type': 'application/json'
      },
      data: {
        battleID: that.data.BattleID
      },
      method: 'POST',
      success: function (res) {

        console.log(res.data.data)
        if (res.data.status === 200) {
          console.log('create进入')
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.redirectTo({
                  url: '../home/home',
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  opponentIn: function () {
    if (that.data.clocktag!=0){
      clearInterval(that.data.clocktag);
    }
    wx.request({
      url: app.globalData.host + '/api/battle/battleInfo/userIntoBattle',
      header: {
        'content-type': 'application/json'
      },
      data: {
        userID: app.globalData.UserID,
        battleID: that.data.BattleID
      },
      method: 'POST',
      success: function (res) {

        // console.log(res.data.data)
        if (res.data.status === 200) {
          that.setData({
            users: res.data.data
          })
          var date1 = new Date(that.data.users.BattleBeginTime);
          var date2 = new Date();
          var date3 = (date2.getTime() - date1.getTime()) / 1000;   //相差秒数
          total_micro_second = 180 - date3
          console.log('传过来的时间：' +date1 + ':' +total_micro_second)
          countdown(that)

          let data = {
            type: 'wait in user',
            userID: app.globalData.UserID,
            battleID: that.data.BattleID,
            userType: that.data.role
          }
          console.log('222221121')
          console.log(data)
          data = JSON.stringify(data)
          wx.sendSocketMessage({
            data: data
          })
        } else {
          wx.showModal({
            title: '提示',
            content: res.data.data,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.redirectTo({
                  url: '../home/home',
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      },
      fail: function (res) {
        console.log(res)
      }

    })
  },
  clockend: function () {
    wx.request({
      url: app.globalData.host + '/api/battle/battleInfo/endWaitBattle',
      header: {
        'content-type': 'application/json'
      },
      data: {
        userID: app.globalData.UserID,
        battleID: that.data.BattleID
      },
      method: 'POST',
      success: function (res) {
        console.log('过期')
        if (res.data.status === 200) {
          console.log(res.data.data)
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
      },
      fail: function (res) {
        console.log(res)
      }

    })
  },
  userLeave: function () {
    wx.request({
      url: app.globalData.host + '/api/battle/battleInfo/waitLeave',
      header: {
        'content-type': 'application/json'
      },
      data: {
        userID: app.globalData.UserID,
        battleID: that.data.BattleID,
        userType: that.data.role
      },
      method: 'POST',
      success: function (res) {
        console.log('离开')
        console.log(res)
        if (res.data.status === 200) {
          console.log(res.data.data)
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
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  data: {
    clocktag: 0,
    countDownNum: 3 * 60,
    clock: '03:00',
    BattleID: 0,
    opponentinfo: '',
    creater: '',
    role: '',
    userInfo: '',
    users: ''
  },

  onShow() {
    wx.setStorageSync('waitwartoUrl', '');
  },
  onLoad(options) {
    that = this
    console.log(oldbattleID)

    that.setData({
      BattleID: options.id,
      role: options.usertype,
      userInfo: app.globalData.userInfo
    })
    wx.setStorageSync('usertype', that.data.role);
    wx.setStorageSync('BattleID', that.data.BattleID);
    console.log('BattleID' + wx.getStorageSync('BattleID'))
    console.log(options.id + options.usertype)
    if (options.usertype === 'Accept') {
      that.opponentIn()
    } else {
      that.createIn()
    }
    //  else if (options.usertype === 'Create') {

    //   let data = {
    //     type: 'wait in user',
    //     userID: app.globalData.UserID,
    //     battleID: options.id,
    //     userType: options.usertype
    //   }
    //   data = JSON.stringify(data)
    //   wx.sendSocketMessage({
    //     data: data
    //   })

    // }
    wx.onSocketMessage(function (data) {
      console.log('111111111');
      console.log(data);
      var objData = JSON.parse(data.data);
      if (objData.type === 'in wait') {
        that.setData({
          opponentinfo: objData.data
        })
      } else if (objData.type === 'wait leave') {
        if (that.data.role === 'Create') {
          that.setData({
            opponentinfo: ''
          })

        } else {
          that.setData({
            users: ''
          })
          wx.showModal({
            title: '提示',
            content: '创建者已离开！',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')

                wx.reLaunch({
                  url: `../home/home`
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      } else if (objData.type === 'in battle') {
        if (that.data.role === 'Accept') {
          clearInterval(that.data.clocktag);
          wx.redirectTo({
            url: `../test/doExam/doExam?usertype=${that.data.role}&BattleID=` + that.data.BattleID
          })
        }
      }
      console.log(objData);
    })
    if (options.id != oldbattleID && that.data.role === 'Create') {
      oldbattleID = options.id
      total_micro_second = 3 * 60
      countdown(that)
    }
    // else {
    //   countdown(that)
    // }


    // //建立连接
    // wx.connectSocket({
    //   url: config.baseUrl + "api/battle/battleInfo/createBattleTmp",
    // })
    // //连接成功
    // wx.onSocketOpen(function () {
    //   wx.sendSocketMessage({
    //     data: {
    //       'type': 'wait in user',
    //       'userID': '用户userID',
    //       'battleID': '对战ID',
    //       'userType': '用户类型 Create, 创建人，Accept：接收人'
    //     }
    //   })
    // })
    // //接收数据
    // wx.onSocketMessage(function (data) {
    //   var objData = JSON.parse(data.data);
    //   console.log(data);
    // })
    // //连接失败
    // wx.onSocketError(function () {
    //   console.log('websocket连接失败！');
    // })
  },
  onHide: function () {
    console.log('waitwar onHide()')
    // let data = {
    //   type: 'wait leave',
    //   userID: app.globalData.UserID,
    //   userType: this.data.role
    // }
    // data = JSON.stringify(data)
    // wx.sendSocketMessage({
    //   data: data
    // })
  },
  open: function (e) {
    wx.redirectTo({
      url: '../' + e.target.dataset.chart.id + '/index'
    });
  },
  onShareAppMessage: function () {
    return {
      title: '房也开好，速来！',
      path: 'pages/authorize/index?type=waitwar&BattleID=' + that.data.BattleID,
      success: function (res) {
        // console.log
        // wx.getShareInfo({
        //   shareTicket: res.shareTickets[0],
        //   success: function (res) { console.log(res) },
        //   fail: function (res) { console.log(res) },
        //   complete: function (res) { console.log(res) }
        // })
      }
    }
  }
});
