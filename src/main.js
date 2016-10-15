'use strict'

const App = require('./app.js')
const app = new App(document.body)
app.start()

const Chart = require('chartist').Line
var chart = new Chart('#chart', {
  series: [[ 471, 849, 899, 903, 1421, 1649, 1915, 0, 178 ]]
}, {
  low: 0,
  high: 2016,
  fullWidth: true,
  showPoint: false,
  showGrid: false,
  showArea: true,
  axisX: { offset: 0, showGrid: false },
  axisY: { showLabel: false, offset: 0, showGrid: false },
  width: '100%',
  height: '100%',
  chartPadding: {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  }
})
function drawTargetLine (chart, value, className) {
  chart.on('created', function (ctx) {
    var targetLineY = ctx.chartRect.y1 - (ctx.chartRect.height() / ctx.bounds.max * value)

    ctx.svg.elem('line', {
      x1: ctx.chartRect.x1,
      x2: ctx.chartRect.x2,
      y1: targetLineY,
      y2: targetLineY
    }, className || 'ct-targetline')
    ctx.svg.elem('text', {
      x: ctx.chartRect.x1 + 8,
      y: targetLineY - 5
    }, (className || 'ct-targetline') + '-label')
      .text('Lock-in Threshold')
  })
}
drawTargetLine(chart, 1915)
