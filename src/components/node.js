'use strict'

const h = require('virtual-dom/h')
const hx = require('hyperx')(h)
const ProgressBar = require('./progressBar.js')

function reset () {
  window.indexedDB.deleteDatabase('IDBWrapper-bitcoin.node')
  window.indexedDB.deleteDatabase('IDBWrapper-bitcoin.versionbits')
  window.location.reload()
}

module.exports = function (sync, peers) {
  const { block, startHeight, height } = sync

  var progress = ((block ? block.height : 0) - startHeight) /
    (height - startHeight) * 100
  var synced = sync.synced && height === block.height

  return hx`
    <div class="mdl-cell mdl-cell--4-col mdl-grid">
      <div class="mdl-cell mdl-cell--12-col side-card blockchain-card mdl-card mdl-shadow--1dp">
        <div class="mdl-card__supporting-text">
          <h3>Blockchain Sync</h3>
          ${block ? hx`
            <div>
              ${synced ? hx`
                <span class="uptodate">
                  <i class="material-icons">done</i>
                  Up-to-date
                </span>
              ` : ProgressBar(progress)}
              <span class="height"><strong>#${block.height || 0}</strong> - ${new Date((block.header.timestamp || 0) * 1000).toLocaleDateString()}</span>
              <code class="hash">${block.header.getId()}</code>
              <br>
              <button onclick=${reset} class="mdl-button mdl-js-button">
                Re-sync
              </button>
            </div>
          ` : null}
        </div>
      </div>
      <div class="mdl-cell mdl-cell--12-col side-card peer-card mdl-card mdl-shadow--1dp">
        <div class="mdl-card__supporting-text">
          <h3>P2P Connections</h3>
          <ul class="mdl-list">
          ${peers.map((peer) => hx`
            <li class="mdl-list__item mdl-list__item--two-line">
              <span class="mdl-list__item-primary-content">
                <span>${peer.socket.pxpConnectInfo.bridge.destAddress}</span>
                <span class="mdl-list__item-sub-title">${peer.version.userAgent}</span>
              </span>
            </li>
          `)}
          </ul>
        </div>
      </div>
    </div>
  `
}
