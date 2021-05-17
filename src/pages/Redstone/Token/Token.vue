<template>
  <div>
    <h1>
      {{ tokenName }}:
      <strong>
        {{ currentPriceValue }}
      </strong>
    </h1>
    <TokenPriceChartContainer :symbol="symbol" />
    <div class="space"></div>
    <CodeExample :symbol="symbol" />
  </div>
</template>

<script>
import limestone from "limestone-api";
import TokenPriceChartContainer from "@/components/Token/TokenPriceChartContainer";
import CodeExample from "@/components/Token/CodeExample";

export default {
  name: "Token",

  data() {
    return {
      currentPrice: {},
    };
  },

  created() {
    this.loadCurrentPrice();
  },

  methods: {
    async loadCurrentPrice() {
      this.currentPrice = await limestone.getPrice(this.symbol);
    },
  },

  components: {
    CodeExample,
    TokenPriceChartContainer,
  },

  computed: {
    symbol() {
      return this.$route.params.symbol;
    },

    tokenName() {
      const mapping = {
        "ETH": "Ethereum",
      };

      return mapping[this.symbol];
    },

    currentPriceValue() {
      return this.currentPrice.value || "Loading...";
    },
  },
}
</script>

<style scoped>

h1 {
  margin-bottom: 20px;
}

.space {
  margin-top: 20px;
}

</style>