'use strict'

const vdom = require('virtual-dom')
const mainLoop = require('main-loop')
const hyperx = require('hyperx')

const level = require('level-browserify')
const pump = require('pump')
const VersionBits = require('versionbits')
const Blockchain = require('blockchain-spv')
const { HeaderStream } = require('blockchain-download')
const { PeerGroup } = require('bitcoin-net')
const u = require('bitcoin-util')
const assign = require('object-assign')
require('setimmediate')

const networks = {
  'bitcoin': {
    params: require('webcoin-bitcoin'),
    checkpoints: [{
      height: 399168,
      header: {
        version: 4,
        prevHash: u.toHash('0000000000000000074f9edbfc07648dc74392ba8248f0983ffea63431b3bc20'),
        merkleRoot: u.toHash('0ed1b9a40f94aec95e2843369bdcabaa42f860c82391c54874a7c193d7268eaa'),
        timestamp: 1455885256,
        bits: 403093919,
        nonce: 3889666804
      }
    }]
  }
}
const vbits = createVersionBitsClient('bitcoin', networks.bitcoin)

var state = {
  chainTip: {},
  vbSync: {},
  peers: [],
  deployments: []
}

var hx = hyperx(vdom.h)
var loop = mainLoop(state, render, vdom)
document.querySelector('#app').appendChild(loop.target)

vbits.chain.onceReady(() => {
  loop.update(assign(state, { chainTip: vbits.chain.tip }))
})
vbits.chain.on('block', (chainTip) => {
  loop.update(assign(state, { chainTip }))
})

function updatePeers () {
  loop.update(assign(state, { peers: vbits.peers.peers }))
}
vbits.peers.on('peer', (peer) => {
  peer.once('disconnect', updatePeers)
  updatePeers()
})

function updateDeployments () {
  loop.update(assign(state, { deployments: vbits.vbits.deployments }))
}
vbits.vbits.on('update', () => {
  vbits.vbits.getHash((err, hash) => {
    if (err) return console.error(err)
    vbits.chain.getBlock(hash, (err, vbSync) => {
      if (err) return console.error(err)
      loop.update(assign(state, { vbSync }))
    })
  })
  updateDeployments()
})
vbits.vbits.once('ready', updateDeployments)

function render (state) {
  return hx`<div>
    <h1>blockchain sync:</h1>
    <span>
      ${state.chainTip.height}
      <span> - </span>
      ${state.chainTip.header ? state.chainTip.header.getId() : ''}
    </span>
    <h1>versionbits sync:</h1>
    <span>
      ${state.vbSync.height}
      <span> - </span>
      ${state.vbSync.header ? state.vbSync.header.getId() : ''}
    </span>
    <h1>peers (${state.peers.length}):</h1>
    <ul>
    ${state.peers.map((peer) => hx`
      <li>
        <span>${peer.socket.transport}</span>
        <span> - </span>
        <span>${peer.socket.remoteAddress}</span>
        <span> - </span>
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

function createVersionBitsClient (id, network) {
  const { params, checkpoints } = network
  if (checkpoints) params.blockchain.checkpoints = checkpoints

  const peers = new PeerGroup(params.net, { numPeers: 4 })
  peers.connect()

  const chainDb = level(`${id}.chain`)
  const chain = new Blockchain(params.blockchain, chainDb)

  const vbitsDb = level(`${id}.versionbits`)
  const vbits = VersionBits(params.versionbits, vbitsDb)

  chain.once('ready', () => {
    console.log('blockchain is ready')

    peers.once('peer', () => {
      pump(
        chain.createLocatorStream(),
        HeaderStream(peers),
        chain.createWriteStream(),
        (err) => {
          if (err) console.log(err.stack)
        })

      chain.getBlockAtHeight(399168, (err, block) => {
        if (err) return console.log(err)

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
  })

  return {
    params,
    peers,
    chain,
    vbits
  }
}

function reset () {
  window.indexedDB.deleteDatabase('IDBWrapper-bitcoin.versionbits')
  window.indexedDB.deleteDatabase('IDBWrapper-bitcoin.chain')
  window.location.reload()
}
