import Tree from './tree';
import { makeNode, makeChildren } from '../utils/make-ui-node';
import EventEmitter from 'events';
import Storage from './storage';
import { intersection, xor } from 'lodash';
import { TreeOptions, KeyType } from './ui-tree.type';

export class UITree extends Tree {
  // tree 扁平化后的数组
  // flat = []
  selectedKeyStorage;
  checkedKeysStorage;
  expandedKeysStorage;
  visibleKeysStorage;
  loading: boolean;
  disabled: boolean;
  checkable: boolean;
  selectable: boolean;
  checkStrictly: boolean;
  autoExpandParent: boolean;
  replaceFields;
  loadData;
  ee;
  on;
  off;

  constructor(options: TreeOptions = {}) {
    const nodeMapStorage = new Storage(); // node 的 map，key 是 node.key

    super({ nodeMapStorage });
    this.nodeMapStorage = nodeMapStorage;
    this.selectedKeyStorage = new Storage();
    this.checkedKeysStorage = new Storage();
    this.expandedKeysStorage = new Storage();
    this.visibleKeysStorage = new Storage();
    this.loading = false;
    this.root = [];
    this.disabled = options.disabled === undefined ? false : options.disabled;
    this.checkable = options.checkable === undefined ? false : options.checkable;
    this.selectable = options.selectable === undefined ? true : options.selectable;
    this.checkStrictly = options.checkStrictly === undefined ? false : options.checkStrictly;
    this.autoExpandParent = options.autoExpandParent === undefined ? true : options.autoExpandParent;
    this.replaceFields = Object.assign({}, {
      children: 'children',
      title: 'title',
      key: 'key',
      isLeaf: 'isLeaf'
    }, options.replaceFields || {});
    this.loadData = options.loadData || (() => ([]));

    this.ee = new EventEmitter();
    this.on = this.ee.on.bind(this.ee);
    this.off = this.ee.off.bind(this.ee);

    this.root = this.makeRoot(options.data!);
  }

  get flat() {
    const flat: any[] = [];
    this.root.forEach(node => {
      node.flat.forEach((f: any) => {
        flat.push(f);
      });
    });
    return flat;
  }

  // 实例node参数
  get nodeInstanceOption() {
    return {
      disabled: this.disabled,
      checkable: this.checkable,
      selectable: this.selectable,
      replaceFields: this.replaceFields,
      nodeMapStorage: this.nodeMapStorage,
      selectedKeyStorage: this.selectedKeyStorage,
      checkedKeysStorage: this.checkedKeysStorage,
      expandedKeysStorage: this.expandedKeysStorage,
      visibleKeysStorage: this.visibleKeysStorage
    };
  }

  // 数据change时间，需要手动调用
  emitChangeFlat() {
    this.ee.emit('change-flat');
  }

  emitSelectedChange(key: KeyType) {
    this.ee.emit('selected-change', key);
  }

  // 根据传入的 data 初始化root
  // 十万数据 5层，每层10个，makeRoot 执行5秒左右
  makeRoot(data: any[]) {
    return data.map(item => {
      const node = makeNode(this.nodeInstanceOption, item);
      return node;
    });
  }

  async getExpandedNodes() {
    return this.expandedKeysStorage.keys().map(key => this.expandedKeysStorage.getItem(key));
  }

  async getCheckedNodes() {
    return this.checkedKeysStorage.keys().map(key => this.checkedKeysStorage.getItem(key));
  }

  async getSelectedNode() {
    const keys = this.selectedKeyStorage.keys();
    if (keys.length === 0) {
      return null;
    } else {
      return this.selectedKeyStorage.getItem(keys[0]);
    }
  }

  async getVisibleKeys() {
    return this.visibleKeysStorage.keys();
  }

