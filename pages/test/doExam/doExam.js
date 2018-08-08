let isTest = true;
const testBaseUrl = 'https://yzryserver.tibosi.com:8046/'
const prodBaseUrl = 'https://wxinfoapi.tibosi.com/'
let baseUrl = isTest ? testBaseUrl : prodBaseUrl
//获取应用实例
const app = getApp();
var that;
var timer;
var testData;
var userAnswer;
var step = 1;
var start = 1.5 * Math.PI;// 开始的弧度  
var end = -0.5 * Math.PI;// 结束的弧度
var usertype = "createrInfo";
var heDataScore = 0;
var heDataHe = -1;
var heDataRight = "false";
var battleID = 0;
var onHide = false;
var date1;
Page({
  data: {
    //时间到了或者我已经答过了
    isMyTimeOut: false,
    isHeTimeOut: false,

    //时间倒计时
    testTime: 20,
    testTimeshow: 20,

    //我的信息
    myName: "",
    myScore: 0,
    myImg: 'https://yzryimg.tibosi.com/images/yuan.png',
    myUserID: 1,
    myUserType: "Create",

    //对手信息
    heName: "",
    heScore: 0,
    heImg: 'https://yzryimg.tibosi.com/images/yuan.png',
    heUserID: 2,
    heUserType: "Accept",

    //当前题号
    testCurrent: 0,
    testCount: 0,

    //软件名称
    softName: "",

    //对错图标   
    ui_battle_right: "https://yzryimg.tibosi.com/images/ui_battle_right.png",
    ui_battle_wrong: "https://yzryimg.tibosi.com/images/ui_battle_wrong.png",
    ui_battle_kong: "https://yzryimg.tibosi.com/images/kong.png",

    //一秒显示 科目 试题号 倒计时
    softTestShow: "hide",
    //3秒显示 题干
    testTitleShow: "hide",
    //6秒显示 选项
    testItemShow: "hide",

    shuangbei: "hide",

    //某道题的信息
    testInfo: [
      {
        title: "方法方法方法反反复复反复反复",
        itemArray: [111111111, 2222222222222, 33333333333333, 44444444444444, 5555555555555555],
        user: -1,
        he: -1,
        userRight: "false",
        heRight: "false",
        answer: -1//数字对应选择  
      }
    ],

    testChar: ["A", "B", "C", "D", "E", "F", "G", "H"]
  },
  // 页面加载完成
  onLoad: function (options) {
    //地址栏参数 
    usertype = options.usertype;
    battleID = options.BattleID;
  },
  // 页面渲染完成
  onReady: function () {
    that = this;
    //onHide = false;
    wx.request({
      url: baseUrl + 'api/battle/battleApp/getBattleUserInfo',
      header: {
        'content-type': 'application/json'
      },
      data: {
        battleID: battleID
      },
      method: 'POST',
      success: function (res) {
        console.log(res)
        if (res.data.status == 200) {
          //创建者
          var obj = res.data.data;
          if (app.globalData.UserID == obj.Create) {
            that.setData({
              myName: obj.CreateName,
              myImg: obj.CreateImgUrl,
              myUserID: obj.Create,
              myUserType: "Create",

              heName: obj.AcceptName,
              heImg: obj.AcceptImgUrl,
              heUserID: obj.Accept,
              heUserType: "Accept",
            });
          } else {
            that.setData({
              heName: obj.CreateName,
              heImg: obj.CreateImgUrl,
              heUserID: obj.Create,
              heUserType: "Create",

              myName: obj.AcceptName,
              myImg: obj.AcceptImgUrl,
              myUserID: obj.Accept,
              myUserType: "Accept",
            });
          }
          setTimeout(function () {
            Socket();
          }, 1000)
        }
      },
      fail: function () {
        console.log('接口出错')
      }
    })


  },
  onShow: function () {
    if (onHide) {
      //告诉后端这道题 我答完了
      var testCurrent = that.data.testCurrent - 1;
      var testDataCurrent = testData.battleTestInfo[testCurrent];
      wx.sendSocketMessage({
        data: JSON.stringify({
          type: 'battle end',
          userType: that.data.myUserType,
          userID: that.data.myUserID,
          battleID: testData.battleInfo.battleID,
          examTestID: testDataCurrent.ExamTestID,
          isHaveScreen: true
        })
      });
    }
    console.log("界面显示")

    // var date2 = new Date();    //结束时间
    // var date3 = (date2.getTime() - date1.getTime()) / 1000;  //时间差的秒数
    // console.log("息屏的秒数：" + date3)
    // //计算已经进入了第几题
    // var t = step + date3;//当前显示的秒数  就是过去了多少秒
    // //还在当前题目  每题有20秒
    // if (t < 20) {
    //   console.log("息屏的秒数小于20");
    //   step = t;
    // } else if (t > 120) {
    //   console.log("息屏的秒数大于120")
    //   // t 大于 that.data.testCount * 20  就是这样试卷已经结束了
    // } else {
    //   console.log("息屏的秒数趋于中间值")
    //   var y = Math.floor(t / 20);//就是 题号 =  y + 加上当前题号  
    //   var m = t % 20; //就是当前题 还剩秒数 that.data.testTimeshow    
    // }
  },

  onHide: function () {
    //var date1 = new Date();  //开始时间
    onHide = true;
    console.log("界面隐藏")
  },

  onUnload: function () {
    onHide = false;
  },

  //用户试题点击
  seleteItem: function (e) {
    //如果答过了 禁止再答
    var isMyTimeOut = that.data.isMyTimeOut;
    if (isMyTimeOut) {
      return;
    }
    //用户答案
    userAnswer = e.currentTarget.dataset.index;
    testSubmit()
  },
});

