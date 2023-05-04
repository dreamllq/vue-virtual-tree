class Tree {
  constructor ({ nodeMapStorage }) {
    this.root = [];
    this.nodeMapStorage = nodeMapStorage;
  }

  async traverse (cb) {
    await Promise.all(this.root.map(node => node.traverse(cb)));
  }

  async getNodeByKey (key) {
    return this.nodeMapStorage.getItem(key);
  }
}

export default Tree;
