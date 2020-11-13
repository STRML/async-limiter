'use strict';

/**
 * @typedef {() => void} LimiterCallback
 * @typedef {(cb: LimiterCallback) => void | any} AsyncJobCallback
 * @typedef {(...args: any) => any} OnDoneCallback
 *
 * @extends Array<AsyncJobCallback>
 */
class Queue {
  /**
   * @param {{ concurrency: number; }} [options={ concurrency: Infinity }]
   */
  constructor(options) {
    /** @readonly @type {number} */
    this.concurrency = (options || {}).concurrency || Infinity;

    /** @private @type {number} */
    this.pending = 0;

    /** @private @type {AsyncJobCallback[]} */
    this.jobs = [];

    /** @private @type {OnDoneCallback[]} */
    this.onDoneCbs = [];

    this.push = this._extendFromArray('push');
    this.splice = this._extendFromArray('splice');
    this.unshift = this._extendFromArray('unshift');

    this._run = this._run.bind(this);
    this._done = this._done.bind(this);
  }

  get length() {
    return this.pending + this.jobs.length;
  }

  /**
   * Called upon completion of a job. Calls _run() again
   * to pluck the next job off the queue, if it exists.
   * @private
   */
  _done() {
    this.pending--;
    this._run();
  }

  /** @private */
  _run() {
    // Do we have capacity for jobs?
    // If so, start them, uip to the concurrency limit
    while (this.pending < this.concurrency && this.jobs.length) {
      this.pending++;
      const job = this.jobs.shift();
      job && job(this._done);
    }

    // Are we done processing all jobs? If so, call onDone callbacks
    while (this.length === 0 && this.onDoneCbs.length) {
      var cb = this.onDoneCbs.pop();
      cb && cb();
    }
  }

  /**
   * Replicate popular array methods to queue up jobs.
   * @private
   * @param {string} method
   */
  _extendFromArray(method) {
    return function() {
      // @ts-ignore
      const methodResult = Array.prototype[method].apply(this.jobs, arguments);
      // @ts-ignore
      process.nextTick(this._run);
      return methodResult;
    };
  }

  /**
   * Simply adds a callback to the end of the job list
   * @param {any} cb
   */
  onDone(cb) {
    if (typeof cb === 'function') this.onDoneCbs.push(cb);
    // If there are no jobs in the queue,
    // this will call `cb()` in the next tick.
    // This is intended for that there is predictable
    // behavior even when running a job list of length 0.
    // @ts-ignore
    process.nextTick(this._run);
  }
}

module.exports = Queue;