//定时器
function onDrawCircleReady() {
  timer = null;
  step = 1;
  start = 1.5 * Math.PI;// 开始的弧度  
  end = -0.5 * Math.PI;// 结束的弧度    

  // 倒计时前先绘制整圆的圆环  
  drawCircle(0, 0);
  // 创建倒计时
  timer = setInterval(
    function () { animation() }, 1000);

}

// 动画函数  
function animation() {
  var n = that.data.testTime; // 当前倒计时为n秒  
  if (step <= n) {
    end = end + 2 * Math.PI / n;
    //最后一秒保持
    if (that.data.testTimeshow == 1) {
      drawCircle(1.5 * Math.PI, -0.5 * Math.PI);
    } else {
      drawCircle(start, end);
    }
    that.setData({ testTimeshow: (that.data.testTimeshow) - 1 });

    //显示软件名称
    if (step == 1) {
      that.setData({ softTestShow: "show" });
      //最后一题 出现双倍广告
      if (that.data.testCurrent == that.data.testCount) {
        that.setData({ shuangbei: "show" })
        setTimeout(function () {
          that.setData({
            shuangbei: "hide"
          });
        }, 2000)
      }
    }

    //显示题干
    if (step == 3) {
      that.setData({
        testTitleShow: "show"
      });
    }

    //显示选项
    if (step == 6) {
      that.setData({ testItemShow: "show" });
    }
    step++;
  } else {
    //时间到自动结束 
    clearInterval(timer);
    userAnswer = -1;

    var isMyTimeOut = that.data.isMyTimeOut;

    console.log(isMyTimeOut)

    if (isMyTimeOut) {

    } else {
      testSubmit();
    }

    //告诉后端这道题 我答完了
    var testCurrent = that.data.testCurrent - 1;
    var testDataCurrent = testData.battleTestInfo[testCurrent];
    wx.sendSocketMessage({
      data: JSON.stringify({
        type: 'battle end',
        userType: that.data.myUserType,
        userID: that.data.myUserID,
        battleID: testData.battleInfo.battleID,
        examTestID: testDataCurrent.ExamTestID
      })
    });

    console.log("答完题了，请求...")

  }
};

//圆形进度条
function drawCircle(s, e) {
  var cxt_arc = wx.createCanvasContext('canvasArc');
  cxt_arc.setLineWidth(10);
  cxt_arc.setStrokeStyle('#FFD829');
  //cxt_arc.setLineCap('round')
  cxt_arc.beginPath();//开始一个新的路径  
  cxt_arc.arc(30, 30, 25, s, e, false);
  cxt_arc.stroke();//对当前路径进行描边   
  cxt_arc.draw();
}

