// The original version of this comes from "Node.js, MongoDB, and AngularJS Web Development", an video book by Brad Dayley.
// The orignial version of this can be found here:
// http://www.informit.com/content/images/9780133929201/downloads/NodeMongoAngular_final_code.zip .
var express = require('express');

module.exports = function(app) {
  app.use('/', express.static( './static'));

  var words = require('./controllers/words_controller');
  app.get('/words', words.getWords);
};