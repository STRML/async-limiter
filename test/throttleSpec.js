var Limiter = require('../');
const assert = require('assert');

describe('Async-Limiter', function(endTest) {
  it('Runs through three items linearly', function(endTest) {
    var expected = [ 'one', 'two', 'three' ];
    var actual = [];
    var t = new Limiter({ concurrency: 1 });
    var numEndHandlers = 0;

    function done() {
      numEndHandlers++;
      assert(actual.length === numEndHandlers);

      for (var i in actual) {
        assert(actual[i] === expected[i]);
      }

      if (numEndHandlers === 3) endTest();
    }

    t.push(function(cb) {
      actual.push('one');
      setTimeout(cb, 2);
      done();
    });

    t.push(function(cb) {
      actual.push('two');
      setTimeout(cb, 0);
      done();
    });

    setTimeout(function() {
      t.push(function(cb) {
        actual.push('three');
        setTimeout(cb, 2);
        done();
      });
    }, 10);
  });

  it('Doesn\'t start items synchronously', function(endTest) {
    var t = new Limiter({ concurrency: 1 });
    var results = [];
    // add jobs using the familiar Array API
    t.push(function(cb) {
      results.push('two');
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

    t.unshift(function(cb) {
      results.push('one');
      process.nextTick(cb);
    });

    t.splice(2, 0, function(cb) {
      results.push('three');
      process.nextTick(cb);
    });

    t.onDone(function() {
      assert.deepStrictEqual(results, ['one', 'two', 'three', 'four', 'five']);
      endTest();
    });
  });

  it('Runs through three items concurrently', function(endTest) {
    var actual = [];
    var t = new Limiter();

    t.push(function(cb) {
      setTimeout(function() {
        actual.push('one');
        cb();
      }, 0);
    });

    t.push(function(cb) {
      setTimeout(function() {
        actual.push('three');
        cb();
      }, 20);
    });

    t.push(function(cb) {
      setTimeout(function() {
        actual.push('two');
        cb();
      }, 10);
    });

    t.onDone(function() {
      var expected = [ 'one', 'two', 'three' ];
      assert(actual.length === expected.length);

      for (var i in actual) {
        var a = actual[i];
        var e = expected[i];
        assert(a === e);
      }
      endTest();
    });
  });

  it('has a length property', function(endTest) {
    var t = new Limiter();

    t.push(function(cb) {
      setTimeout(function() {
        assert(t.pending === 3);
        assert(t.length === 3);
        cb();
        assert(t.length === 2);
      }, 0);
    });

    t.push(function(cb) {
      setTimeout(function() {
        assert(t.length === 2);
        cb();
        assert(t.length === 1);
      }, 10);
    });

    t.push(function(cb) {
      setTimeout(function() {
        assert(t.length === 1);
        cb();
        assert(t.length === 0);
      }, 20);
    });

    t.onDone(function() {
      assert(t.pending === 0);
      assert(t.length === 0);
      endTest();
    });

    assert(t.pending === 0);
    assert(t.length === 3);
  });

  it('has a length property that follows concurrency', function(endTest) {
    var t = new Limiter({ concurrency: 1 });

    t.push(function(cb) {
      setTimeout(function() {
        assert(t.pending === 1);
        assert(t.length === 3);
        cb();
        assert(t.length === 2);
      }, 0);
    });

    t.push(function(cb) {
      setTimeout(function() {
        assert(t.length === 2);
        cb();
        assert(t.length === 1);
      }, 10);
    });

    t.push(function(cb) {
      setTimeout(function() {
        assert(t.length === 1);
        cb();
        assert(t.length === 0);
      }, 20);
    });

    t.onDone(function() {
      assert(t.pending === 0);
      assert(t.length === 0);
      endTest();
    });

    assert(t.pending === 0);
    assert(t.length === 3);
  });

  it('Calls cb when empty', function(endTest) {
    var t = new Limiter();

    t.push(function(cb) {
      assert(t.length === 1);
      assert(t.pending === 1);
      cb();
    });

    t.onDone(function() {
      assert(t.length === 0);

      t.onDone(function() {
        assert(t.length === 0);
        endTest();
      });
    });
  });

  it('Empty cb is always async', function(endTest) {
    var t = new Limiter();
    var sync = false;

    t.onDone(function() {
      assert(sync);
      endTest();
    });
    sync = true;
  });
});
