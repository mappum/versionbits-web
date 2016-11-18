'use strict';

var _templateObject = _taggedTemplateLiteral(['\n    <div class="mdl-cell mdl-cell--4-col mdl-grid">\n      <div class="mdl-cell mdl-cell--12-col side-card blockchain-card mdl-card mdl-shadow--1dp">\n        <div class="mdl-card__supporting-text">\n          <h3>Blockchain Sync</h3>\n          ', '\n        </div>\n      </div>\n      <div class="mdl-cell mdl-cell--12-col side-card peer-card mdl-card mdl-shadow--1dp">\n        <div class="mdl-card__supporting-text">\n          <h3>P2P Connections</h3>\n          <ul class="mdl-list">\n          ', '\n          </ul>\n        </div>\n      </div>\n    </div>\n  '], ['\n    <div class="mdl-cell mdl-cell--4-col mdl-grid">\n      <div class="mdl-cell mdl-cell--12-col side-card blockchain-card mdl-card mdl-shadow--1dp">\n        <div class="mdl-card__supporting-text">\n          <h3>Blockchain Sync</h3>\n          ', '\n        </div>\n      </div>\n      <div class="mdl-cell mdl-cell--12-col side-card peer-card mdl-card mdl-shadow--1dp">\n        <div class="mdl-card__supporting-text">\n          <h3>P2P Connections</h3>\n          <ul class="mdl-list">\n          ', '\n          </ul>\n        </div>\n      </div>\n    </div>\n  ']),
    _templateObject2 = _taggedTemplateLiteral(['\n            <div>\n              ', '\n              <span class="height"><strong>#', '</strong> - ', '</span>\n              <code class="hash">', '</code>\n              <br>\n              <button onclick=', ' class="mdl-button mdl-js-button">\n                Re-sync\n              </button>\n            </div>\n          '], ['\n            <div>\n              ', '\n              <span class="height"><strong>#', '</strong> - ', '</span>\n              <code class="hash">', '</code>\n              <br>\n              <button onclick=', ' class="mdl-button mdl-js-button">\n                Re-sync\n              </button>\n            </div>\n          ']),
    _templateObject3 = _taggedTemplateLiteral(['\n                <span class="uptodate">\n                  <i class="material-icons">done</i>\n                  Up-to-date\n                </span>\n              '], ['\n                <span class="uptodate">\n                  <i class="material-icons">done</i>\n                  Up-to-date\n                </span>\n              ']),
    _templateObject4 = _taggedTemplateLiteral(['\n            <li class="mdl-list__item mdl-list__item--two-line">\n              <span class="mdl-list__item-primary-content">\n                <span>', '</span>\n                <span class="mdl-list__item-sub-title">', '</span>\n              </span>\n            </li>\n          '], ['\n            <li class="mdl-list__item mdl-list__item--two-line">\n              <span class="mdl-list__item-primary-content">\n                <span>', '</span>\n                <span class="mdl-list__item-sub-title">', '</span>\n              </span>\n            </li>\n          ']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var h = require('virtual-dom/h');
var hx = require('hyperx')(h);
var ProgressBar = require('./progressBar.js');

function reset() {
  window.indexedDB.deleteDatabase('IDBWrapper-bitcoin.node');
  window.indexedDB.deleteDatabase('IDBWrapper-bitcoin.versionbits');
  window.location.reload();
}

module.exports = function (sync, peers) {
  var block = sync.block,
      startHeight = sync.startHeight,
      height = sync.height;


  var progress = ((block ? block.height : 0) - startHeight) / (height - startHeight) * 100;
  var synced = sync.synced && height === block.height;

  return hx(_templateObject, block ? hx(_templateObject2, synced ? hx(_templateObject3) : ProgressBar(progress), block.height || 0, new Date((block.header.timestamp || 0) * 1000).toLocaleDateString(), block.header.getId(), reset) : null, peers.map(function (peer) {
    return hx(_templateObject4, peer.socket.pxpConnectInfo.bridge.destAddress, peer.version.userAgent);
  }));
};