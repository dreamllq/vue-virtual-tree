<template>
  <i v-if='loading' class='expand-btn iconfont vtree-icon-loading is-loading' />
  <i
    v-else-if='value'
    class='expand-btn  is-expanded iconfont vtree-icon-expanded'
    @click='expand'
  />
  <i v-else class='expand-btn iconfont vtree-icon-open' @click='expand' />
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    expand () {
      this.$emit('change', !this.value);
    }
  }
};
</script>
