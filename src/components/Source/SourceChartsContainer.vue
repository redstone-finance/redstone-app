<template>
  <div class="charts-container">

    <div v-if="sourceHasNoErrors" class="report-ok-notification">
      This source had no errors during last 5 days
    </div>

    <div v-show="hasSomeStats('fetching-failed')" class="source-chart-wrapper">
      <div class="chart-title">
        Fetching failed
      </div>
      <SourceChart
        :stats="stats['fetching-failed']"
        color="rgb(255, 159, 64)"
        title="Fetching failed count"
      />
    </div>
    <div v-show="hasSomeStats('incorrect-price-value')" class="source-chart-wrapper">
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
  },

  methods: {
    hasSomeStats(statKey) {
      return this.stats[statKey] && Object.keys(this.stats[statKey]).length > 0;
    }
  },

  computed: {
    sourceHasNoErrors() {
      return !this.hasSomeStats('fetching-failed') && !this.hasSomeStats('incorrect-price-value')
    },
  },
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
