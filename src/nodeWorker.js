'use strict'

const level = require('level-browserify')
const webcoin = require('webcoin')
// const versionbits = require('versionbits')
const { toHash } = require('bitcoin-util')
const parentStream = require('workerstream/parent')
// const pump = require('pump')

const networks = {
  'bitcoin': {
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

function createNode (id) {
  const { params, checkpoints } = networks[id]
  if (checkpoints) params.blockchain.checkpoints = checkpoints

  const nodeDb = level(`${id}.node`)
  return webcoin(params, nodeDb, { wrtc: {} })
}

// function createVbits (id, { chain }) {
//   const { params } = networks[id]
//   const vbitsDb = level(`${id}.versionbits`)
//   const vbits = versionbits(params.versionbits, vbitsDb)
//   chain.onceReady(() => {
//     console.log('blockchain is ready')
//     chain.getBlockAtHeight(399168, (err, block) => {
//       if (err) return console.log(err)
//       console.log(block)
//       vbits.getHash((err, hash) => {
//         if (err) return console.log(err)
//         pump(
//           chain.createReadStream({ from: hash || block.header.getHash() }),
//           vbits,
//           (err) => {
//             if (err) console.log(err.stack)
//           })
//       })
//     })
//   })
//   return vbits
// }

module.exports = function () {
  const node = createNode('bitcoin')
  console.log('created node')
  // const vbits = createVbits('bitcoin', node)
  // console.log('created vbits')
  const parent = parentStream()
  const send = (event, data) => parent.write({ event, data })
  node.peers.on('peer', (peer) => {
    console.log('peer', peer)
    send('peer', { version: peer.version })
  })
  const serializeBlock = (block) => ({
    hash: block.header.getId(),
    height: block.height
  })
  node.chain.onceReady(() => {
    console.log('chainReady')
    const tip = serializeBlock(node.chain.tip)
    send('chainReady', { tip })
    send('block', tip)
  })
  node.chain.on('block', (tip) => {
    console.log(tip)
    send('block', serializeBlock(tip))
  })

  // vbits.on('update', () => {
  //   console.log('update')
  //   vbits.getHash((err, hash) => {
  //     console.log(err, hash)
  //     if (err) return send('error', err)
  //     node.chain.getBlock(hash, (err, block) => {
  //       console.log(err, block)
  //       if (err) return send('error', err)
  //       send('vbits', {
  //         sync: serializeBlock(block),
  //         deployments: vbits.deployments
  //       })
  //     })
  //   })
  // })
  // vbits.once('ready', () => {
  //   console.log('vbits ready')
  //   send('vbits', { deployments: vbits.deployments })
  // })

  node.start()
}
