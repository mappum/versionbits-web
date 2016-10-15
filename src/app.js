'use strict'

const EventEmitter = require('events')
const old = require('old')
const onObj = require('on-object')
const vdom = require('virtual-dom')
const mainLoop = require('main-loop')
const hyperx = require('hyperx')
const assign = require('object-assign')
const { createNode, createVbits } = require('./bitcoin.js')
const Node = require('./components/node.js')

class App extends EventEmitter {
  constructor (el) {
    super()

    this.state = {
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

    this.hx = hyperx(vdom.h)
    this.loop = mainLoop(this.state, this.render.bind(this), vdom)
    el.appendChild(this.loop.target)

    this.node = createNode('bitcoin')
    this.vbits = createVbits('bitcoin', this.node)
  }

  registerListeners () {
    const { node, vbits, state } = this
    const { chain, peers } = node
    const updateState = this.updateState.bind(this)

    onObj(node).on({
      synced () {
        state.chain.synced = true
        updateState()
      }
    })
    onObj(chain).on({
      block (block) {
        state.chain.block = block
        updateState()
      }
    })
    onObj(peers).on({
      peer (block) {
        updateState({ peers: peers.peers })
      }
    })
    onObj(vbits).on({
      ready () {
        updateState({ deployments: vbits.deployments })
      },
      block (block) {
        state.vbits.block = block
        updateState()
      },
      update () {
        updateState()
      }
    })
  }

  updateState (d) {
    this.loop.update(assign(this.state, d))
  }

  start () {
    this.registerListeners()
    this.node.start()
  }

  reset () {
    window.indexedDB.deleteDatabase('IDBWrapper-bitcoin.node')
    window.indexedDB.deleteDatabase('IDBWrapper-bitcoin.versionbits')
    window.location.reload()
  }

  render (state) {
    const { hx } = this
    return hx`
      <div>
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
        ${Node(hx, state)}
        <button onclick=${this.reset}>Reset State</button>
      </div>`
  }
}
module.exports = old(App)
