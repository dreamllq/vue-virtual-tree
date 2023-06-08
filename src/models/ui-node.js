import Node from './node';
import { isBoolean } from 'lodash';

class UINode extends Node {
  constructor(options = {}) {
    super(options.key, options.nodeMapStorage, options.data);

    this.originData = options.originData;

    this.selectedKeyStorage = options.selectedKeyStorage;
    this.checkedKeysStorage = options.checkedKeysStorage;
    this.expandedKeysStorage = options.expandedKeysStorage;
    this.visibleKeysStorage = options.visibleKeysStorage;

    this.title = options.title;
    this.selectable = options.selectable === undefined ? true : options.selectable;
    this.checkable = options.checkable === undefined ? false : options.checkable;
    this.isLeaf = options.isLeaf === undefined ? false : options.isLeaf;
    this.icon = options.icon === undefined ? '' : options.icon;
    this.disabled = options.disabled === undefined ? false : options.disabled;
    this.disableCheckbox = options.disableCheckbox === undefined ? false : options.disableCheckbox;
    this.checked = false;
    this.expanded = false;
    this.loading = false;
    this.selected = false;
    this.indeterminate = false;
    this.json = null;
  }

  get visible() {
    if (this.visibleKeysStorage.keys().length === 0) return true;
    else {
      return this.visibleKeysStorage.getItem(this.key) === true;
    }
  }

  get flat() {
    if (this.visible) {
      if (this.json === null) {
        this.json = this.toObject();
      }
      const flat = [this.json];
      if (this.expanded) {
        this.children.forEach(node => {
          node.flat.forEach(f => {
            flat.push(f);
          });
        });
      }
      return flat;
    } else {
      return [];
    }
  }

  get canSelected() {
    return this.selectable && !this.disabled;
  }

  get canChecked() {
    return !this.disabled && this.checkable && !this.disableCheckbox;
  }

  get countChildrenCanChecked() {
    return this.children.filter((node) => node.canChecked).length;
  }

  get countChildrenChecked() {
    return this.children.filter((node) => node.checked && node.canChecked).length;
  }

  get countChildrenIndeterminate() {
    return this.children.filter((node) => node.indeterminate && node.canChecked).length;
  }

  setSelected(selected) {
    this.selected = !!selected;

    if (this.selected === true) {
      const keys = this.selectedKeyStorage.keys();
      keys.forEach((key) => {
        const node = this.selectedKeyStorage.getItem(key);
        node.setSelected(false);
      });  
      this.selectedKeyStorage.setItem(this.key, this);
    } else {
      this.selectedKeyStorage.removeItem(this.key);
    }
    this.json = this.toObject();
  }

  setChecked(checked) {
    this.checked = !!checked;

    if (this.checked === true) {
      this.checkedKeysStorage.setItem(this.key, this);
    } else {
      this.checkedKeysStorage.removeItem(this.key);
    }
    this.json = this.toObject();
  }

  setExpand(expanded) {
    this.expanded = !!expanded;

    if (this.expanded === true) {
      this.expandedKeysStorage.setItem(this.key, this);
    } else {
      this.expandedKeysStorage.removeItem(this.key);
    }
    this.json = this.toObject();
  }

  setIndeterminate(indeterminate) {
    this.indeterminate = !!indeterminate;
    this.json = this.toObject();
  }

  setLoading(loading) {
    this.loading = !!loading;
    this.json = this.toObject();
  }

  setIsLeaf(isLeaf) {
    this.isLeaf = !!isLeaf;
    this.json = this.toObject();
  }

  setVisible(visible) {
    this.visible = !!visible;
    this.json = this.toObject();
  }

  toObject() {
    return {
      key: this.key,
      originData: this.originData,
      data: this.data,
      isLeaf: this.isLeaf,
      checkable: this.checkable,
      disabled: this.disabled,
      disableCheckbox: this.disableCheckbox,
      title: this.title,
      checked: this.checked,
      indeterminate: this.indeterminate,
      expanded: this.expanded,
      loading: this.loading,
      selected: this.selected,
      selectable: this.selectable,
      icon: this.icon,
      deep: this.deep,
      parent: this.parent ? this.parent.key : null
    };
  }

  select(selected) {
    if (this.canSelected) {
      if (isBoolean(selected)) {
        this.setSelected(selected);
      } else {
        this.setSelected(!this.selected);
      }
    }
  }

  check(checked) {
    if (this.canChecked) {
      this.setIndeterminate(false);
      if (isBoolean(checked)) {
        this.setChecked(checked);
      } else {
        this.setChecked(!this.checked);
      }
    }
  }

  expand(expanded) {
    if (isBoolean(expanded)) {
      this.setExpand(expanded);
    } else {
      this.setExpand(!this.expanded);
    }
  }

  expandParent(expanded) {
    if (this.parent) {
      this.parent.expand(expanded);
      this.parent.expandParent(expanded);
    }
  }

  clearChildrenStorage() {
    this.children.forEach(node => {
      node.clearChildrenStorage();
      this.selectedKeyStorage.removeItem(node.key);
      this.checkedKeysStorage.removeItem(node.key);
      this.expandedKeysStorage.removeItem(node.key);
      this.visibleKeysStorage.removeItem(node.key);
    });
  }

  resetChildren() {
    this.clearChildrenStorage();

    this.setChildren([]);
    this.setIsLeaf(false);
  }

  checkChildren(checked) {
    this.children.forEach(node => {
      node.check(checked);
      if (node.canChecked) {
        node.checkChildren(checked);
      }
    });
  }

  computeParentCheckStatus() {
    if (this.parent && this.parent.canChecked) {
      this.parent.computeCheckStatus();
      this.parent.computeParentCheckStatus();
    }
  }

  computeCheckStatus() {
    if (this.countChildrenCanChecked === this.countChildrenChecked) {
      this.setChecked(true);
      this.setIndeterminate(false);
    } else if (this.countChildrenChecked > 0 || this.countChildrenIndeterminate > 0) {
      this.setChecked(false);
      this.setIndeterminate(true);
    } else {
      this.setChecked(false);
      this.setIndeterminate(false);
    }
  }
}

export default UINode;
