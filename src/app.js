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

    this.node = createNode('bitcoin')
    this.vbits = createVbits('bitcoin', this.node)
  }

  get element () {
    return this.loop.target
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
    const hx = this.hx
    console.log('render', state, this.state)
    return hx`
      <div class="versionbits mdl-layout mdl-js-layout mdl-layout--no-desktop-drawer-button">
        <header class="mdl-layout__header mdl-layout__header--transparent">
          <div class="mdl-layout__header-row">
            <span class="mdl-layout-title">Bitcoin Version Bits Tracker</span>
            <div class="mdl-layout-spacer"></div>
            <nav class="mdl-navigation">
              <a class="mdl-navigation__link" href="">Link</a>
              <a class="mdl-navigation__link" href="">Link</a>
              <a class="mdl-navigation__link" href="">Link</a>
              <a class="mdl-navigation__link" href="">Link</a>
            </nav>
          </div>
        </header>
        <div class="mdl-layout__content">
          <div class="mdl-grid">
            <div class="mdl-cell mdl-cell--8-col deployment-card mdl-card mdl-shadow--2dp">
              <div class="mdl-card__media">
                <div id="chart" class="chart"></div>
              </div>
              <div class="mdl-card__title">
                <h2 class="mdl-card__title-text">Segregated Witness</h2>
              </div>
              <div class="mdl-card__supporting-text">
                <div id="support" class="stat support">
                  <label>Miner Support</label>
                  <span class="value">78</span>
                  <span class="unit">%</span>
                </div>
                <span class="mdl-tooltip" for="support">
                  Based on the last 2016 blocks
                </span>
              </div>
            </div>
            ${Node(hx, state.vbits.block, state.peers)}
          </div>
        </div>
        <button onclick=${this.reset}>Reset State</button>
      </div>
    `
  }
}
module.exports = old(App)
