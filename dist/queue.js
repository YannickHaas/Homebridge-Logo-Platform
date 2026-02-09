"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = exports.QueueReceiveItem = exports.QueueSendItem = void 0;
class QueueSendItem {
    address;
    value;
    pushButton;
    constructor(address, value, pushButton) {
        this.address = address;
        this.value = value;
        this.pushButton = pushButton;
    }
}
exports.QueueSendItem = QueueSendItem;
class QueueReceiveItem {
    address;
    callBack;
    constructor(address, callBack) {
        this.address = address;
        this.callBack = callBack;
    }
}
exports.QueueReceiveItem = QueueReceiveItem;
class Queue {
    items;
    capacity;
    constructor(capacity, ...params) {
        this.capacity = capacity;
        this.items = [...params];
    }
    bequeue(item) {
        this.items.unshift(item);
    }
    enqueue(item) {
        if (this.items.length < this.capacity) {
            this.items.push(item);
            return 1;
        }
        return 0;
    }
    dequeue() {
        return this.items.shift();
    }
    count() {
        return this.items.length;
    }
    getItems() {
        return this.items;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=queue.js.map