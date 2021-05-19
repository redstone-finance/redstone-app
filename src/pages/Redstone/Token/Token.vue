<template>
  <div>
    <h1>
      {{ tokenDetails.name }}:
      <strong>
        {{ currentPriceValue | price }}
      </strong>
    </h1>
    <TokenPriceChartContainer
      :symbol="symbol"
      :currentPrice="currentPrice" />
    <div class="space"></div>
    <CodeExample :symbol="symbol" />
  </div>
</template>

<script>
import limestone from "limestone-api";
import TokenPriceChartContainer from "@/components/Token/TokenPriceChartContainer";
import CodeExample from "@/components/Token/CodeExample";
import tokensData from "@/assets/data/tokens.json";

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
      this.currentPrice = await limestone.getPrice(this.symbol, {
        provider: this.provider,
      });
    },
  },

  components: {
    CodeExample,
    TokenPriceChartContainer,
  },

  watch: {
    '$route.params.symbol': function() {
      this.loadCurrentPrice();
    },
  },

  computed: {
    symbol() {
      return this.$route.params.symbol;
    },

    tokenDetails() {
      return {
        ...tokensData[this.symbol],
        symbol: this.symbol,
      };
    },

    provider() {
      return this.tokenDetails.providers[0];
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