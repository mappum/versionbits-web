'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['\n    <div class="mdl-cell mdl-cell--12-col deployment-card deployment-', ' mdl-card mdl-shadow--2dp">\n      ', '\n\n      <div class="mdl-card__title">\n        <div>\n          <h2 class="mdl-card__title-text">', '</h2>\n        </div>\n      </div>\n\n      <div class="mdl-card__supporting-text">\n        ', '\n        ', '\n        ', '\n        ', '\n        </div>\n    </div>\n  '], ['\n    <div class="mdl-cell mdl-cell--12-col deployment-card deployment-', ' mdl-card mdl-shadow--2dp">\n      ', '\n\n      <div class="mdl-card__title">\n        <div>\n          <h2 class="mdl-card__title-text">', '</h2>\n        </div>\n      </div>\n\n      <div class="mdl-card__supporting-text">\n        ', '\n        ', '\n        ', '\n        ', '\n        </div>\n    </div>\n  ']),
    _templateObject2 = _taggedTemplateLiteral(['\n        <div class="mdl-card__media">\n          ', '\n        </div>\n      '], ['\n        <div class="mdl-card__media">\n          ', '\n        </div>\n      ']),
    _templateObject3 = _taggedTemplateLiteral(['\n          <div class="stat begin-date">\n            <label>Deployment Start Time</label>\n            <span class="value">', '</span>\n          </div>\n        '], ['\n          <div class="stat begin-date">\n            <label>Deployment Start Time</label>\n            <span class="value">', '</span>\n          </div>\n        ']),
    _templateObject4 = _taggedTemplateLiteral(['\n          <div>\n            <div id="deployment-', '-support" class="stat support">\n              <label>Miner Support</label>\n              <span class="value">', '</span>\n              <span class="unit">%</span>\n              <span class="mdl-tooltip" for="deployment-', '-support">\n                Based on the last 2016 blocks\n              </span>\n            </div>\n            <div id="deployment-', '-rolling-count" class="stat rolling-count">\n              <label>Count (Last 2016)</label>\n              <span class="value">', '</span>\n              <span class="unit">blocks</span>\n            </div>\n            <div id="deployment-', '-count" class="stat count">\n              <label>Count (This Period)</label>\n              <span class="value">', '</span>\n              <span class="unit">blocks</span>\n            </div>\n          </div>\n        '], ['\n          <div>\n            <div id="deployment-', '-support" class="stat support">\n              <label>Miner Support</label>\n              <span class="value">', '</span>\n              <span class="unit">%</span>\n              <span class="mdl-tooltip" for="deployment-', '-support">\n                Based on the last 2016 blocks\n              </span>\n            </div>\n            <div id="deployment-', '-rolling-count" class="stat rolling-count">\n              <label>Count (Last 2016)</label>\n              <span class="value">', '</span>\n              <span class="unit">blocks</span>\n            </div>\n            <div id="deployment-', '-count" class="stat count">\n              <label>Count (This Period)</label>\n              <span class="value">', '</span>\n              <span class="unit">blocks</span>\n            </div>\n          </div>\n        ']),
    _templateObject5 = _taggedTemplateLiteral(['\n          <div>\n            <p class="succeeded">\n              <i class="material-icons">done</i>\n              <span> </span>\n              <span>The deployment suceeded!</span>\n            </p>\n            <p>\n              <span>The new rules will come into effect on: </span>\n              <strong>block #', '</strong>\n            </p>\n          </div>\n        '], ['\n          <div>\n            <p class="succeeded">\n              <i class="material-icons">done</i>\n              <span> </span>\n              <span>The deployment suceeded!</span>\n            </p>\n            <p>\n              <span>The new rules will come into effect on: </span>\n              <strong>block #', '</strong>\n            </p>\n          </div>\n        ']),
    _templateObject6 = _taggedTemplateLiteral(['\n          <div>\n            <p class="succeeded">\n              <i class="material-icons">done all</i>\n              <span> </span>\n              <span>Active since block <strong>#', '</strong></span>\n            </p>\n          </div>\n        '], ['\n          <div>\n            <p class="succeeded">\n              <i class="material-icons">done all</i>\n              <span> </span>\n              <span>Active since block <strong>#', '</strong></span>\n            </p>\n          </div>\n        ']),
    _templateObject7 = _taggedTemplateLiteral(['\n    <div class="deployments mdl-cell mdl-cell--8-col mdl-grid">\n      ', '\n    </div>\n  '], ['\n    <div class="deployments mdl-cell mdl-cell--8-col mdl-grid">\n      ', '\n    </div>\n  ']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('virtual-dom'),
    h = _require.h;

var hx = require('hyperx')(h);
var LineChart = require('chartist').Line;

var CHART_UPDATE_INTERVAL = 2000;

var Chart = function () {
  function Chart(data) {
    _classCallCheck(this, Chart);

    this.type = 'Widget';
    this.data = data;
  }

  _createClass(Chart, [{
    key: 'init',
    value: function init() {
      var el = document.createElement('div');
      el.className = 'chart';
      this.chart = new LineChart(el, {
        series: [this.data]
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
      });
      this.drawTargetLine(this.chart, 1916);
      this.updatedAt = Date.now();
      return el;
    }
  }, {
    key: 'update',
    value: function update(prev, el) {
      this.chart = prev.chart;
      this.updatedAt = prev.updatedAt;

      var elapsed = Date.now() - prev.updatedAt;
      if (elapsed > CHART_UPDATE_INTERVAL) {
        prev.chart.update({ series: [this.data] });
        this.updatedAt = Date.now();
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {}
  }, {
    key: 'drawTargetLine',
    value: function drawTargetLine(chart, value, className) {
      chart.on('created', function (ctx) {
        var targetLineY = ctx.chartRect.y1 - ctx.chartRect.height() / ctx.bounds.max * value;

        ctx.svg.elem('line', {
          x1: ctx.chartRect.x1,
          x2: ctx.chartRect.x2,
          y1: targetLineY,
          y2: targetLineY
        }, className || 'ct-targetline');
        ctx.svg.elem('text', {
          x: ctx.chartRect.x1 + 8,
          y: targetLineY - 5
        }, (className || 'ct-targetline') + '-label').text('Lock-in Threshold');
      });
    }
  }]);

  return Chart;
}();

function deployment(d) {
  if (d.id !== 'segwit') return null;

  var defined = d.status === 'defined';
  var started = d.status === 'started';
  var lockedIn = d.status === 'lockedIn';
  var activated = d.status === 'activated';

  return hx(_templateObject, d.status, started ? hx(_templateObject2, new Chart(d.rollingCount)) : null, d.name, defined ? hx(_templateObject3, new Date(d.start * 1000).toLocaleString()) : null, started ? hx(_templateObject4, d.id, (d.support * 100).toFixed(1), d.id, d.id, d.rollingCount[d.rollingCount.length - 1], d.id, d.count) : null, lockedIn ? hx(_templateObject5, d.activationHeight) : null, activated ? hx(_templateObject6, d.activationHeight) : null);
}

module.exports = function (deployments) {
  return hx(_templateObject7, deployments.map(deployment));
};