<template>
  <div class="source-details">
    <h1>
      <img :src="sourceDetails.logoURI" :alt="sourceId" />
      {{ sourceId }}
    </h1>

    <div>
      {{ report }}
    </div>

    <div class="chart-container">
      <SourceChartsContainer :stats="sourceStats" />
    </div>

    <ul>
      <li>
        Table with failed symbols
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";
import SourceChartsContainer from "@/components/Source/SourceChartsContainer";
import sources from "redstone-node/dist/src/config/sources.json";

const exampleReport = {
  "fetching-failed": {
    "2021-08-26": 26,
    "2021-08-25": 52,
    "2021-08-24": 30,
    "2021-08-23": 18
  },
  "symbol-not-in-reponse": {
    "2021-08-25": 142
  },
  "incorrect-price-value": {
    "2021-08-26": 1078,
    "2021-08-25": 2808,
    "2021-08-24": 2840,
    "2021-08-23": 1740
  },
  "symbols": {
    "not-in-response": [
      "LRC",
      "ENJ",
      "SOL",
      "CHZ",
      "BSV",
      "SAND",
      "ZIL",
      "KSM",
      "AXS",
      "SHIB",
      "UMA",
      "VET",
      "ZEN",
      "THETA",
      "SRM",
      "REP",
      "HT",
      "FTT",
      "LPT",
      "OKB",
      "AKRO",
      "REEF",
      "CVC",
      "CAKE",
      "XVS",
      "CEL",
      "PAXG",
      "AUDIO",
      "SOC",
      "DOCK",
      "RAY",
      "TFUEL",
      "STEP"
    ],
    "incorrect-value": [
      "BSV"
    ]
  }
};

export default {
  name: "Source",

  data() {
    return {
      exampleReport,
      report: null,
    };
  },

  async mounted() {
    const response = await axios.get("https://raw.githubusercontent.com/redstone-finance/redstone-reports/main/last/sources-report.json");
    this.report = response.data;
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
