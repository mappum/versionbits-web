'use strict'

const vdom = require('virtual-dom')
const mainLoop = require('main-loop')
const hyperx = require('hyperx')

const EventEmitter = require('events')
const assign = require('object-assign')
const work = require('webworkify')
const workerStream = require('workerstream')
require('setimmediate')

var state = {
  chainTip: { height: 0, hash: '' },
  vbSync: { height: 0, hash: '' },
  peers: [],
  deployments: []
}

var hx = hyperx(vdom.h)
var loop = mainLoop(state, render, vdom)
document.querySelector('#app').appendChild(loop.target)

var worker = createNodeWorker()
worker.on('peer', (peer) => {
  state.peers.push(peer)
  loop.update(state)
})
worker.on('block', (tip) => {
  loop.update(assign(state, { chainTip: tip }))
})
worker.on('vbits', (data) => {
  if (data.sync) state.vbSync = data.sync
  state.deployments = data.deployments
  loop.update(state)
})

function createNodeWorker () {
  var nw = new EventEmitter()
  var worker = nw.worker = work(require('./nodeWorker.js'))
  var stream = nw.stream = workerStream(worker)
  stream.on('data', ({ event, data }) => nw.emit(event, data))
  return nw
}

function render (state) {
  return hx`<div>
    <h1>blockchain sync:</h1>
    <span>
      ${state.chainTip.height}
      <span> - </span>
      ${state.chainTip.hash}
    </span>
    <h1>versionbits sync:</h1>
    <span>
      ${state.vbSync.height}
      <span> - </span>
      ${state.vbSync.hash}
    </span>
    <h1>peers (${state.peers.length}):</h1>
    <ul>
    ${state.peers.map((peer) => hx`
      <li>
        <span>${peer.version.userAgent}</span>
      </li>
    `)}
    </ul>
    <h1>deployments:</h1>
    <ul>
    ${state.deployments.map((dep) => {
      if (dep.unknown && dep.count < 10) return
      return hx`<li>
        <span>${dep.name}</span>
        <span> - </span>
        <span>${dep.status}</span>
        <span> - </span>
        <span>${dep.count}</span>
      </li>`
    })}
    </ul>
    <button onclick=${reset}>Reset State</button>
  </div>`
}

function reset () {
  window.indexedDB.deleteDatabase('IDBWrapper-bitcoin.node')
  window.indexedDB.deleteDatabase('IDBWrapper-bitcoin.versionbits')
  window.location.reload()
}
