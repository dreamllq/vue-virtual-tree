<template>
  <div :class='className'>
    <div class='deep'>
      <div v-for='(item, index) in deep' :key='index' class='deep-item' />
    </div>
    <div :class='`expand ${node.isLeaf ? "is-leaf" : ""} ${prevNode === undefined || prevNode.deep < node.deep? "no-up":""}`'>
      <expand-btn
        v-if='!node.isLeaf'
        :value='node.expanded'
        :loading='node.loading'
        @change='expandChange'
      />
    </div>
    <div v-if='node.checkable' class='check'>
      <checkbox-btn
        :disabled='node.disabled || node.disableCheckbox'
        :value='node.checked'
        :indeterminate='node.indeterminate'
        @change='check'
      />
    </div>
    <div class='prefix'>
      <slot name='prefix' :node='node' />
    </div>
    <div :class="{ title: true, selectable: node.selectable, 'is-disabled': node.disabled }" :style='`min-width: ${titleWidth}px`'>
      <select-btn
        :disabled='node.disabled || !node.selectable'
        :value='node.selected'
        @change='selectChange'
      >
        <text-tip :msg='node.title' />
        
        <template #title-suffix>
          <slot name='title-suffix' :node='node' />
        </template>
      </select-btn>
    </div>
    <!-- <div :class="{ space: true, selectable: node.selectable, 'is-disabled': node.disabled }" @click='selectChange(true)' /> -->
    <div class='suffix'>
      <slot name='suffix' :node='node' />
    </div>
  </div>
</template>

<script>
import ExpandBtn from './node-operate-btns/expand-btn.vue';
import SelectBtn from './node-operate-btns/select-btn.vue';
import CheckboxBtn from './node-operate-btns/checkbox-btn.vue';
import { TextTip } from 'lc-vue-text-tip'; 

export default {
  name: 'UINode',
  components: {
    ExpandBtn,
    SelectBtn,
    CheckboxBtn,
    TextTip
  },
  props: {
    node: {
      required: true,
      type: Object
    },
    prevNode: {
      type: Object,
      default: undefined
    },
    titleWidth: {
      type: Number,
      default: 50
    }
  },
  data() {
    return {};
  },
  computed: {
    deep() {
      if (this.node.deep === 0) return [];
      return new Array(this.node.deep).join(',')
        .split(',');
    },
    className () {
      return {
        'tree_ui-node': true,
        'is-checked': this.node.checked,
        'is-expanded': this.node.expanded,
        'is-selected': this.node.selected
      };
    }
  },
  methods: {
    expandChange(expanded) {
      this.$emit('expand', expanded);
    },
    selectChange(selected) {
      this.$emit('select', selected);
    },
    check(checked) {
      this.$emit('check', checked);
    }
  }
};
</script>

<style lang="scss" scoped>
// .deep-item{
//   position: relative;
//   &::after{
//     content: '';
//     position: absolute;
//     top: 0;
//     left: 48%;
//     height: 100%;
//     border-left: 1px solid #eee;
//   }
// }

// .expand {
  // position: relative;

  // &.is-leaf{
  //   &::before,
  //   &::after{
  //     height: 50%;
  //   }

  //   &.no-up{
  //     &::before{
  //       height: 50%;
  //     }
  //   }
  // }

  // &.no-up{
  //   &::before{
  //     height: 0;
  //   }
  // }

  // &::before{
  //   content: '';
  //   height: 7px;
  //   top: 0;
  //   left: 48%;
  //   position: absolute;
  //   border-left: 1px solid #eee;
  // }

  // &::after{
  //   content: '';
  //   height: 8px;
  //   bottom: 0;
  //   left: 48%;
  //   position: absolute;
  //   border-left: 1px solid #eee;
  // }
// }
</style>