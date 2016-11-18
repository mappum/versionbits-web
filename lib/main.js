'use strict';

var App = require('./app.js');
var app = App();
document.body.appendChild(app.element);
app.start();