//进入下一题
function goNextTest() {
  //是否已经结束
  if (that.data.testCurrent == that.data.testCount || that.data.testCount == 0) {
    console.log("battleID------------" + battleID)
    wx.redirectTo({
      url: `../../warend/warend?battleID=` + battleID
    })
    return
  }

  wx.showLoading({
    title: '正在加载试题',
  })

  //下一道试题
  var testCurrent = that.data.testCurrent;
  var testDataCurrent = testData.battleTestInfo[testCurrent];
  var testDataCurrent_itemInfo = JSON.parse(testDataCurrent.TestJson);

  var testInfo = [{
    title: testDataCurrent_itemInfo.Title,
    itemArray: testDataCurrent_itemInfo.SelectedItem,
    user: -1,
    he: -1,
    userRight: "false",
    heRight: "false",
    answer: -1 //数字对应选择   
  }];

  //在这里更新下一题的信息

  heDataScore = 0;
  heDataHe = -1;
  heDataRight = "false"

  that.setData({
    softName: testDataCurrent.AppName,//软件名称
    testCurrent: testCurrent + 1,//题号
    testInfo: testInfo,//试题信息

    isMyTimeOut: false,
    isHeTimeOut: false,
    testTime: 20,
    testTimeshow: 20,
    //3秒显示 题干
    testTitleShow: "hide",
    //6秒显示 选项
    testItemShow: "hide",
  });

  wx.hideLoading();
  onDrawCircleReady();
}

