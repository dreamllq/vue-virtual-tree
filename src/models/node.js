class Node {
  constructor (key, nodeMapStorage, data = {}) {
    this.key = key;
    this.data = data;
    this.nodeMapStorage = nodeMapStorage;

    this.parent = null;
    this.children = [];

    this.nodeMapStorage.setItem(key, this);
  }

  get deep () {
    if (this.parent) {
      return this.parent.deep + 1;
    } else {
      return 0;
    }
  }

  get parents () {
    if (this.parent) {
      return this.parent.parents.concat(this.parent);
    } else {
      return [];
    }
  }

  async traverse (cb) {
    const flag = await cb(this);

    if (Array.isArray(this.children) && flag === true) {
      await Promise.all(this.children.map((node) => node.traverse(cb)));
    }
  }

  clearChildren() {
    this.children.forEach(node => {
      node.clearChildren();
      this.nodeMapStorage.removeItem(node.key);
    });
  }

  setChildren (nodes) {
    this.clearChildren();
    this.children = nodes;

    this.children.forEach((node) => {
      node.parent = this;
      this.setChildrenAfterEach(node);
    });
  }

  setChildrenAfterEach () {

  }
}

export default Node;
