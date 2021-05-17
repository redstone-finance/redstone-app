<template>
  <div>
    <BCard class="border-0">
      {{ symbol }}  Prices
      <hr />
      <p v-if="loading">Loading...</p>
      <TokenPriceChart v-show="!loading" :data="chartData" />
    </BCard>
  </div>
</template>

<script>
import limestone from 'limestone-api';
import { BCard } from 'bootstrap-vue';
import TokenPriceChart from './TokenPriceChart';

export default {
  name: "TokenPriceChartContainer",
  props: {
    symbol: String,
  },

  data() {
    return {
      prices: [],
      loading: false,
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
          .forLastDays(1)
          .exec();
      } finally {
        this.loading = false;
      }
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
  },

  components: {
    TokenPriceChart,
    BCard,
  },
}
</script>
