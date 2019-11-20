'use strict';
var Limiter = require('../');

var t = new Limiter({ concurrency: 1 });
var results = [];

// add jobs using the familiar Array API
t.push(function(cb) {
  results.push('one');
  process.nextTick(cb);
});

t.push(
  function(cb) {
    results.push('four');
    process.nextTick(cb);
  },
  function(cb) {
    results.push('five');
    process.nextTick(cb);
  }
);

// While this would normally push to the beginning of the array,
// processing has already started so 'one' is in flight.
// The async function is initiated synchronously (but resolves asynchronously)
// unless we've hit our parallelism limit.
t.unshift(function(cb) {
  results.push('two');
  process.nextTick(cb);
});

t.splice(1, 0, function(cb) {
  results.push('three');
  process.nextTick(cb);
});

t.onDone(function() {
  console.log('all done:', results);
});
