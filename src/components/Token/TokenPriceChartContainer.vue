<template>
  <div class="chart-wrapper">
    <b-row>
      <b-col xs="12">
        <div class="token-price-wrapper d-flex flex-column flex-md-row">
          <div class="mb-2 mb-md-0 mr-2 d-flex align-items-center">
            <img
              class="token-logo mr-3"
              v-if="tokenDetails.logoURI"
              :src="tokenDetails.logoURI"
            />
            <div
              v-if="!isCurrencyToken(tokenDetails)"
              class="d-inline-block token-name"
            >
              {{ tokenDetails.name }}:
            </div>
            <div v-else class="d-inline-block token-name">
              {{ tokenDetails.name }}&nbsp;({{ tokenDetails.symbol }}):
            </div>
          </div>
          <div class="mb-2 mb-md-0">
            <div class="current-price" v-if="!isCurrencyToken(tokenDetails)">
              {{ currentPriceValue }}
            </div>
            <div class="current-price" v-else>
              {{
                currentPriceValue
                  | price({
                    currency: getCurrency(tokenDetails),
                    decimals: priceDecimals(),
                  })
              }}
            </div>
            <div
              class="percentage ml-3 d-inline-block"
              v-if="!isCurrencyToken(tokenDetails)"
            >
              <div
                v-if="priceChange() && priceRelativeChange()"
                :class="[priceChange() >= 0 ? 'positive' : 'negative']"
              >
                <span>{{ priceChange().toFixed(2) }} </span>(<span>{{
                  priceRelativeChange() | percentage(true)
                }}</span
                >)
              </div>
            </div>
            <div class="percentage ml-3 d-inline-block" v-else>
              <div
                v-if="priceChange() && priceRelativeChange()"
                :class="[priceChange() >= 0 ? 'positive' : 'negative']"
              >
                <span
                  >{{
                    priceChange().toFixed(priceDecimals())
                      | price({
                        showPlus: true,
                        currency: getCurrency(tokenDetails),
                        decimals: priceDecimals(),
                      })
                  }} </span
                >(<span>{{ priceRelativeChange() | percentage(true) }}</span
                >)
              </div>
            </div>
          </div>
        </div>
      </b-col>
    </b-row>

    <hr />

    <div class="bar-below-chart row">
      <div
        class="d-flex flex-column flex-md-row justify-content-start col-12 col-lg-9"
      >
        <div class="time-range-links mr-3">
          <a
            v-for="(range, index) in timeRanges"
            :key="index"
            :class="{ selected: index === selectedTimeRangeIndex }"
            @click="selectTimeRange(index)"
            >{{ range.title }}</a
          >
        </div>

        <div class="stats-container ml-0 mt-2 mb-2 mt-md-0 mb-md-0 ml-md-4">
          <StatElem
            v-for="(value, title) in stats"
            :key="title"
            :value="value"
            :title="title"
            :isCurrencyToken="isCurrencyToken(tokenDetails)"
            :currency="getCurrency(tokenDetails)"
            :decimals="priceDecimals()"
            class="mr-2 mr-md-4"
          />
        </div>
      </div>
      <div class="last-updated-note col-lg-3 align-self-center">
        Last updated
        <strong>
          {{ lastUpdatedTime }}
        </strong>
      </div>
    </div>

    <hr />

    <b-row>
      <b-col xs="12" lg="9" v-if="isCurrencyToken(tokenDetails)">
        <div class="price-chart-container">
          <div v-show="loading">
            <vue-loaders-ball-beat
              color="var(--redstone-red-color)"
              scale="1"
            ></vue-loaders-ball-beat>
          </div>
          <TokenPriceChart
            v-show="!loading"
            :data="chartData"
            :symbol="tokenDetails.symbol"
          />
        </div>
      </b-col>
      <b-col xs="12" lg="12" v-else>
        <div class="price-chart-container">
          <div v-show="loading">
            <vue-loaders-ball-beat
              color="var(--redstone-red-color)"
              scale="1"
            ></vue-loaders-ball-beat>
          </div>
          <TokenPriceChart
            v-show="!loading"
            :data="chartData"
            :symbol="tokenDetails.symbol"
          />
        </div>
      </b-col>
      <b-col
        xs="12"
        lg="3"
        class="mt-5 mt-md-0"
        v-if="isCurrencyAndNotRedstoneProvider(tokenDetails)"
      >
        <div class="data-sources">Caution</div>
        <div>
          We do not keep data for this token. If you would like us to start
          collecting it please contact us at
          <a href="mailto:hello@redstone.finance">hello@redstone.finance</a>
        </div>
      </b-col>
      <b-col
        xs="12"
        lg="3"
        class="mt-5 mt-md-0"
        v-else-if="isCurrencyToken(tokenDetails)"
      >
        <div class="data-sources">Data sources ({{ sourcesCount }})</div>
        <b-form-group
          class="data-sources-container"
          v-slot="{ ariaDescribedby }"
        >
          <b-form-checkbox-group
            id="checkbox-group-2"
            v-model="selectedSources"
            :aria-describedby="ariaDescribedby"
            name="flavour-2"
          >
            <b-form-checkbox
              class="source-checkbox"
              v-for="source in sources"
              :key="source"
              :value="source"
              :style="{ color: sourceColors[source] }"
              v-if="getCurrentPriceForSource(source)"
            >
              <div class="source-label">
                <div class="source-name">
                  <img
                    :src="getImageForSource(source)"
                    :alt="source"
                    :title="source"
                    loading="lazy"
                    class="source-logo"
                  />

                  <span v-if="source == 'aggregated'">Median</span>
                  <span v-else>{{ source }}</span>
                </div>
                <div class="source-value">
                  {{
                    getCurrentPriceForSource(source)
                      | price({
                        eNotationForSmallValues: true,
                        currency: getCurrency(tokenDetails),
                        decimals: priceDecimals(),
                      })
                  }}
                </div>
              </div>
            </b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import redstoneAdapter from "@/redstone-api-adapter";
  import { BCard, BFormInput, BForm } from "bootstrap-vue";
  import TokenPriceChart from "./TokenPriceChart";
  import StatElem from "./StatElem";
  import _ from "lodash";
  import sources from "../../config/sources.json";
  import constants from "@/constants";
  import { getCurrency, getDetailsForSymbol, isCurrencyToken } from "@/tokens";
  import { mapState } from "vuex";

  function getSourceColor(source) {
    return source === "aggregated"
      ? "#fd627a"
      : getSourceDetail(source, "color", "#000");
  }

  function getSourceDetail(source, property, defaultVal) {
    let details = sources[source];
    if (!details && source.includes("-")) {
      details = sources[source.split("-")[0]];
    }
    if (!details || !details[property]) {
      console.warn(`${property} not found for source: ${source}`);
      return defaultVal;
    }

    return details[property];
  }

  function getAgoString(minutesAfterLastUpdate, denom) {
    return `${minutesAfterLastUpdate} ${denom}${minutesAfterLastUpdate > 1 ? "s" : ""} ago`;
  }

  export default {
    name: "TokenPriceChartContainer",
    props: {
      symbol: String,
      provider: String,
      currentPrice: Object,
    },

    timers: {
      updateLastUpdatedTime: { autostart: true, time: 1000, repeat: true },
    },

    data() {
      return {
        prices: [],
        loading: false,
        selectedSources: [],
        sources: [],

        lastUpdatedTime: "recently",

        selectedTimeRangeIndex: 0,
        timeRanges: [
          {
            title: "Last hour",
            hours: 1,
            days: 0,
          },
          {
            title: "1 day",
            days: 1,
          },
          {
            title: "3 days",
            days: 3,
          },
          {
            title: "7 days",
            days: 7,
          },
        ],
      };
    },

    created() {
      this.loadPrices();
    },

    methods: {
      getCurrency,
      async loadPrices() {
        try {
          this.loading = true;
          // TODO: fix redstone-api fluent interface for hours and refactor this place
          if (this.selectedTimeRange.days === 0) {
            this.prices = await redstoneAdapter.getHistoricalPrice(
              this.symbol,
              {
                startDate:
                  Date.now() - 3600 * 1000 * this.selectedTimeRange.hours,
                interval: 1,
                endDate: Date.now(),
                provider: this.provider,
              }
            );
          } else {
            this.prices = await redstoneAdapter.query(
              this.provider,
              this.symbol,
              this.selectedTimeRange.days
            );
          }
          this.prices.sort((a, b) => a.timestamp > b.timestamp);
        } finally {
          if (!this.sources || this.sources.length == 0) {
            this.sources = this.updatedSources();
            this.selectedSources = [this.sources[0]];
          }
          this.loading = false;
        }
      },

      selectTimeRange(index) {
        if (this.selectedTimeRangeIndex !== index) {
          this.selectedTimeRangeIndex = index;
          this.loadPrices();
        }
      },

      getCurrentPriceForSource(source) {
        if (source === "aggregated") {
          return this.currentPrice.value;
        } else {
          return this.currentPrice.source[source];
        }
      },

      getImageForSource(source) {
        if (source === "aggregated") {
          return constants.images["redstone-logo"];
        } else {
          const notFoundImageUrl = constants.images["no-logo"];
          return getSourceDetail(source, "logoURI", notFoundImageUrl);
        }
      },

      updateLastUpdatedTime() {
        const secondsAfterLastUpdate = Math.round(
          (Date.now() - this.currentPrice.timestamp) / 1000
        );

        if (secondsAfterLastUpdate < 60) {
          this.lastUpdatedTime = getAgoString(secondsAfterLastUpdate, "second");
        } else {
          const minutesAfterLastUpdate = Math.round(
            secondsAfterLastUpdate / 60
          );

          if (minutesAfterLastUpdate && minutesAfterLastUpdate > 0) {
            this.lastUpdatedTime = getAgoString(
              minutesAfterLastUpdate,
              "minute"
            );
          } else {
            this.lastUpdatedTime = "";
          }
        }
      },

      priceChange() {
        let oldPrice = this.prices[0]?.value;
        return this.currentPrice.value && oldPrice
          ? this.currentPrice.value - oldPrice
          : null;
      },

      priceRelativeChange() {
        let oldPrice = this.prices[0]?.value;
        return this.priceChange() / oldPrice;
      },

      priceDecimals() {
        const min = _.min(this.priceValues);
        const max = _.max(this.priceValues);
        let delta = Math.abs(max - min);
        if (delta == 0) {
          delta = max;
        }
        if (delta == 0) {
          return 2;
        }

        return Math.max(-Math.floor(Math.log10(Math.abs(delta))), 2);
      },

      isCurrencyAndNotRedstoneProvider(details) {
        return (
          !this.provider.toLocaleLowerCase().includes("redstone") &&
          this.isCurrencyToken(details)
        );
      },

      updatedSources() {
        let sources = [];

        if (this.prices[0] && this.prices[0].source) {
          const sortedSources = Object.keys(this.prices[0].source);
          sortedSources.sort();

          if (sortedSources.length > 1) {
            sources.push("aggregated");
          }

          sources.push(...sortedSources);
        }

        return sources;
      },

      isCurrencyToken,
    },

    watch: {
      symbol() {
        this.loadPrices();
      },

      currentPrice(newVal) {
        // If 1 hour chart selected
        if (
          this.selectedTimeRange.days === 0 &&
          this.prices &&
          this.prices.length > 0
        ) {
          if (_.last(this.prices).id !== newVal.id) {
            this.prices.push(newVal);
          }
        }
      },
    },

    computed: {
      selectedTimeRange() {
        return this.timeRanges[this.selectedTimeRangeIndex];
      },

      priceValues() {
        return this.prices.map((p) => p.value);
      },

      stats() {
        if (this.priceValues.length > 0) {
          return {
            Min: `${_.min(this.priceValues)}`,
            Max: `${_.max(this.priceValues)}`,
            Average: `${_.mean(this.priceValues)}`,
          };
        } else {
          return {};
        }
      },

      sourceColors() {
        const result = {};
        for (const source of this.sources) {
          result[source] = getSourceColor(source);
        }
        return result;
      },

      sourcesCount() {
        return this.sources && this.sources.length > 1
          ? this.sources.length - 1
          : this.sources.length;
      },

      chartData() {
        const labels = [];
        const datasets = {};

        for (const source of this.selectedSources) {
          if (!datasets[source]) {
            datasets[source] = {
              data: [],
              backgroundColor: "transparent",
              pointHoverRadius: 0,
              pointRadius: 0,
              borderColor: this.sourceColors[source],
              pointBackgroundColor: "#fff",
            };
          }
        }

        for (const price of this.prices) {
          labels.push(price.timestamp);

          for (const source of this.selectedSources) {
            const value = price.source[source] || price.value;
            datasets[source].data.push(value);
          }
        }

        let timeUnit = "day";
        if (this.selectedTimeRange.days === 1) {
          timeUnit = "hour";
        }
        if (this.selectedTimeRange.days === 0) {
          timeUnit = "minute";
        }

        return {
          labels,
          datasets: Object.values(datasets),
          timeUnit,
          decimals: this.priceDecimals(),
          isUsdBased: this.getCurrency(this.tokenDetails) == "USD",
        };
      },

      currentPriceValue() {
        if (this.currentPrice?.value || this.currentPrice?.value === 0) {
          return this.currentPrice?.value;
        }
        return "Loading...";
      },

      tokenDetails() {
        return {
          ...getDetailsForSymbol(this.symbol),
          symbol: this.symbol,
        };
      },
      ...mapState("prefetch", {
        dataServices: (state) => state.providers,
      }),
    },

    components: {
      TokenPriceChart,
      BCard,
      BFormInput,
      BForm,
      StatElem,
    },
  };
