'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var old = require('old');

var ProgressBar = function () {
  function ProgressBar(value) {
    _classCallCheck(this, ProgressBar);

    this.type = 'Widget';
    this.value = value;
  }

  _createClass(ProgressBar, [{
    key: 'init',
    value: function init() {
      var _this = this;

      var el = document.createElement('div');
      el.classList.add('mdl-progress', 'mdl-js-progress');
      el.addEventListener('mdl-componentupgraded', function () {
        el.MaterialProgress.setProgress(_this.value);
      });
      window.componentHandler.upgradeElement(el);
      return el;
    }
  }, {
    key: 'update',
    value: function update(prev, el) {
      el.MaterialProgress.setProgress(this.value);
    }
  }, {
    key: 'destroy',
    value: function destroy() {}
  }]);

  return ProgressBar;
}();

module.exports = old(ProgressBar);