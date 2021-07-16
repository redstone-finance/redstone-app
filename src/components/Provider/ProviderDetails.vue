<template>
  <div class="provider-details">
    <div class="provider-info mt-2">
      <div class="mb-3">
        <h6>{{ provider.description }}</h6>
      </div> 
      <div>
        <a :href="provider.url" target="_blank">{{ provider.url }}</a>
      </div>   
      <div class="d-flex justify-content-start mt-3 mb-2 provider-values">
        <LabelValue label="Active from" :value="active | date" />
        <LabelValue label="Interval" :value="formatInterval(currentManifest.interval)" :alignRight="true"/>
        <LabelValue label="Data points" :value="points ? points.toLocaleString('en-US') : ''" :alignRight="true"/>
        <LabelValue label="Stake" :value="provider.stakedTokens ? provider.stakedTokens.toLocaleString('en-US') : ''" :alignRight="true"/>
        <LabelValue label="Default source" :value="currentManifest.defaultSource ? currentManifest.defaultSource[0] : ''" />
        <LabelValue label="Disputes" :value="provider.disputes" />
      </div>
    </div>  
    <hr />
    <div>
      <div class="table-title mt-4 mb-2">
        Provided data:
      </div>
      <b-table
        id="assets-table"
        stacked="md"
        hover
        :items="tokensDataForTable"
        :fields="fields"
        >

      <template #cell(logo)="data">
        <img class="token-logo" :src="data.item.logoURI" />
      </template>

      <template #cell(symbol)="data">
        {{ data.item.symbol }}
      </template>

      <template #cell(name)="data">
        <span class="token-name">{{ data.item.name }}</span> 
      </template>

      <template #cell(sources)="data">
        <a class="source-link" target="_blank" :href="source.url" v-bind:key="source.symbol" v-for="source in data.item.source">
          <img class="source-logo" :src="source.imgURI" v-b-tooltip.hover :title="source.name" />
        </a>
      </template>
    </b-table>
    </div>
  </div>
</template>

<script>
import LabelValue from '@/components/Provider/LabelValue';
import tokensData from "@/assets/data/tokens.json";
import sourcesData from "@/assets/data/sources-list.json";
import _ from 'lodash';
const axios = require('axios');
import providerMixin from "@/mixins/provider";

export default {
  name: "Provider",

  props: {
    provider: {}
  },

  mixins: [providerMixin],

  data() {
    return {
      fields: ['logo', { key: 'name', label: ''}, 'symbol', 'sources'],
      active: "",
      points: ""
    }
  },

  async mounted() {
    const firstManifestTxId = this.provider.manifests[0].manifestTxId;
    const firstManifest = await axios.get(`https://arweave.net/tx/${firstManifestTxId}/data.json`);
    const transactionTime = await this.transactionTime(firstManifestTxId);
    const lockedHours = firstManifest.data.lockedHours ? firstManifest.data.lockedHours : 0;

    this.active = this.activeFrom(transactionTime, lockedHours);
    this.points = this.dataPoints(this.currentManifest.interval, this.active);
  },

  created() {
  },

  methods: {
    formatSources(source) {
      return source.map(s => _.startCase(s)).join(', ');
    },
  },

  components: {
    LabelValue
  },

  computed: {
    tokensDataForTable() {
      let tokens =  this.currentManifest.tokens ? Object.entries(this.currentManifest.tokens).map(function (token) {
        let tokenInfo = tokensData[token[0]]
        return {
          logoURI: tokenInfo.logoURI,
          symbol: token[0],
          name: tokenInfo.name,
          source: token[1].source ? token[1].source.map(
            el => {
              return {
                name: el,
                ...sourcesData[el]
              }
            }
          ) : []
        };
      }) : [];
            console.log(tokens) 

            return tokens;

    },

    currentManifest() {
      return this.provider.manifests.slice(-1).pop().activeManifestContent;
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/app';

  .provider-details {
    .token-logo {
      height: 30px; 
      width: 30px;
    }

    .provider-info {
      margin-bottom: 30px;

      & > div {
        margin-bottom: 15px;
      }
    }

    LabelValue {
      margin-bottom: 10px;
    }
  }

  .provider-values {
    margin-left: 10px;

    & > div {
      flex: 0 0 12%;
    }
  }

  .token-name {
    font-size: 14px;
    font-weight: $font-weight-soft-bold;
    color: $navy;
  }

  hr {
    border-top: 1px solid $gray-300;
  }

  .table-title {
    margin-left: 10px;
    color: $navy;
    font-size: 20px;
    font-weight: $font-weight-soft-bold;
  }

.source-link {
  min-width: 30px;
  display: inline-block;
  text-align: center;
}

.source-logo {
  height: 20px;
}
</style>

<style lang="scss">
@import '~@/styles/app';

.label-value {
  .value {
    color: $gray-750;
    font-weight: $font-weight-normal;
  }

  .label {
    font-weight:  $font-weight-soft-bold;
    color: $navy;
  }
}

.provider-details #assets-table {
  th {
    text-transform: none;
    color: $navy;
    font-size: 12px;
    font-weight:  $font-weight-soft-bold;
  }
}
</style>
