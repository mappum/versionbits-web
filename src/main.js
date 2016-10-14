'use strict'

const vdom = require('virtual-dom')
const mainLoop = require('main-loop')
const hyperx = require('hyperx')
const assign = require('object-assign')
const level = require('level-browserify')
const pump = require('pump')
const { toHash } = require('bitcoin-util')
const webcoin = require('webcoin')
const versionbits = require('versionbits')

const Chart = require('chartist').Line
var chart = new Chart('#chart', {
  series: [[ 471, 849, 899, 903, 1421, 1649, 1915, 0, 178 ]]
}, {
  low: 0,
  high: 2016,
  fullWidth: true,
  showPoint: false,
  showGrid: false,
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

const networks = {
  bitcoin: {
    params: require('webcoin-bitcoin'),
    checkpoints: [{
      height: 399168,
      header: {
        version: 4,
        prevHash: toHash('0000000000000000074f9edbfc07648dc74392ba8248f0983ffea63431b3bc20'),
        merkleRoot: toHash('0ed1b9a40f94aec95e2843369bdcabaa42f860c82391c54874a7c193d7268eaa'),
        timestamp: 1455885256,
        bits: 403093919,
        nonce: 3889666804
      }
    }]
  }
}

function main () {
  var state = {
    chain: {
      block: null,
      synced: false
    },
    vbits: {
      block: null,
      synced: false
    },
    peers: [],
    deployments: []
  }

  var hx = hyperx(vdom.h)
  var loop = mainLoop(state, render(hx), vdom)
  document.querySelector('#app').appendChild(loop.target)

  var updateState = (d) => loop.update(assign(state, d))

  var node = createNode('bitcoin')
  var vbits = createVbits('bitcoin', node)
  var updatePeers = () => updateState({ peers: node.peers.peers })
  node.peers.on('peer', (peer) => {
    updatePeers()
    peer.once('disconnect', updatePeers)
  })
  node.chain.on('block', (block) => {
    state.chain.block = block
    updateState()
  })
  node.on('synced', () => {
    var chain = state.chain
    chain.synced = true
    updateState({ chain })
  })
  vbits.on('block', (block) => {
    console.log('vbits block', block)
    state.vbits.block = block
    updateState()
  })
  vbits.once('ready', () => {
    var { deployments } = vbits
    updateState({ deployments })
  })
  vbits.on('update', updateState)
  node.start()
}
main()

function render (hx) {
  return (state) =>
    hx`<div>
      <h1>blockchain sync:</h1>
      ${state.chain.block ? hx`
        <span>
          ${state.chain.block.height}
          <span> - </span>
          ${state.chain.block.header.getId()}
        </span>
      ` : null}
      ${state.chain.synced ? hx`
        <p>Up to date.</p>
      ` : null}
      <h1>versionbits sync:</h1>
      ${state.vbits.block ? hx`
        <span>
          ${state.vbits.block.height}
          <span> - </span>
          ${state.vbits.block.header.getId()}
        </span>
      ` : null}
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

function createNode (id) {
  const { params, checkpoints } = networks[id]
  if (checkpoints) params.blockchain.checkpoints = checkpoints
  const nodeDb = level(`${id}.node`)
  return webcoin(params, nodeDb)
}

function createVbits (id, { chain }) {
  let { params } = networks[id]
  let vbitsDb = level(`${id}.versionbits`)
  let vbits = versionbits(params.versionbits, vbitsDb)
  chain.onceReady(() => {
    console.log('blockchain is ready')
    chain.getBlockAtHeight(399168, (err, block) => {
      if (err) return console.log(err)
      console.log(block)
      vbits.getHash((err, hash) => {
        if (err) return console.log(err)
        pump(
          chain.createReadStream({ from: hash || block.header.getHash() }),
          vbits,
          (err) => {
            if (err) console.log(err.stack)
          })
      })
    })
  })
  return vbits
}
