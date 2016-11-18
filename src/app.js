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
      sync: {
        block: null,
        synced: false,
        height: 0,
        startHeight: 0
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
    const { peers, chain } = node
    const updateState = this.updateState.bind(this)

    onObj(peers).on({
      peer (block) {
        var peerHeight = peers.getPeerChainHeight()
        if (peerHeight > state.sync.height) {
          state.sync.height = peerHeight
        }
        updateState({ peers: peers.peers })
      }
    })
    onObj(chain).on({
      block (block) {
        if (block.height > state.sync.height) {
          state.sync.height = block.height
        }
        updateState()
      }
    })
    onObj(node).on({
      synced () {
        state.sync.synced = true
      }
    })

    var updateDeployments = () => {
      var deployments = vbits.deployments
        .filter((d) => !d.unknown || d.count > 50)
        .map((d) => {
          if (d.status !== 'started') return d
          if (!state.sync.block) return d
          var elapsed = state.sync.block.height - d.startHeight
          var period = Math.min(elapsed, 2016)
          return assign({
            support: d.rollingCount[d.rollingCount.length - 1] / period
          }, d)
        })
      updateState({ deployments })
    }

    var updateInitialSync = (block) => {
      state.sync.startHeight = block.height
      state.sync.block = block
      updateDeployments()
    }

    onObj(vbits).on({
      ready () {
        updateDeployments()
        vbits.getHash((err, hash) => {
          if (err) return this.emit('error', err)
          if (!hash) {
            chain.getBlockAtHeight(vbits.params.startHeight, (err, block) => {
              if (err) return this.emit('error', err)
              updateInitialSync(block)
            })
            return
          }
          chain.getBlock(hash, (err, block) => {
            if (err) return this.emit('error', err)
            updateInitialSync(block)
          })
        })
      },
      update () { updateDeployments() },
      block (block) {
        state.sync.block = block
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

  render (state) {
    const hx = this.hx
    return hx`
      <div class="versionbits mdl-layout mdl-js-layout mdl-layout--no-desktop-drawer-button mdl-layout--fixed-header">
        <header style="display:none" class="mdl-layout__header mdl-layout__header--transparent mdl-layout__header--scroll">
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
            ${Deployments(state.deployments, state.sync.block ? state.sync.block.height : 0)}
            ${Node(state.sync, state.peers)}
          </div>
        </div>
      </div>
    `
  }
}
module.exports = old(App)
