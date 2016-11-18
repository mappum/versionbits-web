'use strict';

var level = require('level-browserify');
var pump = require('pump');

var _require = require('bitcoin-util'),
    toHash = _require.toHash;

var webcoin = require('webcoin');
var versionbits = require('versionbits');

var networks = {
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
};

module.exports = {
  createNode: function createNode(id) {
    var _networks$id = networks[id],
        params = _networks$id.params,
        checkpoints = _networks$id.checkpoints;

    if (checkpoints) {
      params.blockchain.checkpoints = checkpoints;
      params.versionbits.startHeight = checkpoints[0].height;
    }
    var nodeDb = level(id + '.node');
    return webcoin(params, nodeDb, {
      peerGroupOpts: {
        peerOpts: { timeout: 5000 }
      }
    });
  },
  createVbits: function createVbits(id, _ref) {
    var chain = _ref.chain;
    var params = networks[id].params;

    var vbitsDb = level(id + '.versionbits');
    var vbits = versionbits(params.versionbits, vbitsDb);
    var startVbits = function startVbits() {
      console.log('startVbits');
      chain.getBlockAtHeight(437473, function (err, block) {
        if (err && !err.notFound) return console.log(err);
        if (!block) {
          return chain.once('commit', startVbits);
        }
        console.log('vbits start block:', block);
        vbits.getHash(function (err, hash) {
          if (err) return console.log(err);
          pump(chain.createReadStream({ from: hash || block.header.getHash() }), vbits, function (err) {
            console.log('ended');
            if (err) console.log(err.stack);
          });
        });
      });
    };
    chain.onceReady(startVbits);
    return vbits;
  }
};