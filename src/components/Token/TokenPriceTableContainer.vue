<template>
  <div>
    <div class="table-filters-container">
      <b-row>
        <b-col xs="12" lg="6">
          <b-form inline>
            <!-- <div class="datepicker-container">
              <label for="from-datepicker">From date</label>
              <b-datepicker id="from-datepicker" v-model="fromDate">
              </b-datepicker>
            </div> -->
            <div class="datepicker-container">
              <label for="to-datepicker">Max date</label>
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
        <span
          v-if="isTxPendingForPrice(data.item)">
          <div class="pending-badge">
            <div class="badge-text">
              Pending
            </div>
            <div class="pending-tx-loader-container">
              <vue-loaders-ball-beat scale="0.4" color="white" />
            </div>
          </div>
          {{ data.item.permawebTx }}
        </span>
        <a
          v-else
          target="_blank"
          :href="'https://viewblock.io/arweave/tx/' + data.item.permawebTx">
          {{ data.item.permawebTx }}
        </a>
      </template>

      <template #cell(actions)="data">
        <b-btn
          target="_blank"
          :href="'https://viewblock.io/arweave/tx/' + data.item.permawebTx"
          variant="outline-primary"
          :disabled="isTxPendingForPrice(data.item)"
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
import Arweave from 'arweave';

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
      arweave: Arweave.init({
        host: 'arweave.dev',// Hostname or IP address for a Arweave host
        port: 443,          // Port
        protocol: 'https',  // Network protocol http or https
        timeout: 20000,     // Network request timeouts in milliseconds
        logging: false,     // Enable network request logging
      }),

      lastConfirmedTxTimestamp: 0,

      fields: ['value', 'time', 'permawebTx', 'actions'],
    };
  },

  created() {
    this.loadPrices();
  },

  timers: {
    updateLastConfirmedTxTimestamp: {
      autostart: true,
      time: 10000,
      repeat: true,
    },
  },

  methods: {
    isTxPendingForPrice(price) {
      return price.timestamp > this.lastConfirmedTxTimestamp;
    },

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

    async isTxConfirmed(txId) {
      const response = await this.arweave.transactions.getStatus(txId);
      const result = response && response.confirmed;
      return result;
    },

    async updateLastConfirmedTxTimestamp() {
      let lastTimestamp = 0, index = 0;
      while (lastTimestamp === 0 && index < this.prices.length) {
        const price = this.prices[index];
        const isConfirmed = await this.isTxConfirmed(price.permawebTx);
        if (isConfirmed) {
          lastTimestamp = price.timestamp;
        }
        index++;
      }
      this.lastConfirmedTxTimestamp = lastTimestamp;
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
          timestamp: p.timestamp,
          permawebTx: p.permawebTx,
        };
      });
    },
  },

}
</script>

<style scoped lang="scss">

.pending-badge {
  background: var(--redstone-red-color);
  color: white;
  display: inline-block;
  padding: 3px 10px;
  margin-right: 5px;
  border-radius: 5px;

  .badge-text {
    position: relative;
    bottom: 2px;
    display: inline-block;
  }

  .pending-tx-loader-container {
    position: relative;
    top: 3px;
    color: white;
    // border: 1px solid black;
    display: inline-block;
    // height: 15px;
  }
}

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