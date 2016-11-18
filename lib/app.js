'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['\n      <div class="versionbits mdl-layout mdl-js-layout mdl-layout--no-desktop-drawer-button mdl-layout--fixed-header">\n        <header style="display:none" class="mdl-layout__header mdl-layout__header--transparent mdl-layout__header--scroll">\n          <div class="mdl-layout__header-row">\n            <span class="mdl-layout-title">Bitcoin Version Bits Tracker</span>\n            <div class="mdl-layout-spacer"></div>\n            <nav class="mdl-navigation">\n              <a class="mdl-navigation__link" href="">Link</a>\n              <a class="mdl-navigation__link" href="">Link</a>\n              <a class="mdl-navigation__link" href="">Link</a>\n              <a class="mdl-navigation__link" href="">Link</a>\n            </nav>\n          </div>\n        </header>\n        <div class="mdl-layout__content">\n          <div class="mdl-grid">\n            ', '\n            ', '\n          </div>\n        </div>\n      </div>\n    '], ['\n      <div class="versionbits mdl-layout mdl-js-layout mdl-layout--no-desktop-drawer-button mdl-layout--fixed-header">\n        <header style="display:none" class="mdl-layout__header mdl-layout__header--transparent mdl-layout__header--scroll">\n          <div class="mdl-layout__header-row">\n            <span class="mdl-layout-title">Bitcoin Version Bits Tracker</span>\n            <div class="mdl-layout-spacer"></div>\n            <nav class="mdl-navigation">\n              <a class="mdl-navigation__link" href="">Link</a>\n              <a class="mdl-navigation__link" href="">Link</a>\n              <a class="mdl-navigation__link" href="">Link</a>\n              <a class="mdl-navigation__link" href="">Link</a>\n            </nav>\n          </div>\n        </header>\n        <div class="mdl-layout__content">\n          <div class="mdl-grid">\n            ', '\n            ', '\n          </div>\n        </div>\n      </div>\n    ']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events');
var old = require('old');
var onObj = require('on-object');
var vdom = require('virtual-dom');
var mainLoop = require('main-loop');
var hyperx = require('hyperx');
var assign = require('object-assign');

var _require = require('./bitcoin.js'),
    createNode = _require.createNode,
    createVbits = _require.createVbits;

var Node = require('./components/node.js');
var Deployments = require('./components/deployments.js');

var App = function (_EventEmitter) {
  _inherits(App, _EventEmitter);

  function App(el) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this));

    _this.state = {
      sync: {
        block: null,
        synced: false,
        height: 0,
        startHeight: 0
      },
      peers: [],
      deployments: []
    };

    _this.hx = hyperx(vdom.h);
    _this.loop = mainLoop(_this.state, _this.render.bind(_this), vdom);

    _this.node = createNode('bitcoin');
    _this.vbits = createVbits('bitcoin', _this.node);
    return _this;
  }

  _createClass(App, [{
    key: 'registerListeners',
    value: function registerListeners() {
      var node = this.node,
          vbits = this.vbits,
          state = this.state;
      var peers = node.peers,
          chain = node.chain;

      var updateState = this.updateState.bind(this);

      onObj(peers).on({
        peer: function peer(block) {
          var peerHeight = peers.getPeerChainHeight();
          if (peerHeight > state.sync.height) {
            state.sync.height = peerHeight;
          }
          updateState({ peers: peers.peers });
        }
      });
      onObj(chain).on({
        block: function block(_block) {
          if (_block.height > state.sync.height) {
            state.sync.height = _block.height;
          }
          updateState();
        }
      });
      onObj(node).on({
        synced: function synced() {
          state.sync.synced = true;
        }
      });

      var updateDeployments = function updateDeployments() {
        var deployments = vbits.deployments.filter(function (d) {
          return !d.unknown || d.count > 50;
        }).map(function (d) {
          if (d.status !== 'started') return d;
          if (!state.sync.block) return d;
          var elapsed = state.sync.block.height - d.startHeight;
          var period = Math.min(elapsed, 2016);
          return assign({
            support: d.rollingCount[d.rollingCount.length - 1] / period
          }, d);
        });
        updateState({ deployments: deployments });
      };

      var updateInitialSync = function updateInitialSync(block) {
        state.sync.startHeight = block.height;
        state.sync.block = block;
        updateDeployments();
      };

      onObj(vbits).on({
        ready: function ready() {
          var _this2 = this;

          updateDeployments();
          vbits.getHash(function (err, hash) {
            if (err) return _this2.emit('error', err);
            if (!hash) {
              chain.getBlockAtHeight(vbits.params.startHeight, function (err, block) {
                if (err) return _this2.emit('error', err);
                updateInitialSync(block);
              });
              return;
            }
            chain.getBlock(hash, function (err, block) {
              if (err) return _this2.emit('error', err);
              updateInitialSync(block);
            });
          });
        },
        update: function update() {
          updateDeployments();
        },
        block: function block(_block2) {
          state.sync.block = _block2;
          updateDeployments();
        }
      });
    }
  }, {
    key: 'updateState',
    value: function updateState(d) {
      this.loop.update(assign(this.state, d));
    }
  }, {
    key: 'start',
    value: function start() {
      this.registerListeners();
      this.node.start();
    }
  }, {
    key: 'render',
    value: function render(state) {
      var hx = this.hx;
      return hx(_templateObject, Deployments(state.deployments, state.sync.block ? state.sync.block.height : 0), Node(state.sync, state.peers));
    }
  }, {
    key: 'element',
    get: function get() {
      return this.loop.target;
    }
  }]);

  return App;
}(EventEmitter);

module.exports = old(App);