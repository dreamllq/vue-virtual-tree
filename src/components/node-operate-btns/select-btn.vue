<template>
  <div :class='className' @click='select'>
    <div class='select-btn--title'>
      <slot />
    </div>
    <div class='select-btn--title-suffix'>
      <slot name='title-suffix' />
    </div>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    className () {
      return {
        'select-btn': true,
        'cursor-pointer': !this.disabled,
        'cursor-not-allowed': this.disabled,
        'is-selected': this.value,
        'is-disabled': this.disabled
      };
    }
  },
  methods: {
    select () {
      if (!this.disabled) {
        this.$emit('change', !this.value);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.select-btn{
  display: flex;

  .select-btn--title{

    flex: 0 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 400;
  }

  .select-btn--title-suffix{
    flex: none;
    overflow: hidden;
  }

}
</style>
<style scoped >

</style>