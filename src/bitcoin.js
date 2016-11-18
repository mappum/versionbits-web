const level = require('level-browserify')
const pump = require('pump')
const { toHash } = require('bitcoin-util')
const webcoin = require('webcoin')
const versionbits = require('versionbits')

const networks = {
  bitcoin: {
    params: require('webcoin-bitcoin'),
    checkpoints: [{
      height: 437472,
      header: {
        version: 536870912,
        prevHash: toHash('00000000000000000364a23184b8a2c009d13172094421c22e4d9bc85dcf90a5'),
        merkleRoot: toHash('8d7cd8a0c4da191160032f0861b38ae8fe8497fa070ac0d78b1df3aa392d7ea3'),
        timestamp: 1478364418,
        bits: 402936180,
        nonce: 1700488859
      }
    }]
  }
}

module.exports = {
  createNode (id) {
    const { params, checkpoints } = networks[id]
    if (checkpoints) {
      params.blockchain.checkpoints = checkpoints
      params.versionbits.startHeight = checkpoints[0].height
    }
    const nodeDb = level(`${id}.node`)
    return webcoin(params, nodeDb, {
      peerGroupOpts: {
        peerOpts: { timeout: 5000 }
      }
    })
  },

  createVbits (id, { chain }) {
    let { params } = networks[id]
    let vbitsDb = level(`${id}.versionbits`)
    let vbits = versionbits(params.versionbits, vbitsDb)
    let startVbits = () => {
      console.log('startVbits')
      chain.getBlockAtHeight(437473, (err, block) => {
        if (err && !err.notFound) return console.log(err)
        if (!block) {
          return chain.once('commit', startVbits)
        }
        console.log('vbits start block:', block)
        vbits.getHash((err, hash) => {
          if (err) return console.log(err)
          pump(
            chain.createReadStream({ from: hash || block.header.getHash() }),
            vbits,
            (err) => {
              console.log('ended')
              if (err) console.log(err.stack)
            })
        })
      })
    }
    chain.onceReady(startVbits)
    return vbits
  }
}
