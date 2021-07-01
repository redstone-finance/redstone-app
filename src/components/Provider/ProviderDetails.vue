<template>
  <div class="provider-details">
    <div class="provider-info mt-2">
      <div class="mb-3">
        <h6>{{ provider.description }}</h6>
      </div> 
      <div>
        <a :href="provider.url" target="_blank">{{ provider.url }}</a>
      </div>   
      <div class="d-flex justify-content-between mt-5 mb-5">
        <LabelValue label="Stake" :value="provider.stakedTokens.toString()" />
        <LabelValue label="Activation date" :value="active | date" />
        <LabelValue label="Interval" :value="currentManifest.interval.toString()" />
        <LabelValue label="Data points" :value="points ? points.toString() : ''" />
        <LabelValue label="Default source" :value="currentManifest.defaultSource ? currentManifest.defaultSource[0] : ''" />
        <LabelValue label="Disputes" :value="provider.disputes" />
      </div>
    </div>  
    <div>
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
        {{ data.item.name }}
      </template>

      <template #cell(sources)="data">
        {{ formatSources(data.item.sources) }}
      </template>
    </b-table>
    </div>
  </div>
</template>

<script>
import LabelValue from '@/components/Provider/LabelValue';
import tokensData from "@/assets/data/tokens.json";
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
      fields: ['logo', 'symbol', 'name', 'sources'],
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
    console.log(this.provider)
  },

  methods: {
    formatSources(sources) {
      return sources.map(s => _.startCase(s)).join(', ');
    },
  },

  components: {
    LabelValue
  },

  computed: {
    tokensDataForTable() {
      return Object.entries(this.currentManifest.tokens).map(function (token) {
        let tokenInfo = tokensData[token[0]]
        return {
          logoURI: tokenInfo.logoURI,
          symbol: token[0],
          name: tokenInfo.name,
          sources: token[1].source
        };
      });
    },

    currentManifest() {
      return this.provider.manifests.slice(-1).pop().activeManifestContent;
    }
  }
}
</script>

<style lang="scss" scoped>
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
</style>
