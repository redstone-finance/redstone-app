<template>
  <div>
    <BCard class="border-0">
      <!-- {{ stats }} -->
      <div class="stats-container">
        <StatElem
          v-for="(value, title) in stats"
          :key="title"
          :value="value"
          :title="title"
        />
      </div>

      <hr />

      <!-- {{ sources }} -->

      <div class="bar-below-chart">
        <div class="time-range-links">
          <a
            v-for="interval in [1,3,7]"
            :key="interval"
            :class="{ 'selected': interval === lastDaysCount }"
            @click="intervalSelected(interval)"
          >
            {{ interval }} day{{ interval > 1 ? 's' : '' }}
          </a>
        </div>

        <div class="last-updated-note">
          Last updated
          <strong>39 seconds ago</strong>
        </div>
      </div>

      <hr />

      <b-row>
        <b-col xs="12" lg="9">
          <div class="price-chart-container">
            <div v-show="loading">
              <vue-loaders-ball-beat color="#432B97" scale="1"></vue-loaders-ball-beat>
            </div>
            <TokenPriceChart v-show="!loading" :data="chartData" />
          </div>
        </b-col>
        <b-col xs="12" lg="3">
          <h3 style="margin-bottom: 20px;">Data sources</h3>
          <div class="abc-checkbox" v-for="source in sources" :key="source">
            <input
              type="checkbox"
              :id="source"
              :value="source"
              v-model="selectedSources"
            />
            <label :for="source" style="font-size: 1.2em;">
                <span class="source-name text-muted">
                  {{ source }}
                </span>
                <span style="float:right;" >${{ currentPrice.source[source] | price }}</span>
            </label>
          </div>
        </b-col>
      </b-row>

    </BCard>
  </div>
</template>

<script>
import limestone from 'limestone-api';
import { BCard, BFormInput, BForm } from 'bootstrap-vue';
import TokenPriceChart from './TokenPriceChart';
import StatElem from './StatElem';
import _ from 'lodash';

function formatPrice(value) {
  return (value || 0).toFixed(2);
}

export default {
  name: "TokenPriceChartContainer",
  props: {
    symbol: String,
    provider: String,
    currentPrice: Object,
  },

  data() {
    return {
      prices: [],
      loading: false,
      lastDaysCount: 1,
      selectedSources: [],
    };
  },

  created() {
    this.loadPrices();
  },

  methods: {
    async loadPrices() {
      try {
        this.loading = true;
        this.prices = await limestone
          .query()
          .symbol(this.symbol)
          .forLastDays(this.lastDaysCount)
          .exec({ provider: this.provider });
      } finally {
        this.loading = false;
      }
    },

    intervalSelected(interval) {
      if (this.lastDaysCount !== interval) {
        this.lastDaysCount = interval;
        this.loadPrices();
      }
    },
  },

  watch: {
    lastDaysCount() {
      // console.log(`Last days count updated to ${newVal}`);
      this.loadPrices();
    },

    symbol() {
      this.loadPrices();
    },
  },

  computed: {
    chartData() {
      const labels = [];
      const values = [];

      for (const price of this.prices) {
        labels.push(price.timestamp);
        values.push(price.value);
      }

      return {
        labels,
        values,
      };
    },

    stats() {
      return {
        Minimum: formatPrice(_.min(this.chartData.values)),
        Maximum: formatPrice(_.max(this.chartData.values)),
        Average: formatPrice(_.mean(this.chartData.values)),
      };
    },

    sources() {
      const result = new Set();

      for (const price of this.prices) {
        for (const source of _.keys(price.source)) {
          result.add(source);
        }
      }

      return Array.from(result);
    },
  },

  components: {
    TokenPriceChart,
    BCard,
    BFormInput,
    BForm,
    StatElem,
  },
}
</script>

<style scoped lang="scss">

.source-name {
  margin-left: 10px;
  font-weight: 300;
  font-size: 16px;
  text-transform: capitalize;
}

.price-chart-container {
  min-height: 400px;
}

.bar-below-chart {
  display: flex;
  justify-content: space-between;

  .last-updated-note {
    color: #adb5bd;
  }
}

.stats-container {
  display: flex;
}

.time-range-links {
  a {
    margin-right: 10px;

    &.selected {
      text-decoration: underline;
    }
  }
}
</style>
