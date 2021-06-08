<template>
  <div>
    <b-row>
      <b-col md="6" sm="6" xs="12">
        <h1>
          {{ tokenDetails.name }}:
          <strong>
            {{ currentPriceValue | price }}
          </strong>
            ({{ dayChange | percentage(true) }})
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
    

        <!-- We use :key="symbol" to rerender components on each symbol change -->
    <TokenPriceChartContainer
      :symbol="symbol"
      :key="symbol + selectedProvider + '-chart'"
      :provider="selectedProvider"
      :currentPrice="currentPrice" />
      
  <b-button class="btn-lg btn-danger btn-modal rounded-pill" v-b-modal.modal-1 variant="primary">Integrate now!</b-button>
  <b-modal id="modal-1" title="Code snippet" size="xl" ok-only>
    <CodeExample :symbol="symbol" />
  </b-modal>

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
import CodeExample from "@/components/Token/CodeExample";
import tokensData from "@/assets/data/tokens.json";
import _ from 'lodash';

const DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

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
      this.oldPrice = await redstone.getHistoricalPrice(this.symbol, {
        date: new Date().getTime() - DAY_IN_MILISECONDS,
        provider: this.selectedProvider
      });
      console.log(this.oldPrice)
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

    dayChange() {
      return (this.currentPrice.value - this.oldPrice.value) / this.oldPrice.value || "";
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

<style src="./Token.scss" lang="scss" scoped />