//连接、监听Socket
function Socket() {
  if (!app.globalData.onSocketOpen) {
    wx.showLoading({
      title: 'Socket没有开启',
    })
    return;
  }

  wx.showLoading({
    title: '正在加载资源...',
  })

  //获取试题 点击开始的时候调用  
  setTimeout(function () {
    if (usertype == "Create") {
      wx.request({
        url: baseUrl + 'api/battle/questionInfo/beginBattle',
        header: {
          'content-type': 'application/json'
        },
        data: {
          userID: app.globalData.UserID,
          battleID: battleID
        },
        method: 'POST',
        success: function (res) {
          wx.hideLoading();
          if (res.data.status != 200) {
            wx.showModal({
              title: '',
              content: res.data.data,
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
            return;
          }
        },
        fail: function () {
          console.log('接口出错')
        }
      })
    }
  }, 1000)
  //监听Socket返回的消息 
  wx.onSocketMessage(function (res) {
    var data = JSON.parse(res.data);
    console.log(JSON.stringify(data))
    switch (data.type) {
      //对方回答试题了,返回分数
      case "battle other score":
        console.log("battle other score--------------------------------------")
        //如果我答了 对方答了 就显示对错 
        var char = ["A", "B", "C", "D", "E", "F", "G", "H"];
        if (that.data.isMyTimeOut) {
          var he = 'testInfo[0].he';
          var heRight = 'testInfo[0].heRight';
          var answer = 'testInfo[0].answer';
          var testCurrent = that.data.testCurrent - 1;
          var testDataCurrent = testData.battleTestInfo[testCurrent];
          that.setData({
            heScore: parseInt(that.data.heScore) + parseInt(data.data.score),
            [he]: char.indexOf(data.data.answer),
            [heRight]: (data.data.isRigth) == 1 ? "true" : "false",
            [answer]: char.indexOf(testDataCurrent.Answer), //数字对应选择   
            isHeTimeOut: true
          })
        } else {
          heDataScore = parseInt(data.data.score);
          heDataHe = char.indexOf(data.data.answer);
          heDataRight = (data.data.isRigth) == 1 ? "true" : "false"
          that.setData({
            isHeTimeOut: true
          })
        }
        break;

      //下一题
      case "next question":
        console.log('next question--------------------------------------')
        clearInterval(timer);
        setTimeout(function () {
          clearInterval(timer);
          goNextTest()
        }, 1000)

        break;

      //可以开始获取试题
      case "get test":
        console.log('get test--------------------------------------')
        testData = data.data.testInfo;//所有信息保存       
        that.setData({
          testCount: testData.battleTestInfo.length
        });

        wx.sendSocketMessage({
          data: JSON.stringify({
            type: 'get battle stauts',
            userType: that.data.myUserType,
            userID: that.data.myUserID,
            battleID: testData.battleInfo.battleID
          })
        });
        break;


      //可以开始答题
      case "start battle":
        goNextTest();
        break;

      //离开 进入对战结束界面
      case "battle leave":
        console.log("battle leave--------------------------------------")
        clearInterval(timer);
        wx.showLoading({
          title: '对方离开了...',
        })
        setTimeout(function () {
          wx.hideLoading();
          console.log("battleID------------" + battleID)
          wx.redirectTo({
            url: `../../warend/warend?battleID=` + battleID
          })
        }, 2000)
        break;

      //离开 进入对战结束界面
      case "other battle leave":
        console.log("other battle leave--------------------------------------")
        clearInterval(timer);
        wx.showLoading({
          title: '对方离线了...',
        })
        setTimeout(function () {
          wx.hideLoading();
          console.log("battleID------------" + battleID)
          wx.redirectTo({
            url: `../../warend/warend?battleID=` + battleID
          })
        }, 2000)
        break;

      //自己离开
      case "my battle leave":
        console.log("my battle leave--------------------------------------")
        clearInterval(timer);
        wx.showLoading({
          title: '您已经离线了...',
        })
        setTimeout(function () {
          wx.hideLoading();
          console.log("battleID------------" + battleID)
          wx.redirectTo({
            url: `../../warend/warend?battleID=` + battleID
          })
        }, 2000)
        break;

      //自己离开
      case "finish Score":
        console.log("finish Score--------------------------------------")
        clearInterval(timer);
        wx.showLoading({
          title: '对战已结束...',
        })
        setTimeout(function () {
          wx.hideLoading();
          console.log("battleID------------" + battleID)
          wx.redirectTo({
            url: `../../warend/warend?battleID=` + battleID
          })
        }, 2000)
        break;
    }
  })
}

//用户答题 提交数据库
function testSubmit() {

  //当前试题
  var testCurrent = that.data.testCurrent - 1;
  var testDataCurrent = testData.battleTestInfo[testCurrent];

  console.log(testCurrent)
  console.log(testDataCurrent)

  var testDataCurrent_itemInfo = JSON.parse(testDataCurrent.TestJson);

  //正确答案
  var testAnswer = testDataCurrent.Answer;
  console.log(testAnswer)
  //是否正确
  var isRight = userAnswer == testAnswer ? true : false;
  console.log(isRight)
  //回答时间
  var answerTime = that.data.testTimeshow;

  var data = {
    battleID: testData.battleInfo.battleID,
    userID: that.data.myUserID,
    examTestID: testDataCurrent.ExamTestID,
    appID: testDataCurrent.AppID,
    userType: that.data.myUserType,
    answerTime: answerTime,
    isRigth: isRight,
    answer: userAnswer
  };


  //立即更新答题信息
  var char = ["A", "B", "C", "D", "E", "F", "G", "H"];
  var user = 'testInfo[0].user';
  var userRight = 'testInfo[0].userRight';
  var answer = 'testInfo[0].answer';
  that.setData({
    [user]: char.indexOf(userAnswer),
    [userRight]: isRight + "",
    isMyTimeOut: true,
  })

  //只更新分数
  wx.request({
    url: baseUrl + 'api/battle/battleApp/submit',
    header: {
      'content-type': 'application/json'
    },
    data: data,
    method: 'POST',
    success: function (res) {
      wx.hideLoading();
      if (res.data.status == 200) {
        that.setData({
          myScore: parseInt(that.data.myScore) + parseInt(res.data.data.score),
          // [user]: char.indexOf(userAnswer),
          // [userRight]: (res.data.data.isRigth) == 1 ? "true" : "false",
          // isMyTimeOut: true,
        })
        console.log(res.data.status + "提交试题成功")
        if (that.data.isHeTimeOut) {
          var he = 'testInfo[0].he';
          var heRight = 'testInfo[0].heRight';
          var answer = 'testInfo[0].answer';
          that.setData({
            heScore: parseInt(that.data.heScore) + heDataScore,
            [he]: heDataHe,
            [heRight]: heDataRight,
            [answer]: char.indexOf(testDataCurrent.Answer), //数字对应选择   
          })
        }
      } else if (res.data.status == 201) {
        console.log(res.data.status + "提交试题201")
        clearInterval(timer);
        wx.showLoading({
          title: res.data.data,
        })
        setTimeout(function () {
          wx.hideLoading();
          wx.redirectTo({
            url: `../../warend/warend?battleID=` + battleID
          })
        }, 2000)
      } else {
        console.log(res.data.status + "提交试题出错了")
        wx.showModal({
          title: '',
          content: res.data.data,
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
    fail: function () {
      console.log('接口出错')
    }
  })

} 