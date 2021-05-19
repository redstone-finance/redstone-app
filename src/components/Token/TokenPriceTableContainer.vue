<template>
  <div>
    <div class="filters-container">

    </div>
    <b-table striped hover :items="pricesDataForTable">
    </b-table>
  </div>
</template>

<script>
import limestone from 'limestone-api';
import dateFormat from 'dateformat';

export default {
  name: 'TokenPriceTableContainer',

  props: {
    symbol: String,
  },

  data() {
    return {
      prices: [],
      offset: 0,
      limit: 50,
    };
  },

  created() {
    this.loadPrices();
  },

  methods: {
    async loadPrices() {
      this.prices = await limestone.getHistoricalPrice(this.symbol, {
        offset: this.offset,
        limit: this.limit,
      });
    },
  },

  computed: {
    pricesDataForTable() {
      return this.prices.map(p => {
        return {
          value: p.value,
          time: dateFormat(p.timestamp),
          permawebTx: p.permawebTx,
        };
      });
    },
  },


}
</script>

<style scoped lang="scss">

</style>