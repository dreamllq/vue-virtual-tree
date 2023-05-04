<template>
  <div ref='container' class='v-tree-container'>
    <q-ui-tree
      ref='tree'
      :title-width='titleWidth'
      @check='onCheck'
      @select='onSelect'
      @expand='onExpand'
      @load='onLoad'
      @change='refreshSuffixPosition'>
      <template #prefix='{node}'>
        <!-- 节点头部slot -->
        <div ref='suffix' class='tree-item--prefix'>
          <slot name='prefix' :node='node' />
        </div>
      </template>

      <template #suffix='{node}'>
        <!-- 节点尾部slot -->
        <div ref='suffix' class='tree-item--suffix' :style='suffixStyle'>
          <slot name='suffix' :node='node' />
        </div>
        <div ref='suffixBlock' class='tree-item--suffix-block' :style='suffixBlockStyle' />
      </template>

      <template #title-suffix='{node}'>
        <div ref='titleSuffix' class='tree-item--title-suffix'>
          <slot name='title-suffix' :node='node' />
        </div>
      </template>
    </q-ui-tree>
  </div>
</template>

<script>
import QUiTree from './ui-tree.vue';
import UiTree from '../models/ui-tree';
import { xor, difference } from 'lodash';

export default {
  name: 'BizTree',
  components: { QUiTree }, 
  props: {
    /**
     * 高级用法，继承UiTree，对内部方法进行重写来满足需求
     */
    // eslint-disable-next-line vue/require-prop-types
    treeModel: {
      default() {
        return UiTree;
      }
    },
    /**
     * （受控）选中复选框的树节点
     *  注意：父子节点有关联，如果传入父节点 key，则子节点自动选中；相应当子节点 key 都传入，父节点也自动选中
     */
    modelValue: {
      type: Array,
      default: () => []
    },
    /**
     * （受控）展开指定的树节点
     */
    expandedKeys: {
      type: Array,
      default: () => []
    },
    /**
     * （受控）设置选中的树节点
     */
    selectedKey: {
      type: [String, Number],
      default: undefined
    },
    /**
     * treeNodes 数据，如果设置则不需要手动构造
     * TreeNode 节点（key 在整个树范围内唯一
     */
    treeData: {
      type: Array,
      required: true
    },
    /**
     * 替换 treeNode 中 title,key,children 字段为 treeData 中对应的字段
     */
    replaceFields: {
      type: Object,
      default: () => ({})
    },
    /**
     * 是否自动展开父节点
     */
    autoExpandParent: {
      type: Boolean,
      default: true
    },
    /**
     * 节点前添加 Checkbox 复选框
     */
    checkable: {
      type: Boolean,
      default: false
    },
    /**
     * checkable 状态下节点选择完全受控（父子节点选中状态不再关联）
     */
    checkStrictly: {
      type: Boolean,
      default: false
    },
    /**
     * 默认选中复选框的树节点
     */
    defaultCheckedKeys: {
      type: Array,
      default: () => []
    },
    /**
     * 默认展开所有树节点
     */
    defaultExpandAll: {
      type: Boolean,
      default: false
    },
    /**
     * 默认展开指定的树节点
     */
    defaultExpandedKeys: {
      type: Array,
      default: () => []
    },
    /**
     * 默认选中的树节点
     */
    defaultSelectedKey: {
      type: [String, Number],
      default: undefined
    },
    /**
     * 将整棵树设置为禁用状态
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * 异步加载数据
     */
    loadData: {
      type: Function,
      default: undefined
    },
    /**
     * 是否可选中
     */
    selectable: {
      type: Boolean,
      default: true
    },
    /**
     * 设置需要展示的keys，为空时，全展示
     */
    visibleKeys: {
      type: Array,
      default: () => []
    },
    titleWidth: {
      type: Number,
      default: 50
    }
  },
  data() {
    return {
      suffixLeft: 0,
      suffixBlockWidth: 0 
    };
  },
  computed: {
    suffixStyle() {
      return { transform: `translateY(0px) translateX(${this.suffixLeft}px)` };
    },
    suffixBlockStyle() {
      return { width: `${this.suffixBlockWidth}px` };
    }
  },
  watch: {
    modelValue: {
      deep: true,
      async handler(newVal) {
        const checkedNodes = await this.tree.getCheckedNodes();
        const oldCheckedKeys = checkedNodes.map(node => node.key);

        const checkedKeys = difference(newVal, oldCheckedKeys);
        const uncheckedKeys = difference(oldCheckedKeys, newVal);

        if (checkedKeys.length > 0) {
          await this.tree.checkKeys(checkedKeys, true);
        }

        if (uncheckedKeys.length > 0) {
          await this.tree.checkKeys(uncheckedKeys, false);
        }
      }
    },
    expandedKeys: {
      deep: true,
      async handler(newVal) {
        const expandedNodes = await this.tree.getExpandedNodes();
        const oldExpandedKeys = expandedNodes.map(node => node.key);

        const expandedKeys = difference(newVal, oldExpandedKeys);
        const unexpandedKeys = difference(oldExpandedKeys, newVal);

        if (expandedKeys.length > 0) {
          await this.tree.expandKeys(true, expandedKeys);
        }

        if (unexpandedKeys.length > 0) {
          await this.tree.expandKeys(false, unexpandedKeys);
        }
      }
    },
    async selectedKey(newkey) {
      const n = await this.tree.getSelectedNode();
      const oldKey = n ? n.key : null;

      if (newkey !== oldKey) {
        await this.tree.select(newkey, true);
      }
    },
    async visibleKeys(newVal) {
      const visibleKeys = await this.tree.getVisibleKeys();
      const diff = xor(newVal, visibleKeys);

      if (diff.length > 0) {
        await this.tree.setVisibleKeys(newVal);
      }
    }
  },
  created() {
    const T = this.treeModel;
    this.tree = new T({
      data: this.treeData,
      checkable: this.checkable,
      selectable: this.selectable,
      disabled: this.disabled,
      loadData: this.loadData,
      checkStrictly: this.checkStrictly,
      autoExpandParent: this.autoExpandParent,
      replaceFields: this.replaceFields
    });
  },  
  async mounted() {
    await this.$refs.tree.setTree(this.tree);
    await this.setDefault();
    await this.loadEnd();
    this.$refs.container.addEventListener('scroll', this.refreshSuffixPosition);
    this.refreshSuffixPosition();
  },
  beforeUnmount() {
    this.$refs.container.removeEventListener('scroll', this.refreshSuffixPosition);
  },
  methods: {
    refreshSuffixPosition() {
      const left = this.$refs.container.offsetWidth - this.$refs.suffix.offsetWidth + this.$refs.container.scrollLeft;
      // const els = document.getElementsByClassName('tree-item--suffix');
      // for (let i = 0; i < els.length; i++) {
      //   els[i].style.transform = `translateY(0px) translateX(${left}px)`;
      // }
      this.suffixLeft = left;
      this.suffixBlockWidth = this.$refs.suffix.offsetWidth - 12;
      // const bEls = document.getElementsByClassName('tree-item--suffix-block');
      // for (let i = 0; i < bEls.length; i++) {
      //   bEls[i].style.width = `${this.$refs.suffix.offsetWidth - 12}px`;
      // }
    },
    async setDefault() {
      if (this.defaultExpandAll) {
        this.tree.expandAll();
      }
      await this.tree.expandKeys(true, this.defaultExpandedKeys);
      const promiseArr = [];
      if (this.defaultSelectedKey) {
        promiseArr.push(this.tree.select(this.defaultSelectedKey, true));
      }
      promiseArr.push(this.tree.checkKeys(this.defaultCheckedKeys, true));
      await Promise.all(promiseArr);
    },
    async loadEnd() {
      const checkedNodes = await this.tree.getCheckedNodes();
      const checkedKeys = checkedNodes.map(node => node.key);

      if (xor(checkedKeys, this.modelValue).length > 0) {
        // eslint-disable-next-line vue/custom-event-name-casing
        this.$emit('update:modelValue', checkedKeys);
      }

      const expandedNodes = await this.tree.getExpandedNodes();
      const expandedKeys = expandedNodes.map(node => node.key);

      if (xor(expandedKeys, this.expandedKeys).length > 0) {
        this.$emit('update:expandedKeys', expandedKeys);
      }

      const n = await this.tree.getSelectedNode();
      if (n && n.key !== this.selectedKey) {
        this.$emit('update:selectedKey', n ? n.key : undefined);
      }

      /**
       * 树初始化完成事件，且默认值设置完毕后触发
       */
      this.$emit('ready');
    },
    async onCheck({ checked, node }) {
      const checkedNodes = await this.tree.getCheckedNodes();
      const checkedKeys = checkedNodes.map(node => node.key);

      if (xor(checkedKeys, this.modelValue).length > 0) {
        // eslint-disable-next-line vue/custom-event-name-casing
        this.$emit('update:modelValue', checkedKeys);
      }
      /**
       * 复选框check事件
       */
      this.$emit('check', checkedKeys, {
        event: 'check',
        node: node,
        checked
      });
    },
    async check(key, checked) {
      await this.$refs.tree.check(key, checked);
    },
    async onSelect({ selected, node }) {
      const n = await this.tree.getSelectedNode();

      this.$emit('update:selectedKey', n ? n.key : null);
      /**
       * 节点选中事件
       */
      this.$emit('select', n ? n.key : null, {
        event: 'select',
        node: node,
        selected
      });
    },
    async select(key, selected) {
      await this.$refs.tree.select(key, selected);
    },
    async onExpand({ expanded, node }) {
      const expandedNodes = await this.tree.getExpandedNodes();
      const expandedKeys = expandedNodes.map(node => node.key);

      if (xor(expandedKeys, this.expandedKeys).length > 0) {
        this.$emit('update:expandedKeys', expandedKeys);
      }

      /**
       * 展开/收起节点事件
       */
      this.$emit('expand', expandedKeys, {
        event: 'expand',
        node: node,
        expanded
      });

      const checkedNodes = await this.tree.getCheckedNodes();
      const checkedKeys = checkedNodes.map(node => node.key);

      if (xor(checkedKeys, this.modelValue).length > 0) {
        // eslint-disable-next-line vue/custom-event-name-casing
        this.$emit('update:modelValue', checkedKeys);
      }
    },
    async expand(key, expanded) {
      await this.$refs.tree.expand(key, expanded);
    },
    onLoad({ node }) {
      /**
       * 节点加载完事件
       */
      this.$emit('load', node.key, {
        event: 'load',
        node 
      });
    },
    async getNodeByKey(key) {
      let node = await this.tree.getNodeByKey(key);
      if (node === null || node === undefined) {
        return undefined;
      }
      return node.toObject();
    },
    async getExpandedNodes() {
      let nodes = await this.tree.getExpandedNodes();
      return nodes.map(node => node.toObject());
    },
    async getCheckedNodes() {
      let nodes = await this.tree.getCheckedNodes();
      return nodes.map(node => node.toObject());
    },
    async getSelectedNode() {
      let node = await this.tree.getSelectedNode();
      if (node === null) {
        return undefined;
      }
      return node.toObject();
    },
    async reload(key) {
      await this.tree.reload(key);
    }
  }
};
</script>

<style lang="scss" scoped>
.v-tree-container {
  width: 100%;
  height: 100%;
  overflow: auto;

  .tree-item--suffix{
    position: absolute;
    top: 0;
    left: 0;
    background-color: #fff;
    padding-right: 12px;
  }
}
</style>