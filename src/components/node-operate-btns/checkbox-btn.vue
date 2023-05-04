<template>
  <i :class='className' @click='check' />
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    indeterminate: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    className () {
      return {
        'iconfont': true,
        'checkbox-btn': true,
        // 'q-tree-iconfont': true,
        'is-disabled': this.disabled,
        'is-checked': this.value,
        'is-indeterminate': this.indeterminate,
        'vtree-icon-checked': this.value,
        'vtree-icon-indeterminate': this.indeterminate,
        'vtree-icon-unchecked': !this.value && !this.indeterminate
      };
    }
  },
  methods: {
    check () {
      this.$emit('change', !this.value);
    }
  }
};
</script>
