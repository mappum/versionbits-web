const level = require('level-browserify')
const pump = require('pump')
const { toHash } = require('bitcoin-util')
const webcoin = require('webcoin')
const versionbits = require('versionbits')

const networks = {
  bitcoin: {
    params: require('webcoin-bitcoin'),
    checkpoints: [{
      height: 409248,
      header: {
        version: 4,
        prevHash: toHash('00000000000000000381e6a138308c6547d6fe3eb3437250ffefdebbf71eefd1'),
        merkleRoot: toHash('139269fa7300981dd7d81c26174a84203a896e77ec6d2ab75ad93c30e84ed644'),
        timestamp: 1461832110,
        bits: 403056502,
        nonce: 38168922
      }
    }]
  }
}

module.exports = {
  createNode (id) {
    const { params, checkpoints } = networks[id]
    if (checkpoints) params.blockchain.checkpoints = checkpoints
    const nodeDb = level(`${id}.node`)
    return webcoin(params, nodeDb)
  },

  createVbits (id, { chain }) {
    let { params } = networks[id]
    let vbitsDb = level(`${id}.versionbits`)
    let vbits = versionbits(params.versionbits, vbitsDb)
    chain.onceReady(() => {
      console.log('blockchain is ready')
      chain.getBlockAtHeight(409248, (err, block) => {
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
}
