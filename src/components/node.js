'use strict'

module.exports = function (hx, block, peers) {
  return hx`
    <div class="mdl-cell mdl-cell--4-col mdl-grid">
      <div class="mdl-cell mdl-cell--12-col side-card blockchain-card mdl-card mdl-shadow--2dp">
        <div class="mdl-card__supporting-text">
          <h3>Blockchain Sync</h3>
          ${block ? hx`
            <div>
              <div id="p1" class="mdl-progress mdl-js-progress"></div>
              <span class="height">#${block.height || 0} (${new Date((block.header.timestamp || 0) * 1000).toLocaleDateString()})</span>
              <code class="hash">${block.header.getId()}</code>
            </div>
          ` : null}
        </div>
      </div>
      <div class="mdl-cell mdl-cell--12-col side-card peer-card mdl-card mdl-shadow--2dp">
        <div class="mdl-card__supporting-text">
          <h3>P2P Networking</h3>
          <ul class="mdl-list">
          ${peers.map((peer) => hx`
            <li class="mdl-list__item">
              <span class="mdl-list__item-primary-content">
                ${peer.version.userAgent}
              </span>
            </li>
          `)}
          </ul>
        </div>
      </div>
    </div>
  `
}
