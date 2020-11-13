type LimiterCallback = () => void;
type AsyncJobCallback = (cb: LimiterCallback) => void | any;
type OnDoneCallback = (...args: any) => any;

declare class Queue {
    constructor(options?: {concurrency?: number});
    readonly length: number;
    push(...items: AsyncJobCallback[]): number;
    splice(start: number, deleteCount?: number): AsyncJobCallback[];
    splice(start: number, deleteCount: number, ...items: AsyncJobCallback[]): AsyncJobCallback[];
    unshift(...items: AsyncJobCallback[]): number;
    onDone(cb: OnDoneCallback): void;
}

export default Queue;
