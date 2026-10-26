export class ObjectPool {
  constructor(factory, reset, initialSize = 0) {
    this.factory = factory;
    this.reset = reset;
    this.available = [];
    for (let i = 0; i < initialSize; i += 1) this.available.push(factory());
  }

  acquire(...args) {
    const item = this.available.pop() ?? this.factory();
    this.reset(item, ...args);
    return item;
  }

  release(item) {
    this.available.push(item);
  }
}