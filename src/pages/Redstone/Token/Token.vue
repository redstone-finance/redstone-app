<template>

  <div class="token">
    <div xs="12" class="d-flex flex-lg-row-reverse select-provider">
      <b-form>
        <b-form-group label="Select data provider" label-align="left" label-align-lg="right" label-for="select-provider">
          <b-form-select v-model="selectedProvider" :options="providers" id="select-provider"></b-form-select>
        </b-form-group>          
      </b-form>
    </div>
      <!-- We use :key="symbol" to rerender components on each symbol change -->
    <TokenPriceChartContainer
      :symbol="symbol"
      :key="symbol + selectedProvider + '-chart'"
      :provider="selectedProvider"
      :currentPrice="currentPrice" />

    <TokenPriceTableContainer
      :symbol="symbol"
      :key="symbol + selectedProvider + '-table'"
      :provider="selectedProvider"
      :currentPrice="currentPrice" />

    <div class="space"></div>
    
  </div>
</template>

<script>
import redstone from "redstone-api";
import TokenPriceChartContainer from "@/components/Token/TokenPriceChartContainer";
import TokenPriceTableContainer from "@/components/Token/TokenPriceTableContainer";
import tokensData from "@/assets/data/tokens.json";
import _ from 'lodash';

export default {
  name: "Token",

  data() {
    return {
      currentPrice: {},
      oldPrice: {},
      selectedProvider: this.getInitialProvider(),
    };
  },

  created() {
    this.loadPrices();
  },

  timers: {
    loadPrices: { autostart: true, time: 2000, repeat: true },
  },

  methods: {
    async loadPrices() {
      this.currentPrice = await redstone.getPrice(this.symbol, {
        provider: this.selectedProvider
      });
    },

    getInitialProvider() {
      return this.getProviders()[0];
    },

    getProviders() {
      return tokensData[this.$route.params.symbol].providers;
    }
  },

  components: {
    TokenPriceChartContainer,
    TokenPriceTableContainer,
  },

  computed: {
    symbol() {
      return this.$route.params.symbol;
    },

    providers() {
      return this.getProviders().map(
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

<style src="./Token.scss" lang="scss" scoped />
