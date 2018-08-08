var util = require('../../../utils/util.js');
const app = getApp();
var that;
let isTest = true;
const testBaseUrl = 'https://yzryserver.tibosi.com:8046/'
const prodBaseUrl = 'https://wxinfoapi.tibosi.com/'
let baseUrl = isTest ? testBaseUrl : prodBaseUrl;
var testData;
var battleID;
var examTestID;
var that;
Page({
  data: {
    //我的信息
    myName: "hello",
    myScore: -1,
    myImg: 'https://yzryimg.tibosi.com/images/yuan.png',
    myUserID: -1,
    //对手信息
    heName: "Hi",
    heScore: -1,
    heImg: 'https://yzryimg.tibosi.com/images/yuan.png',
    heUserID: -1,

    //当前题号
    currentTab: 0,
    testCount: 5,
    //软件名称 每道题都不一样
    softName: [],

    ui_battle_right: "https://yzryimg.tibosi.com/images/ui_battle_right.png",
    ui_battle_wrong: "https://yzryimg.tibosi.com/images/ui_battle_wrong.png",
    ui_battle_kong: "https://yzryimg.tibosi.com/images/kong.png",

    testHeight: 300,
    explainHeight: 300,
    //是否滑动完成
    isOver: false,


    //试题  
    testArray: [
      {
        title: "",
        itemArray: [],
        explain: "",
        user: -1,
        he: -1,
        userRight: "false",
        heRight: "false",
        answer: -1//数字对应选择  
      }
    ],

  },

  height: function () {
    //创建节点选择器
    var query = wx.createSelectorQuery();
    //试题高度
    query.selectAll('.test-swiper-item').boundingClientRect()
    query.exec(function (res) {
      that.setData({ testHeight: res[0][that.data.currentTab].height });
    })

    //解析高度
    query = wx.createSelectorQuery();
    query.selectAll('.explain-swiper-item').boundingClientRect()
    query.exec(function (res) {
      that.setData({ explainHeight: res[0][that.data.currentTab].height + 30 });
    })
  },

  /*** 滑动切换tab***/
  bindchange: function (e) {
    if (that.data.isOver) {
      that.setData({ isOver: false });
      return
    }
    if (e.detail.current > that.data.currentTab) {
      swichNav("next")
    } else {
      swichNav("perv")
    }
  },

  catchTouchMove: function (res) {
    //console.log("解析禁止滑动-----------------" + JSON.stringify(res))
    return false
  },

  /*** 点击tab切换***/
  swichNav: function (e) {
    var tarName = e.currentTarget.dataset.name
    that.setData({ isOver: true });
    swichNav(tarName)
  },

  // 页面加载完成
  onLoad: function (options) {
    that = this;
    wx.showShareMenu({
      withShareTicket: true,
      success: function (res) {

      },
      fail: function (res) {
        console.log(res)
      }
    })


    battleID = options.battleID; //3  
  },
  // 页面渲染完成
  onReady: function (options) {
    wx.showLoading({
      title: '正在加载试题',
    })

    //that = this;
    //精彩回顾
    setTimeout(function () {
      battleInfoDetail();
    }, 1000)
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  onShareAppMessage: function (options) {
    var shareObj = {}; 
    var i = that.data.currentTab;
    var examTestID = testData[i].ExamTestID; 
    shareObj = {
      title: '帮助别人，快乐自己！邀你一起来看看这题肿么肥四！',
      path: 'pages/home/home?type=help&battleID=' + battleID + '&examTestID=' + examTestID,
      success: function (res) {
        console.log(battleID + "----------" + testData[i].ExamTestID)
      },
      fail: function (res) {
        // 分享失败
        console.log(res)
      }
    }
    return shareObj;
  },
});

function swichNav(tarName) {
  if (tarName == "next") {
    if (that.data.currentTab == that.data.testCount - 1) {
      wx.showToast({
        title: '最后一题',
        icon: 'success',
        duration: 2000
      });
      setTimeout(function () {
        that.setData({ isOver: false })
      }, 500)
      return
    }

    that.setData({
      currentTab: (that.data.currentTab) + 1
    });
  } else {
    if (that.data.currentTab == 0) {
      wx.showToast({
        title: '第一题',
        icon: 'success',
        duration: 2000
      });
      setTimeout(function () {
        that.setData({ isOver: false })
      }, 500)
      return

    }
    that.setData({
      currentTab: (that.data.currentTab) - 1
    });

  }
  that.height()

  setTimeout(function () {
    that.setData({ isOver: false })
  }, 500)
}


//精彩回顾
function battleInfoDetail() {

  var data = {
    battleID: battleID
  }
  wx.request({
    url: baseUrl + 'api/battle/battleApp/battleInfoDetail',
    header: {
      'content-type': 'application/json'
    },
    data: data,
    method: 'POST',
    success: function (res) {
      wx.hideLoading();
      console.log(res)
      if (res.data.status == 200) {
        //拼接试题
        var data = res.data.data;
        testData = data.battleDetail;

        var testArray = [];
        var softNameAray = [];
        //用户信息 
        that.setData({
          myScore: data.battleInfo.totalInfo[0].TotalScore,
          myName: data.battleInfo.totalInfo[0].WxName,
          myImg: data.battleInfo.totalInfo[0].HandImagUrl,
          myUserID: data.battleInfo.totalInfo[0].UserID,

          heScore: data.battleInfo.totalInfo[1].TotalScore,
          heName: data.battleInfo.totalInfo[1].WxName,
          heImg: data.battleInfo.totalInfo[1].HandImagUrl,
          heUserID: data.battleInfo.totalInfo[1].UserID,
        })

        var myUserID = data.battleInfo.totalInfo[0].UserID;

        //试题信息
        for (var i = 0; i < data.battleDetail.length; i++) {
          var testObj = {};
          var testJson = JSON.parse(data.battleDetail[i].TestJson);
          testObj.title = testJson.Title;
          testObj.itemArray = testJson.SelectedItem;
          testObj.explain = testJson.Explain == "" ? "略" : testJson.Explain;
          softNameAray.push(data.battleDetail[i].AppName);
          var char = ["A", "B", "C", "D", "E", "F", "G", "H"];
          testObj.answer = char.indexOf(testJson.Answer);
          //区分 我是创建者还是接受者
          for (var j = 0; j < data.battleDetail[i].Child.length; j++) {
            var testChild = data.battleDetail[i].Child[j];
            if (testChild.UserID == myUserID) {
              testObj.user = char.indexOf(testChild.UserAnswer || "-1");
              testObj.userRight = (testChild.IsRight == 0 ? "false" : "true");
            } else {
              testObj.he = char.indexOf(testChild.UserAnswer || "-1");
              testObj.heRight = (testChild.IsRight == 0 ? "false" : "true");
            }
          }
          testArray.push(testObj);
        };
        that.setData({
          testCount: data.battleDetail.length,
          testArray: testArray,
          softName: softNameAray,
        });
        that.height()
      } else {
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
 