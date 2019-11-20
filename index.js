'use strict';

function Queue(options) {
  if (!(this instanceof Queue)) {
    return new Queue(options);
  }

  options = options || {};
  this.concurrency = options.concurrency || Infinity;
  this.pending = 0;
  this.jobs = [];
  this.onDoneCbs = [];
  this._done = done.bind(this);
  this._run = run.bind(this);
}

// Called upon completion of a job. Calls run() again
// to pluck the next job off the queue, if it exists.
function done() {
  this.pending--;
  this._run();
}

function run() {
  // Do we have capacity for jobs?
  // If so, start them, uip to the concurrency limit
  while (this.pending < this.concurrency && this.jobs.length) {
    this.pending++;
    var job = this.jobs.shift();
    job(this._done);
  }

  // Are we done processing all jobs? If so, call onDone callbacks
  while (this.length === 0 && this.onDoneCbs.length) {
    var cb = this.onDoneCbs.pop();
    cb();
  }
}

// Replicate popular array methods to queue up jobs.
['push', 'splice', 'unshift'].forEach(function(method) {
  Queue.prototype[method] = function() {
    var methodResult = Array.prototype[method].apply(this.jobs, arguments);
    process.nextTick(this._run);
    return methodResult;
  };
});

Object.defineProperty(Queue.prototype, 'length', {
  get: function() {
    return this.pending + this.jobs.length;
  }
});

// Simply adds a callback to the end of the job list
Queue.prototype.onDone = function(cb) {
  if (typeof cb === 'function') this.onDoneCbs.push(cb);
  // If there are no jobs in the queue, this will call `cb()` in the next tick.
  // This is intended for that there is predictable behavior even when running a
  // job list of length 0.
  process.nextTick(this._run);
};

module.exports = Queue;
