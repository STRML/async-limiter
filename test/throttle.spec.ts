import * as assert from "assert";
import { Queue } from "../";

describe("Async-Queue", () => {
  it("runs through three items linearly", endTest => {
    const expected = ["one", "two", "three"];
    const actual: string[] = [];
    const t = new Queue();
    let numEndHandlers = 0;

    function done(): void {
      numEndHandlers++;
      assert(actual.length === numEndHandlers);

      for (const i in actual) {
        assert(actual[i] === expected[i]);
      }

      if (numEndHandlers === 3) {
        endTest();
      }
    }

    t.push((cb: Function) => {
      actual.push("one");
      cb();
      done();
    });

    t.push((cb: Function) => {
      actual.push("two");
      cb();
      done();
    });

    setTimeout(() => {
      t.push((cb: Function) => {
        actual.push("three");
        cb();
        done();
      });
    }, 10);
  });

  it("Runs through three items concurrently", endTest => {
    const actual: string[] = [];
    const t = new Queue();

    t.push((cb: Function) => {
      setTimeout(() => {
        actual.push("one");
        cb();
      }, 0);
    });

    t.push((cb: Function) => {
      setTimeout(() => {
        actual.push("three");
        cb();
      }, 20);
    });

    t.push((cb: Function) => {
      setTimeout(() => {
        actual.push("two");
        cb();
      }, 10);
    });

    t.onDone(() => {
      const expected = ["one", "two", "three"];
      assert(actual.length === expected.length);

      for (const i in actual) {
        const a = actual[i];
        const e = expected[i];
        assert(a === e);
      }
      endTest();
    });
  });

  it("has a length property", endTest => {
    const t = new Queue();

    t.push((cb: Function) => {
      setTimeout(() => {
        assert(t.length === 3);
        cb();
        assert(t.length === 2);
      }, 0);
    });

    t.push((cb: Function) => {
      setTimeout(() => {
        assert(t.length === 2);
        cb();
        assert(t.length === 1);
      }, 10);
    });

    t.push((cb: Function) => {
      setTimeout(() => {
        assert(t.length === 1);
        cb();
        assert(t.length === 0);
      }, 20);
    });

    t.onDone(() => {
      assert(t.pending === 0);
      assert(t.length === 0);
      endTest();
    });

    assert(t.pending === 3);
    assert(t.length === 3);
  });

  it("has a length property that follows concurrency", endTest => {
    const t = new Queue({ concurrency: 1 });

    t.push((cb: Function) => {
      setTimeout(() => {
        assert(t.length === 3);
        cb();
        assert(t.length === 2);
      }, 0);
    });

    t.push((cb: Function) => {
      setTimeout(() => {
        assert(t.length === 2);
        cb();
        assert(t.length === 1);
      }, 10);
    });

    t.push((cb: Function) => {
      setTimeout(() => {
        assert(t.length === 1);
        cb();
        assert(t.length === 0);
      }, 20);
    });

    t.onDone(() => {
      assert(t.pending === 0);
      assert(t.length === 0);
      endTest();
    });

    assert(t.pending === 1);
    assert(t.length === 3);
  });

  it("Calls cb when empty", endTest => {
    const t = new Queue();

    t.push((cb: Function) => {
      assert(t.length === 1);
      assert(t.pending === 1);
      cb();
    });

    t.onDone(() => {
      assert(t.length === 0);

      t.onDone(() => {
        assert(t.length === 0);
        endTest();
      });
    });
  });

  it("Empty cb is always async", endTest => {
    const t = new Queue();
    let sync = false;

    t.onDone(() => {
      assert(sync);
      endTest();
    });
    sync = true;
  });
});
