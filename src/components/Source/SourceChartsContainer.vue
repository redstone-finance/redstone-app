<template>
  <div class="charts-container">
    <div class="source-chart-wrapper">
      <div class="chart-title">
        Fetching failed
      </div>
      <SourceChart
        :stats="stats['fetching-failed']"
        color="rgb(255, 159, 64)"
        title="Fetching failed count"
      />
    </div>
    <div class="source-chart-wrapper">
      <div class="chart-title">
        Incorrect price value
      </div>
      <SourceChart
        :stats="stats['incorrect-price-value']"
        color="rgb(255, 205, 86)"
        title="Incorrect price value count"
      />
    </div>
  </div>
</template>

<script>
import SourceChart from "./SourceChart.vue";

export default {
  name: "SourceChartsContainer",
  props: ["stats"],
  components: {
    SourceChart,
  }
}
</script>

<style scoped>

.chart-title {
  font-size: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.charts-container {
  display: flex;
  flex-direction: row;
  column-gap: 70px;
  /* justify-content: space-around; */
}

.source-chart-wrapper {
  width: 40%;
}

</style>
