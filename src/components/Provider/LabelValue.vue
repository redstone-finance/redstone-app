<template>
  <div class="label-value">
    <div>
      <label class="label">
        {{ label }}
      </label>
    </div>
    <div class="value">
      {{ value ? value : '-' }}
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
