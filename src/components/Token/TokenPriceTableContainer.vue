<template>
  <div class="price-table">
    <h2 class="table-title">
      Price table
    </h2>
    <div class="table-filters-container">
      <b-row>
        <b-col xs="12" lg="6">
          <b-form inline>
            <div class="datepicker-container">
              <label for="to-datepicker">Max date</label>
              <b-datepicker id="to-datepicker" v-model="toDate">
              </b-datepicker>
            </div>
          </b-form>
        </b-col>
      </b-row>
    </div>

    <hr />

    <b-table
      id="prices-table"
      striped
      hover
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
          v-if="isTxPendingForPrice(data.item)"
          class="tx-link">
          <div class="pending-badge">
            <div class="badge-text">
              Pending
            </div>
            <div class="pending-tx-loader-container">
              <img src="/white-loader.svg" alt="animated white loader" />
            </div>
          </div>
          {{ data.item.permawebTx }}
        </span>
        <a
          class="tx-link"
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

    <div
      v-if="prices.length > 0"
      class="load-more-link-container"
      v-observe-visibility="loadMoreButtonVisibilityChanged"
    >
      <!-- <b-btn
        size="sm"
        variant="outline-primary"
        @click="loadMore()"
      >
        Load more
      </b-btn> -->

      <div class="loading-more-container" v-if="loadingMore">
        <vue-loaders-ball-beat
          color="#3e86ca"
          scale="0.5"
        ></vue-loaders-ball-beat>
      </div>
    </div>
  </div>
</template>

<script>
import redstone from 'redstone-api';
import dateFormat from 'dateformat';
import Arweave from 'arweave';

export default {
  name: 'TokenPriceTableContainer',

  props: {
    symbol: String,
    provider: String,
  },

  data() {
    return {
      prices: [],
      offset: 0,
      loading: false,
      loadingMore: false,
      limit: 20,
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

  async created() {
    await this.loadPrices();
    await this.updateLastConfirmedTxTimestamp();
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

    loadMoreButtonVisibilityChanged(visible) {
      if (visible) {
        this.loadMore();
      }
    },

    async loadPrices() {
      try {
        this.loading = true;
        this.offset = 0;
        this.prices = await this.getPrices();
      } finally {
        this.loading = false;
      }
    },

    async loadMore() {
      try {
        this.loadingMore = true;
        this.offset += this.limit;
        const morePrices = await this.getPrices();
        for (const price of morePrices) {
          this.prices.push(price);
        }
      } finally {
        this.loadingMore = false;
      }
    },

    async getPrices() {
      const nextPrices = await redstone.getHistoricalPrice(this.symbol, {
        provider: this.provider,
        limit: this.limit,
        startDate: this.startDate,
        offset: this.offset,
        endDate: this.toDate,
      });
      return nextPrices;
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

.tx-link {
  font-size: 12px;
  display: flex;
  align-items: center;

}

.pending-badge {
  background: var(--redstone-red-color);
  color: white;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 95px;
  padding: 3px 10px;
  border-radius: 5px;
  margin-right: 8px;

  .pending-tx-loader-container {
    img {
      width: 20px;
    }
  }
}

.load-more-link-container {
  display: flex;
  justify-content:center;
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

.price-table {
  margin-top: 40px;
}

</style>
