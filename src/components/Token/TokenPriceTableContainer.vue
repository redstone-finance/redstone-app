<template>
  <div>
    <div class="table-filters-container">
      <b-row>
        <b-col xs="12" lg="6">
          <b-form inline>
            <div class="datepicker-container">
              <label for="from-datepicker">From date</label>
              <b-datepicker id="from-datepicker" v-model="fromDate">
              </b-datepicker>
            </div>
            <div class="datepicker-container">
              <label for="to-datepicker">To date</label>
              <b-datepicker id="to-datepicker" v-model="toDate">
              </b-datepicker>
            </div>
          </b-form>
        </b-col>
        <b-col xs="12" lg="6">
          <div class="pagination-container overflow-auto">
            <b-pagination
              v-model="currentPage"
              :per-page="perPage"
              :total-rows="limit"
              aria-controls="prices-table"
              align="right"
            >
            </b-pagination>
          </div>
        </b-col>
      </b-row>
    </div>

    <hr />

    <b-table
      id="prices-table"
      striped
      hover
      :per-page="perPage"
      :current-page="currentPage"
      :busy.sync="loading"
      :items="pricesDataForTable"
      :fields="fields"
    >
      <template #table-busy>
        <vue-loaders-ball-beat color="var(--redstone-red-color)" scale="1"></vue-loaders-ball-beat>
      </template>

      <template #cell(value)="data">
        {{ data.item.value | price }}
      </template>

      <template #cell(permawebTx)="data">
        <a
          target="_blank"
          :href="'https://viewblock.io/arweave/tx/' + data.item.permawebTx"
        >
          {{ data.item.permawebTx | tx }}
        </a>
      </template>

      <template #cell(actions)="data">
        <b-btn
          target="_blank"
          :href="'https://viewblock.io/arweave/tx/' + data.item.permawebTx"
          variant="outline-primary"
        >
          Raise dispute
        </b-btn>
      </template>
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
      loading: false,
      limit: 200,
      currentPage: 1,
      perPage: 10,
      fromDate: new Date(Date.now() - 24 * 3600 * 1000),
      toDate: new Date(),

      fields: ['value', 'time', 'permawebTx', 'actions'],
    };
  },

  created() {
    this.loadPrices();
  },

  methods: {
    async loadPrices() {
      try {
        this.loading = true;
        this.prices = await limestone.getHistoricalPrice(this.symbol, {
          // offset: this.offset,
          limit: this.limit,
          startDate: this.startDate,
          endDate: this.toDate,
        });
      } finally {
        this.loading = false;
      }
      
    },
  },

  watch: {
    fromDate() {
      this.loadPrices();
    },

    toDate() {
      this.loadPrices();
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

.datepicker-container {
  label {
    font-size: 12px;
    text-align: left;
    justify-content: left;
    color: #777;
  }
  margin-right: 20px;
}

.pagination-container {
  margin-top: 10px;
}

</style>