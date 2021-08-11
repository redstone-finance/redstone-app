<template>
  <div class="price-table">
    <div class="table-title">
      Data feeds
    </div>
    <div class="table-filters-container mt-4 mb-4 d-flex justify-content-start">
      <b-row>
        <b-col xs="12" md="6">
          <b-form inline>
            <div class="datepicker-container">
              <label class="mt-2 mt-md-0" for="from-datepicker">Show feeds from: </label>
              <b-datepicker 
                id="from-datepicker" 
                v-model="fromDate"
                :value-as-date="true"
                locale="en-GB"
                :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }">
              </b-datepicker>
              <b-form-timepicker 
                v-model="fromTime" 
                locale="en"
                no-close-button></b-form-timepicker>
            </div>
          </b-form>
        </b-col>
        <b-col xs="12" md="6">
          <b-form inline>
            <div class="datepicker-container">
              <label class="mt-2 mt-md-0" for="to-datepicker">to:</label>
              <b-datepicker 
                id="to-datepicker" 
                v-model="toDate"
                :value-as-date="true"
                locale="en-GB"
                :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }">
              </b-datepicker>
              <b-form-timepicker 
                v-model="toTime" 
                locale="en"
                no-close-button></b-form-timepicker>
            </div>
          </b-form>
        </b-col>
      </b-row>
    </div>

    <hr />

    <b-table
      id="prices-table"
      stacked="md"
      hover
      :busy.sync="loading"
      :items="pricesDataForTable"
      :fields="fields"
    >
      <template #table-busy>
        <vue-loaders-ball-beat color="var(--redstone-red-color)" scale="1"></vue-loaders-ball-beat>
      </template>

      <template #cell(value)="data">
        <div class="price">
          {{ data.item.value | price }} 
        </div>
      </template>

      <template #cell(time)="data">
        <div class="time">
          {{ data.item.time }} 
        </div>
      </template>

      <template #cell(status)="data">
        <div v-if="isTxPendingForPrice(data.item)"
            class="badge mining align-self-start">
          <div class="badge-text">
            Mining
          </div>
          <div class="pending-tx-loader-container">
            <img src="/white-loader.svg" alt="animated white loader" />
          </div>
        </div>
        <div v-else
            class="badge mined align-self-start">
          <div class="badge-text">
            Mined
          </div>
          <i class="fa fa-check"/>
        </div>
      </template>

      <template #cell(permawebTx)="data">
        <div
          v-if="isTxPendingForPrice(data.item)"
          class="tx-link d-flex flex-column flex-md-row align-items-md-center">
          <div class="link align-center mt-2 mt-md-0">
            {{ data.item.permawebTx }}
          </div>
        </div>
        <a
          class="tx-link"
          v-else
          target="_blank"
          :href="'https://viewblock.io/arweave/tx/' + data.item.permawebTx">
          {{ data.item.permawebTx }}
        </a>
      </template>

      <template #cell(dispute)="data">
        <b-btn
          target="_blank"
          :href="'https://viewblock.io/arweave/tx/' + data.item.permawebTx"
          variant="dispute"
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
      fromTime: (new Date()).toLocaleTimeString(),
      toTime: (new Date()).toLocaleTimeString(),
      fromDate: new Date(Date.now() - 24 * 3600 * 1000),
      toDate: new Date(),
      lastConfirmedTxTimestamp: 0,

      fields: ['value', 'time', 'status', 'permawebTx', 'dispute'],
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
        endDate: this.endDate,
      });
      return nextPrices;
    },

    async isTxConfirmed(txId) {
      const arweave = this.$store.state.prefetch.arweave;
      if (arweave) {
        const response = await arweave.transactions.getStatus(txId);
        const result = response && response.confirmed;
        return result;
      } else {
        return false;
      }
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
    }
  },

  watch: {
    fromDate() {
      this.loadPrices();
    },
    toDate() {
      this.loadPrices();
    },
    fromTime() {
      this.loadPrices();
    },
    toTime() {
      this.loadPrices();
    },
  },

  computed: {
    pricesDataForTable() {
      return this.prices.map(p => {
        return {
          value: p.value,
          time: dateFormat(p.timestamp, "dd/mm/yyyy    h:MM:ss"),
          timestamp: p.timestamp,
          permawebTx: p.permawebTx,
        };
      });
    },
    startDate() {
      const [hours, minutes, seconds] = this.fromTime.split(':');
      return new Date(this.fromDate.setHours(hours, minutes, seconds));
    },
    endDate() {
      const [hours, minutes, seconds] = this.toTime.split(':');
      return new Date(this.toDate.setHours(hours, minutes, seconds));
    }
  },

}
</script>

<style lang="scss">
@import '~@/styles/app';

.price, .time {
  color: $gray-750;
}

.tx-link {
  font-size: 12px;
}

a.tx-link, .tx-link > .link {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  color: $gray-600
}

a.tx-link {
  color: var(--redstone-red-color);
}

.badge {
  color: white;
  display: flex !important;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 95px;
  padding: 3px 10px;
  border-radius: 5px;
  margin-right: 8px;
  height: 28px;

  &.mining {
    background: $gray-600;  
  }

  &.mined {
    background: var(--redstone-red-color); 
  }

  .badge-text {
    font-size: 14px;
    font-weight: $font-weight-normal;
  }

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
  margin-right: 20px;
  display: flex;

  label {
    font-size: 14px;
    font-weight: $font-weight-thin;
    text-align: left;
    justify-content: left !important;
    color: $gray-750;
    white-space: nowrap;
    margin-right: 10px;
  }

  @media (max-width: breakpoint-max(sm)) {
    flex-wrap: wrap;

    > label {
      flex: 0 0 100%;
    }
  }


  .b-form-btn-label-control.form-control {
    height: 35px;
  }

  .form-control.b-form-datepicker, .form-control.b-form-timepicker {
    margin-right: 10px;
    display: flex;
  }

  .form-control {
    display: inline-block;
    width: auto;
    vertical-align: middle;
    background-color: transparent;
    border: 1px solid $gray-450;
  }

  .b-form-btn-label-control {
    flex-direction: row-reverse;

    & > button {
      padding: 0 10px 0 0 ;

      svg {
        fill: $gray-550;
      }
    }
  }

  .b-form-btn-label-control.form-control > .form-control {
    word-break: normal;
    white-space: nowrap;
  }

  .b-form-btn-label-control.form-control > label.form-control {
    margin-top: 2px;
    padding-left: 10px;
    font-weight: $font-weight-soft-bold;
  }
}

.b-time {
  output {
    justify-content: center;
  }
}

.pagination-container {
  margin-top: 10px;
}

.price-table {
  margin-top: 20px;
  padding: 20px;
}

.table-title {
  font-size: 24px;
  color: $navy;
  font-weight: $font-weight-semi-bold;
}

a.btn-dispute {
  padding: 2px 10px 4px 11px;
  border-radius: 7px;
  border: solid 1px var(--redstone-red-color);
  color: var(--redstone-red-color);

  &.disabled {
    border: solid 1px $gray-600;
    color: $gray-600;
  }
}

.b-form-datepicker {
  .dropdown-menu {
    left: -100px !important;
  }
}

.b-form-timepicker {
  .dropdown-menu {
    left: -78px !important;
  }
}

#prices-table {
  td {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  th {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
}

</style>
