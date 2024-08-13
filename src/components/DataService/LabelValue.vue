<template>
  <div :class="'label-value ' + (alignRight ? 'align-right' : '')">
    <div>
      <label class="label">
        {{ label }}
      </label>
    </div>
    <div :class="'value'" v-if="value !== undefined">
      {{ value ? value : "-" }}
    </div>
    <vue-loaders-ball-beat
      v-else
      color="var(--redstone-red-color)"
      scale="0.5"
    ></vue-loaders-ball-beat>
  </div>
</template>

<script>
  export default {
    name: "LabelValue",

    props: {
      label: String,
      value: String | Number,
      alignRight: false,
    },
  };
</script>

<style lang="scss" scoped>
  @import "~@/styles/app";

label {
  font-size: 12px;
  border-bottom: none;
  color: var(--sidebar-item-active);
}

.label-value.align-right {
  text-align: right;
  padding-right: 50px;

  @media (max-width: breakpoint-max(sm)) {
    text-align: left;
  }
}
</style>

<style lang="scss">
  @import "~@/styles/app";

.label-value {
  .vue-loaders {
    transform-origin: left;
  }

  &.align-right {
    .vue-loaders {
      transform-origin: right;

      @media (max-width: breakpoint-max(sm)) {
        transform-origin: left;
      }
    }
  }
}
</style>
