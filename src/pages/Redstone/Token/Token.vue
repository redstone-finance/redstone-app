<template>
  <div>
    <h1>
      {{ tokenDetails.name }}:
      <strong>
        {{ currentPriceValue | price }}
      </strong>
    </h1>
    <b-tabs nav-class="bg-transparent">
      <b-tab title="Chart">
        <TokenPriceChartContainer
          :symbol="symbol"
          :provider="provider"
          :currentPrice="currentPrice" />
      </b-tab>
      <b-tab title="Table" active>
        <TokenPriceTableContainer
          :symbol="symbol"
          :provider="provider"
          :currentPrice="currentPrice" />
      </b-tab>
    </b-tabs>

    <div class="space"></div>
    <CodeExample :symbol="symbol" />
    
  </div>
</template>

<script>
import limestone from "limestone-api";
import TokenPriceChartContainer from "@/components/Token/TokenPriceChartContainer";
import TokenPriceTableContainer from "@/components/Token/TokenPriceTableContainer";
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

  timers: {
    loadCurrentPrice: { autostart: true, time: 10000, repeat: true },
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
    TokenPriceTableContainer,
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