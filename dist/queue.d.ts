export declare class QueueSendItem {
    address: string;
    value: number;
    pushButton: number;
    constructor(address: string, value: number, pushButton: number);
}
export declare class QueueReceiveItem {
    address: string;
    callBack: (value: number) => any;
    constructor(address: string, callBack: (value: number) => any);
}
export declare class Queue {
    items: any[];
    capacity: number;
    constructor(capacity: number, ...params: any[]);
    bequeue(item: any): void;
    enqueue(item: any): 0 | 1;
    dequeue(): any;
    count(): number;
    getItems(): any[];
}
//# sourceMappingURL=queue.d.ts.map