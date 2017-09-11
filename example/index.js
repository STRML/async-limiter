'use strict';
var Throttle = require('../');

var t = new Throttle();
var results = [];

// add jobs using the familiar Array API
t.push(function(cb) {
  results.push('two');
  cb();
});

t.push(
  function(cb) {
    results.push('four');
    cb();
  },
  function(cb) {
    results.push('five');
    cb();
  }
);

t.unshift(function(cb) {
  results.push('one');
  cb();
});

t.splice(2, 0, function(cb) {
  results.push('three');
  cb();
});

// begin processing, get notified on end
t.start(function() {
  console.log('all done:', results);
});
