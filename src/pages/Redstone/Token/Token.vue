<template>
  <div class="token-wrapper">
    <div class="token">
      <div class="select-provider-wrapper d-flex justify-content-between mt-4 mt-md-0" v-if="!tokenDetails.tags.includes('custom-urls')">
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
        <div class="data-services-wrapper">
          <a class="data-services" @click="scrollToDataServices">View data services</a>
        </div>
      </div>

      <!-- We use :key="symbol" to rerender components on each symbol change -->
      <div class="token-data-wrapper">
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
      </div>

      <div class="space"></div>
    </div>
  </div>
</template>

<script>
import redstone from "redstone-api";
import TokenPriceChartContainer from "@/components/Token/TokenPriceChartContainer";
import TokenPriceTableContainer from "@/components/Token/TokenPriceTableContainer";
import _ from "lodash";
import { getDetailsForSymbol } from "@/tokens";


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
      const symbol = this.parseSymbol()
      return getDetailsForSymbol(symbol).providers;
    },

    scrollToDataServices() {
      const table = document.getElementById("token-price-table");
      table.scrollIntoView({ behavior: "smooth" });
    },

    parseSymbol() {
    let symbol = this.$route.params.symbol;
      if (symbol.includes("\\")) {
        symbol = symbol.replace("\\", "/");
      }
      return symbol;
    }
  },

  components: {
    TokenPriceChartContainer,
    TokenPriceTableContainer,
  },

  computed: {
    symbol() {
      return this.parseSymbol();
    },

    providers() {
      return this.getProviders().map((provider) => {
        return {
          value: provider,
          text: _.startCase(provider),
        };
      });
    },
    tokenDetails() {
      return {
        ...getDetailsForSymbol(this.symbol),
        symbol: this.symbol
      };
    },
  },
};
</script>

<style src="./Token.scss" lang="scss" scoped />
<style lang="scss">
@import "~@/styles/app";

.select-provider-wrapper {
  height: 24px;
  transform: translateY(-22px);
}

.select-provider {
  padding-left: 20px;

  .form-group {
    width: 500px;
    margin-bottom: 12px;
  }

  label {
    padding-top: 4px;
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
    height: 28px;
    padding: 0 0 0 11px;
  }
}

.data-services-wrapper {
  line-height: 32px;
}

.data-services {
  font-size: $font-size-sm;
  margin-right: 18px;
}

.token-wrapper {
  scroll-behavior: smooth;
}

</style>
