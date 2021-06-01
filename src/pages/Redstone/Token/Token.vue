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
          <b-form-group description="Select data provider">
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
import redstone from "redstone-api";
import TokenPriceChartContainer from "@/components/Token/TokenPriceChartContainer";
import TokenPriceTableContainer from "@/components/Token/TokenPriceTableContainer";
import CodeExample from "@/components/Token/CodeExample";
import tokensData from "@/assets/data/tokens.json";
import _ from 'lodash';

export default {
  name: "Token",

  data() {
    return {
      currentPrice: {},
      selectedProvider: this.getInitialProvider(),
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
      this.currentPrice = await redstone.getPrice(this.symbol, {
        provider: this.selectedProvider,
      });
    },

    getInitialProvider() {
      return tokensData[this.$route.params.symbol].providers[0];
    },
  },

  components: {
    CodeExample,
    TokenPriceChartContainer,
    TokenPriceTableContainer,
  },

  computed: {
    currentPriceValue() {
      return this.currentPrice.value || "Loading...";
    },

    symbol() {
      return this.$route.params.symbol;
    },

    tokenDetails() {
      return {
        ...tokensData[this.symbol],
        symbol: this.symbol,
      };
    },

    providers() {
      return this.tokenDetails.providers.map(
        provider => {
          return {
            value: provider,
            text: _.startCase(provider)
          }
        }
      );
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