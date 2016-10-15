const level = require('level-browserify')
const pump = require('pump')
const { toHash } = require('bitcoin-util')
const webcoin = require('webcoin')
const versionbits = require('versionbits')

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
}
