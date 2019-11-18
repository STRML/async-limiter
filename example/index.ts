import { Queue } from "../";

const t = new Queue();
const results: string[] = [];

// add jobs using the familiar Array API
t.push((cb: Function) => {
  results.push("two");
  cb();
});

t.push(
  (cb: Function) => {
    results.push("four");
    cb();
  },
  (cb: Function) => {
    results.push("five");
    cb();
  }
);

t.unshift((cb: Function) => {
  results.push("one");
  cb();
});

t.splice(2, 0, (cb: Function) => {
  results.push("three");
  cb();
});

// begin processing, get notified on end
console.log("all done:", results);
