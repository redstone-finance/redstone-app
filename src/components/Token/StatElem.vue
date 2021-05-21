<template>
  <div class="stat-elem">
    <div class="stat-value">
      {{ value | price }}
    </div>
    <div class="stat-title">
      {{ title }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatElem',
  props: {
    value: String,
    title: String,
  },

}
</script>

<style scoped lang="scss">
.stat-elem {
  margin-right: 30px;
  color: gray;

  .stat-value {
    font-size: 16px;
    font-weight: 600;
  }

  .stat-title {
    font-size: 12px;
  }
}
</style>
