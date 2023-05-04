class Storage {
  constructor() {
    this.map = new Map();
  }

  setItem(key, value) {
    this.map.set(key, value);
  }

  getItem(key) {
    return this.map.get(key);
  }

  removeItem(key) {
    this.map.delete(key);
  }

  keys() {
    let iterator = this.map.keys();
    let item = iterator.next();
    let keys = [];

    while (item.done === false) {
      keys.push(item.value);
      item = iterator.next();
    }

    return keys;
  }

  clear() {
    this.map.clear();
  }
}

export default Storage;
