#!/usr/bin/env node
var app = require('./app');
var packageJson = require(__dirname + '/package.json');

var port = process.env.PORT || parseInt("" + packageJson.config.port);
app.http.listen(port, "0.0.0.0");
console.log('Dot World Maker server listening on port ' + port);
