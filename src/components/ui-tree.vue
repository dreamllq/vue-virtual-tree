<template>
  <recycle-scroller
    ref='scroller'
    class='ui-tree-scroller'
    :items='flat'
    :item-size='32'
    key-field='key'
    page-mode
    :style='{minWidth: minWidth}'
  >
    <template #default='{item, index}'>
      <ui-node
        :node='item'
        :prev-node='index>0?flat[index-1]: undefined'
        :title-width='titleWidth'
        @expand='(expanded)=>{expand(item.key, expanded)}'
        @select='(selected)=>{select(item.key, selected)}'
        @check='(checked)=>{check(item.key, checked)}'
      >
        <template #prefix='{node}'>
          <slot name='prefix' :node='node' />
        </template>

        <template #suffix='{node}'>
          <slot name='suffix' :node='node' />
        </template>

        <template #title-suffix='{node}'>
          <slot name='title-suffix' :node='node' />
        </template>
      </ui-node>
    </template>
  </recycle-scroller>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import UiNode from './ui-node.vue';
import { maxBy } from 'lodash';

export default {
  components: {
    RecycleScroller,
    UiNode
  },
  props: {
    titleWidth: {
      type: Number,
      default: 50
    }
  },
  data () {
    return {
      flat: [],
      deep: 0,
      tree: null
    };
  },
  computed: {
    minWidth () {
      let prefixEls = document.getElementsByClassName('tree-item--prefix');
      let suffixEls = document.getElementsByClassName('tree-item--suffix-block');
      if (prefixEls.length === 0 || suffixEls.length === 0) return 0 * this.deep;
      let deepWidth = 24 * this.deep;
      let expandWidth = 24;
      let checkboxWidth = this.tree.checkable === true ? 24 : 0;
      let titleWidth = this.titleWidth;
      let prefixWidth = prefixEls[0].offsetWidth;
      let suffixWidth = suffixEls[0].offsetWidth;
      let block = 24;
      return `${deepWidth + expandWidth + checkboxWidth + titleWidth + prefixWidth + suffixWidth + block}px`;
    }

  },
  created () {
    this.tree = null;
  },
  beforeUnmount () {
    this.tree.off('change', this.syncFlat);
    this.tree.off('load', this.nodeLoadEnd);
  },
  methods: {
    setTree (tree) {
      return new Promise(resolve => {
        this.tree = tree;
        this.flat = Object.freeze(this.tree.flat);
        this.tree.on('change-flat', this.syncFlat);
        this.tree.on('load', this.nodeLoadEnd);
        this.tree.on('selected-change', this.selectedChange);

        this.$nextTick(() => {
          resolve();
        });
      });
    },
    syncFlat () {
      this.flat = Object.freeze(this.tree.flat);
      if (this.flat.length > 0) {
        const node = maxBy(this.flat, n => n.deep);
        this.deep = node.deep;
      }
      this.$nextTick(() => {
        this.$emit('change');
      });
    },
    nodeLoadEnd ({ node }) {
      this.$emit('load', { node: node.toObject() });
    },
    async selectedChange(key) {
      const node = await this.tree.getNodeByKey(key);
      this.$emit('select', {
        selected: true,
        node: node.toObject() 
      });
    },
    async expand (key, expanded) {
      const node = await this.tree.getNodeByKey(key);
      if (node) {
        await this.tree.expand(key, expanded);
        this.$emit('expand', {
          node: node.toObject(),
          expanded 
        });
      }
    },
    async select (key, selected) {
      const node = await this.tree.getNodeByKey(key);
      if (node && node.canSelected) {
        await this.tree.select(key, selected);
        this.$emit('select', {
          selected,
          node: node.toObject() 
        });
      }
    },
    async check (key, checked) {
      const node = await this.tree.getNodeByKey(key);
      if (node && node.canChecked) {
        await this.tree.check(key, checked);
        this.$emit('check', {
          checked,
          node: node.toObject() 
        });
      }
    }
  }
};
</script>
