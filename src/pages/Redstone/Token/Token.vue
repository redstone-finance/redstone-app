<template>
  <div>
    <b-row>
      <b-col md="6" sm="6" xs="12">
        <h1>
          {{ tokenDetails.name }}:
          <strong>
            {{ currentPriceValue | price }}
          </strong>    
        </h1>
      </b-col>
      <b-col md="6" sm="6" xs="12" class="d-flex flex-row-reverse">
        <b-form inline>
          <b-form-group description="Financial data provider">
            <b-form-select v-model="selectedProvider" :options="providers"></b-form-select>
          </b-form-group>          
        </b-form>
      </b-col>
    </b-row>
    
    <b-tabs nav-class="bg-transparent">
      <b-tab title="Chart" active>
        <!-- We use :key="symbol" to rerender components on each symbol change -->
        <TokenPriceChartContainer
          :symbol="symbol"
          :key="symbol + selectedProvider"
          :provider="selectedProvider"
          :currentPrice="currentPrice" />
      </b-tab>
      <b-tab title="Table">
        <TokenPriceTableContainer
          :symbol="symbol"
          :key="symbol + selectedProvider"
          :provider="selectedProvider"
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
    const symbol = this.$route.params.symbol;

    const tokenDetails = {
      ...tokensData[symbol],
      symbol,
    };

    return {
      symbol,
      currentPrice: {},
      tokenDetails,
      selectedProvider: tokenDetails.providers[0],
    };
  },

  created() {
    this.loadCurrentPrice();
  },

  timers: {
    loadCurrentPrice: { autostart: true, time: 2000, repeat: true },
  },

  methods: {
    async loadCurrentPrice() {
      this.currentPrice = await limestone.getPrice(this.symbol, {
        provider: this.selectedProvider,
      });
    },
  },

  components: {
    CodeExample,
    TokenPriceChartContainer,
    TokenPriceTableContainer,
  },

  computed: {
    providers() {
      return this.tokenDetails.providers;
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