<template>
  <div class="feed-icons">
    <img
      v-if="isFundamentalFeed"
      class="feed-icon"
      src="../../../../assets/icons/fundamental.svg"
      v-b-tooltip.hover
      title="Fundamental price value"
    />
    <img
      v-if="isTwap30"
      class="feed-icon"
      src="../../../../assets/icons/twap-30.svg"
      v-b-tooltip.hover
      title="Time-weighted average price - 30 min"
    />
    <img
      v-if="isTwap60"
      class="feed-icon"
      src="../../../../assets/icons/twap-60.svg"
      v-b-tooltip.hover
      title="Time-weighted average price - 60 min"
    />
  </div>
</template>

<script>
  export default {
    props: {
      isFundamentalFeed: Boolean,
      isTwap30: Boolean,
      isTwap60: Boolean,
    },
  };
</script>

<style scoped>
  .feed-icons {
    display: inline;
  }
  .feed-icon {
    position: relative;
    top: -2px;
    width: 25px;
    height: 25px;
    margin-left: 5px;
    padding: 2px;
    background-color: #fff;
    border-radius: 50%;
    opacity: 0.7;
  }
</style>
