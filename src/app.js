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
const Deployments = require('./components/deployments.js')

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
    const { peers } = node
    const updateState = this.updateState.bind(this)

    onObj(peers).on({
      peer (block) {
        updateState({ peers: peers.peers })
      }
    })

    var updateDeployments = () => {
      var deployments = vbits.deployments
        .filter((d) => !d.unknown || d.count > 50)
        .map((d) => assign({ support: d.count / 2016 }, d))
      updateState({ deployments })
    }
    onObj(vbits).on({
      ready () { updateDeployments() },
      update () { updateDeployments() },
      block (block) {
        state.vbits.block = block
        updateDeployments()
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
    return hx`
      <div class="versionbits mdl-layout mdl-js-layout mdl-layout--no-desktop-drawer-button mdl-layout--fixed-header">
        <header class="mdl-layout__header mdl-layout__header--transparent mdl-layout__header--scroll">
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
            ${Deployments(state.deployments, state.vbits.block ? state.vbits.block.height : 0)}
            ${Node(state.vbits.block, state.peers)}
          </div>
        </div>
        <button onclick=${this.reset}>Reset State</button>
      </div>
    `
  }
}
module.exports = old(App)
