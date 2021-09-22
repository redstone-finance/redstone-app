<template>
  <div class="source-details">
    <h1>
      <img :src="sourceDetails.logoURI" :alt="sourceId" />
      {{ sourceId }}
    </h1>

    <div class="chart-container">
      <SourceChartsContainer :stats="sourceStats" />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import SourceChartsContainer from "@/components/Source/SourceChartsContainer";
import sources from "redstone-node/dist/src/config/sources.json";

const SOURCE_REPORT_URL = "https://raw.githubusercontent.com/redstone-finance/redstone-reports/main/last/sources-report.json";

export default {
  name: "Source",

  data() {
    return {
      report: null,
    };
  },

  async mounted() {
    await this.loadDataForSoruce();
  },

  methods: {
    async loadDataForSoruce() {
      const response = await axios.get(SOURCE_REPORT_URL);
      this.report = response.data;
    },
  },

  computed: {
    sourceId() {
      return this.$route.params.sourceId;
    },
    sourceDetails() {
      return sources[this.sourceId];
    },
    sourceStats() {
      return this.report
        ? (this.report[this.sourceId] || {})
        : {};
    },
  },

  components: {
    SourceChartsContainer,
  },
}
</script>

<style lang="scss" src="./Source.scss" scoped />
