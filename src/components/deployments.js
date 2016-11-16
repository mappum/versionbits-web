'use strict'

const { h } = require('virtual-dom')
const hx = require('hyperx')(h)
const LineChart = require('chartist').Line

const CHART_UPDATE_INTERVAL = 2000

class Chart {
  constructor (data) {
    this.type = 'Widget'
    this.data = data
  }

  init () {
    var el = document.createElement('div')
    el.className = 'chart'
    this.chart = new LineChart(el, {
      series: [ this.data ]
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
      },
      smoothLine: false
    })
    this.drawTargetLine(this.chart, 1915)
    this.updatedAt = Date.now()
    return el
  }

  update (prev, el) {
    this.chart = prev.chart
    this.updatedAt = prev.updatedAt

    var elapsed = Date.now() - prev.updatedAt
    if (elapsed > CHART_UPDATE_INTERVAL) {
      prev.chart.update({ series: [ this.data ] })
      this.updatedAt = Date.now()
    }
  }

  destroy () {}

  drawTargetLine (chart, value, className) {
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
}

function deployment (d) {
  if (d.id !== 'segwit') return null

  var defined = d.status === 'defined'
  var started = d.status === 'started'
  var lockedIn = d.status === 'lockedIn'
  var activated = d.status === 'activated'

  return hx`
    <div class="mdl-cell mdl-cell--12-col deployment-card deployment-${d.status} mdl-card mdl-shadow--2dp">
      ${started ? hx`
        <div class="mdl-card__media">
          ${new Chart(d.rollingCount)}
        </div>
      ` : null}

      <div class="mdl-card__title">
        <div>
          <h2 class="mdl-card__title-text">${d.name}</h2>
          ${defined ? hx`
            <p class="mdl-card__subtitle-text">Not started yet</p>
          ` : null}
        </div>
      </div>

      <div class="mdl-card__supporting-text">
        ${defined ? hx`
          <div class="stat begin-date">
            <label>Deployment Start Time</label>
            <span class="value">${new Date(d.start * 1000).toLocaleString()}</span>
          </div>
        ` : null}
        ${started ? hx`
          <div>
            <div id="deployment-${d.id}-support" class="stat support">
              <label>Miner Support</label>
              <span class="value">${(d.support * 100).toFixed(1)}</span>
              <span class="unit">%</span>
              <span class="mdl-tooltip" for="deployment-${d.id}-support">
                Based on the last 2016 blocks
              </span>
            </div>
            <div id="deployment-${d.id}-rolling-count" class="stat rolling-count">
              <label>Count (Last 2016)</label>
              <span class="value">${d.rollingCount[d.rollingCount.length - 1]}</span>
              <span class="unit">blocks</span>
            </div>
            <div id="deployment-${d.id}-count" class="stat count">
              <label>Count (This Period)</label>
              <span class="value">${d.count}</span>
              <span class="unit">blocks</span>
            </div>
          </div>
        ` : null}
        ${lockedIn ? hx`
          <div>
            <p class="succeeded">
              <i class="material-icons">done</i>
              <span> </span>
              <span>The deployment suceeded!</span>
            </p>
            <p>
              <span>The new rules will come into effect on: </span>
              <strong>block #${d.activationHeight}</strong>
            </p>
          </div>
        ` : null}
        ${activated ? hx`
          <div>
            <p class="succeeded">
              <i class="material-icons">done all</i>
              <span> </span>
              <span>Active since block <strong>#${d.activationHeight}</strong></span>
            </p>
          </div>
        ` : null}
        </div>
    </div>
  `
}

module.exports = function (deployments) {
  return hx`
    <div class="deployments mdl-cell mdl-cell--8-col mdl-grid">
      ${deployments.map(deployment)}
    </div>
  `
}
