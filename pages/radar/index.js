 import * as echarts from '../../ec-canvas/echarts';
 const app = getApp();

 function initChart(canvas, width, height) {
   const chart = echarts.init(canvas, null, {
     width: width,
     height: height
   });
   canvas.setChart(chart);

   var option = {
     backgroundColor: "rgb(62,108,252)",
     color: ["#FFFFFF"],
     tooltip: {},
     xAxis: {
       show: false
     },
     yAxis: {
       show: false
     },
     radar: {
       // shape: 'circle',
       indicator: [{
           name: '临床',
           max: 500,
           color:"#FFF"
         },
         {
           name: '护士',
           max: 500,
           color: "#FFF"
         },
         {
           name: '乡村全科',
           max: 500,
           color: "#FFF"
         },
         {
           name: '公卫',
           max: 500,
           color: "#FFF"
         },
         {
           name: '中西医',
           max: 500,
           color: "#FFF"
         },
         {
           name: '中医',
           max: 500,
           color: "#FFF"
         },
         {
           name: '口腔',
           max: 500,
           color: "#FFF"
         }
       ]
     },
     series: [{
       name: '汇总',
       type: 'radar',
       data: [{
         value: [430, 340, 500, 300, 490, 400, 300], //[临床，护士，乡村全科，公卫，中西医，中医，口腔]
         name: '汇总'
       }]
     }]
   };

   chart.setOption(option);
   return chart;
 }

 Page({
   onShareAppMessage: function(res) {
     return {
       title: 'ECharts',
       path: '/pages/index/index',
       success: function() {},
       fail: function() {}
     }
   },
   data: {
     ec: {
       onInit: initChart
     }
   },
   onReady() {}
 });

 function setCord() {


 }