</script>

<style scoped lang="scss">
  @import "~@/styles/app";

.chart-wrapper {
  position: relative;
  padding: 20px;
}

.last-updated-note {
  color: $gray-600;
  justify-self: flex-end;
  font-size: 12px;
}

.data-sources {
  margin-bottom: 20px;
  font-size: 20px;
  color: $navy;
}

.data-sources-container {
  max-height: 330px;
  overflow-y: scroll;
}

.source-checkbox {
  display: block;
  margin-bottom: 5px;

  .custom-control-input {
    color: currentColor;
    cursor: pointer;
  }

  .source-label {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    width: 100%;
    color: currentColor;
    justify-content: space-between;
    font-size: 9px;
    line-height: 22px;

    img.source-logo {
      width: 14px;
      height: 14px;
      position: relative;
      bottom: 2px;
      margin-right: 4px;
    }

    .source-name {
      font-weight: $font-weight-normal;
      text-transform: capitalize;
    }

    .source-value {
      color: #777;
      font-weight: 500;
    }
  }
}

.price-chart-container {
  min-height: 400px;
}

.bar-below-chart {
  display: flex;
  justify-content: space-between;
}

.time-range-links {
  a {
    color: $gray-750;
    font-weight: $font-weight-ultra-thin;
    width: 60px;
    display: inline-block;

    &:first-of-type {
      width: 75px;
    }

    &:nth-of-type(2) {
      width: 45px;
    }

    &.selected {
      color: $navy;
      font-weight: $font-weight-bold;
    }

    &:hover {
      color: $navy;
      font-weight: $font-weight-thin;
      text-decoration: none;
    }
  }
}

