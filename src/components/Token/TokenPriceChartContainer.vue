<template>
  <div>
    <BCard class="border-0">
      <BForm inline>
        {{ symbol }}  Prices for last
        <BFormInput
          v-model="lastDaysCount"
          type="number"
          debounce="500"
          class="ml-2 mr-2"
          style="width: 80px"
        >
        </BFormInput>
        day(s)
      </BForm>
      <hr />
      <p v-if="loading">
        <vue-loaders-ball-beat color="#432B97" scale="1"></vue-loaders-ball-beat>
      </p>
      <TokenPriceChart v-show="!loading" :data="chartData" />
    </BCard>
  </div>
</template>

<script>
import limestone from 'limestone-api';
import { BCard, BFormInput, BForm } from 'bootstrap-vue';
import TokenPriceChart from './TokenPriceChart';

export default {
  name: "TokenPriceChartContainer",
  props: {
    symbol: String,
    provider: String,
  },

  data() {
    return {
      prices: [],
      loading: false,
      lastDaysCount: 1,
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
  },

  watch: {
    lastDaysCount() {
      // console.log(`Last days count updated to ${newVal}`);
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
  },

  components: {
    TokenPriceChart,
    BCard,
    BFormInput,
    BForm,
  },
}
</script>
