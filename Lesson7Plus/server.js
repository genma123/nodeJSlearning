// The original version of this comes from "Node.js, MongoDB, and AngularJS Web Development", an video book by Brad Dayley.
// The orignial version of this can be found here:
// http://www.informit.com/content/images/9780133929201/downloads/NodeMongoAngular_final_code.zip .
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser());

require('./routes')(app);

// Must set PORT environment variable for this to work
app.listen(process.env.PORT);