  // 展开方法
  async expand(key: KeyType, expanded: boolean) {
    const node = await this.getNodeByKey(key);
    if (node && node.expanded !== expanded) {
      if (expanded === true) {
        if (node.children.length === 0 && !node.isLeaf) {
          node.setLoading(true);
          this.emitChangeFlat();
          const data = await this.loadData(node.toObject());
          node.setLoading(false);
          if (data.length === 0) {
            node.setIsLeaf(true);
          } else {
            const children = makeChildren(this.nodeInstanceOption, data);
            node.setChildren(children);

            if (node.checked === true) {
              if (!this.checkStrictly) {
                node.checkChildren(node.checked);
              }
            }
          }

          this.ee.emit('load', { node });
        }
        if (this.autoExpandParent) {
          node.expandParent(true);
        }
      }
      node.expand(expanded);

      this.emitChangeFlat();
    }
  }

  // check 逻辑实现
  async check(key:KeyType, checked: boolean) {
    const node = await this.getNodeByKey(key);
    if (node && node.canChecked) {
      node.check(checked);
      if (!this.checkStrictly) {
        node.checkChildren(checked);
        node.computeParentCheckStatus();
      }
      this.emitChangeFlat();
    }
  }

  // select 逻辑实现
  async select(key:KeyType, selected:boolean) {
    const node = await this.getNodeByKey(key);
    if (node && node.canSelected) {
      const selectedNode = await this.getSelectedNode();
      if (selectedNode) {
        if (selectedNode.key !== key) {
          selectedNode.setSelected(false);
          node.setSelected(selected);
        }
      } else {
        node.setSelected(selected);
      }
      this.emitChangeFlat();
    } else {
      console.warn(`invalid key ${key}`);
    }
  }

  async reload(key:KeyType) {
    const node = await this.getNodeByKey(key);
    if (node) {
      const selectedNode = await this.getSelectedNode();
      node.resetChildren();
      if (node.expanded === true) {
        await this.expand(key, false);
      }
      await this.expand(key, true);

      if (selectedNode) {
        const selectedKey = selectedNode.key;

        const newSelectedNode = await this.getNodeByKey(selectedKey);
        if (newSelectedNode) {
          if (newSelectedNode.selected === false) {
            newSelectedNode.select(true);
          }
        } else {
          node.select(true);
          this.emitSelectedChange(node.key);
        }
      }
      this.emitChangeFlat();
    }
  }

  async expandKeys(expanded:boolean, keys:KeyType[] = []) {
    const allKeys = this.nodeMapStorage.keys();
    const existKeys = intersection(keys, allKeys);
    const otherKeys = xor(keys, existKeys);

    if (existKeys.length > 0) {
      await this.expandExistKeys(expanded, existKeys);

      if (otherKeys.length > 0) {
        await this.expandKeys(expanded, otherKeys);
      }
    } else if (otherKeys.length > 0) {
      console.warn(`invalid keys ${otherKeys}`);
    }
  }

  async expandExistKeys(expanded: boolean, keys:KeyType[] = []) {
    await Promise.all(keys.map(key => this.expand(key, expanded)));
  }

  async checkKeys(keys:KeyType[], checked = false) {
    const allKeys = this.nodeMapStorage.keys();
    const existKeys = intersection(keys, allKeys);
    const otherKeys = xor(keys, existKeys);

    if (existKeys.length > 0) {
      await Promise.all(existKeys.map(key => this.check(key, checked)));
    } else if (otherKeys.length > 0) {
      console.warn(`invalid keys ${otherKeys}`);
    }
  }

  async expandAll() {
    const allKeys = this.nodeMapStorage.keys();
    this.expandKeys(true, allKeys);
  }

  // 设置需要展示的key，若传入数组是空，则展示全部
  async setVisibleKeys(visibleKeys: KeyType[]) {
    this.visibleKeysStorage.clear();

    if (Array.isArray(visibleKeys)) {
      visibleKeys.forEach(key => {
        this.visibleKeysStorage.setItem(key, true);
      });
    }
    this.emitChangeFlat();
  }
}

export default UITree;
