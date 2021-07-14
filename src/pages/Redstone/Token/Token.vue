<template>
  <div class="token-wrapper">
    <div class="token">
      <div class="d-flex justify-content-between">
        <div class="select-provider">
          <b-form>
            <b-form-group
              label="Data provider:"
              label-for="select-provider"
              label-cols="6"
              content-cols="6"
            >
              <b-form-select
                v-model="selectedProvider"
                :options="providers"
                id="select-provider"
              ></b-form-select>
            </b-form-group>
          </b-form>
        </div>
        <div class="data-feeds-wrapper">
          <a class="data-feeds" @click="scrollToDataFeeds">View data feeds</a>
        </div>
      </div>

      <!-- We use :key="symbol" to rerender components on each symbol change -->
      <TokenPriceChartContainer
        :symbol="symbol"
        :key="symbol + selectedProvider + '-chart'"
        :provider="selectedProvider"
        :currentPrice="currentPrice"
      />

      <TokenPriceTableContainer
        id="token-price-table"
        :symbol="symbol"
        :key="symbol + selectedProvider + '-table'"
        :provider="selectedProvider"
        :currentPrice="currentPrice"
      />

      <div class="space"></div>
    </div>
  </div>
</template>

<script>
import redstone from "redstone-api";
import TokenPriceChartContainer from "@/components/Token/TokenPriceChartContainer";
import TokenPriceTableContainer from "@/components/Token/TokenPriceTableContainer";
import tokensData from "@/assets/data/tokens.json";
import _ from "lodash";

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
        provider: this.selectedProvider,
      });
    },

    getInitialProvider() {
      return this.getProviders()[0];
    },

    getProviders() {
      return tokensData[this.$route.params.symbol].providers;
    },

    scrollToDataFeeds() {
      const table = document.getElementById("token-price-table");
      table.scrollIntoView();
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
      return this.getProviders().map((provider) => {
        return {
          value: provider,
          text: _.startCase(provider),
        };
      });
    },
  },
};
</script>

<style src="./Token.scss" lang="scss" scoped />
<style lang="scss">
@import "~@/styles/app";

.select-provider {
  .form-group {
    width: 500px;
  }

  label {
    font-weight: $font-weight-ultra-thin;
    font-size: $font-size-base;
    color: $gray-750;
    max-width: fit-content;
  }

  label + div {
    max-width: 200px;
  }

  .custom-select {
    border: solid 1px $gray-450;
    background-color: transparent;
    box-shadow: none;
    font-weight: $font-weight-soft-bold;
    background: transparent url("../../../assets/icons/select-down.svg") right 1rem center/16px 16px no-repeat;
    border-radius: 7px;
  }
}

.data-feeds-wrapper {
  transform: translateY(24px);
}

.data-feeds {
  font-size: $font-size-sm;
}

.token-wrapper {
  scroll-behavior: smooth;
}

</style>
