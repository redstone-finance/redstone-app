<template>
  <div>
    <div>
      <label>
        {{ label }}
      </label>
    </div>
    <div>
      {{ value }}
    </div>
  </div>
</template>

<script>

export default {
  name: 'LabelValue',

  props: {
    label: String,
    value: String
  },
}
</script>

<style lang="scss" scoped>
  @import '~@/styles/app';

  label {
      font-size: 12px;
      border-bottom: none;
      color: var(--sidebar-item-active);
  }
</style>
