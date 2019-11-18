export type QueueOptions = {
  concurrency?: number;
};

export class Queue {
  public concurrency: number;
  public pending: number;
  public jobs: Function[];
  public cbs: Function[];

  constructor({ concurrency = Infinity }: QueueOptions = {}) {
    this.concurrency = concurrency;
    this.pending = 0;
    this.jobs = [];
    this.cbs = [];
  }

  run(): void {
    if (this.pending === this.concurrency) {
      return;
    }
    const job = this.jobs.shift();
    if (job) {
      this.pending++;
      job(() => this.done());
      this.run();
    }

    if (this.pending === 0) {
      while (this.cbs.length !== 0) {
        const cb = this.cbs.pop();
        if (cb) {
          process.nextTick(cb);
        }
      }
    }
  }

  onDone(cb: Function): void {
    this.cbs.push(cb);
    this.run();
  }

  done(): void {
    this.pending--;
    this.run();
  }

  get length(): number {
    return this.pending + this.jobs.length;
  }

  push(...args: Function[]): number {
    const result = this.jobs.push(...args);
    this.run();
    return result;
  }

  unshift(...args: Function[]): number {
    const result = this.jobs.unshift(...args);
    this.run();
    return result;
  }

  splice(start: number, deleteCount: number, ...items: Function[]): Function[] {
    const result = this.jobs.splice(start, deleteCount, ...items);
    this.run();
    return result;
  }
}
