'use strict'

const old = require('old')

class ProgressBar {
  constructor (value) {
    this.type = 'Widget'
    this.value = value
  }

  init () {
    var el = document.createElement('div')
    el.classList.add('mdl-progress', 'mdl-js-progress')
    el.addEventListener('mdl-componentupgraded', () => {
      el.MaterialProgress.setProgress(this.value)
    })
    window.componentHandler.upgradeElement(el)
    return el
  }

  update (prev, el) {
    el.MaterialProgress.setProgress(this.value)
  }

  destroy () {}
}

module.exports = old(ProgressBar)