.percentage {
  transform: translateY(-2px);
  margin-bottom: 0;
  font-weight: $font-weight-normal;
  font-size: 16px;
  color: $gray-500;

  .positive {
    span {
      color: $teal;
    }
  }

  .negative {
    span {
      color: $error-red;
    }
  }

  .period {
    font-size: $font-size-index;
    font-weight: $font-weight-semi-bold;
  }
}

.token-logo {
  width: 35px;
  height: 35px;
}

.token-price-wrapper {
  flex-wrap: wrap;
}

.token-name {
  color: $navy;
  font-size: 34px;
}

.current-price {
  color: $navy;
  font-size: 34px;
  font-weight: $font-weight-bold;
  display: inline-block;
}

.stats-container {
  position: relative;
  display: flex;
  flex-wrap: wrap;

  &:before {
    content: " ";
    height: 30px;
    border-right: 1px solid #d9d9d9;
    border-top-width: 0;
    position: absolute;
    left: -1.75rem;
    bottom: -4px;
  }
}

@media (min-width: breakpoint-min(lg)) and (max-width: breakpoint-max(lg)) {
  .token-price-wrapper {
    max-width: calc(100% - 160px);
  }
}

.data-service-details {
  overflow: hidden;
  text-overflow: ellipsis;
}

.data-service-details-text {
  // font-weight: $font-weight-semi-bold;
  font-size: $font-size-larger;
  flex: 0 0 25%;
  color: var(--redstone-dark-blue-color);
}

.data-service-details-label {
  font-weight: $font-weight-semi-bold;
}

.preloaders {
  margin-bottom: 10px;

  .preloader {
    @include preload-animation(2.5s, 350px);
  }

  .text-preloader {
    height: 20px;
    width: 250px;
    margin-bottom: 10px;
  }
}
</style>
<style lang="scss" scoped>
  .custom-control-input:checked ~ .custom-control-label {
  &::before {
    color: currentColor !important;
    border-color: currentColor !important;
    background-color: currentColor !important;
    cursor: pointer;
  }

  &::after {
    cursor: pointer;
  }
}

.custom-checkbox .custom-control-input:checked ~ .custom-control-label::after {
  background-image: url("../../assets/icons/check.svg") !important;
}
</style>
