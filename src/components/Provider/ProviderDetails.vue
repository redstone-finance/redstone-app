<template>
  <div class="provider-details">
    <div class="provider-info mt-2">
      <div class="mb-3 provider-description">
        <div v-if="provider">{{ provider.profile.description }}</div>
        <div
        v-else
        class="preloader text-preloader"
      ></div>
      </div> 
      <div class="provider-www">
        <a v-if="provider" :href="provider.profile.url" target="_blank">Go to providers website <i class="fa fa-external-link" /></a>
        <div
        v-else
        class="preloader text-preloader"
      ></div>
      </div>   
      <div class="d-flex justify-content-start mt-3 mb-2 provider-values">
        <LabelValue label="Active from" :value="provider ? $options.filters.date(provider.activeFrom) : undefined" />
        <LabelValue label="Interval" :value="(provider && provider.currentManifest) ? formatInterval(provider.currentManifest.interval) : undefined" :alignRight="true"/>
        <LabelValue label="Data points" :value="(provider && provider.dataPoints) ? provider.dataPoints.toLocaleString('en-US') : undefined" :alignRight="true"/>
        <LabelValue label="Stake" :value="(provider && provider.stakedTokens) ? provider.stakedTokens.toLocaleString('en-US') : (provider ? null : undefined)" :alignRight="true"/>
        <LabelValue label="Default source" :value="(provider && provider.currentManifest) ? (provider.currentManifest.defaultSource ? provider.currentManifest.defaultSource[0] : '') : undefined" />
        <LabelValue label="Disputes" :value="provider ? null : undefined" />
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

      <template #cell(name)="data">
        <img class="token-logo" :src="data.item.logoURI" />
        <span class="token-name ml-3">{{ data.item.name }}</span> 
      </template>

      <template #cell(symbol)="data">
        {{ data.item.symbol }}
      </template>

      <template #cell(sources)="data">
        <a class="source-link mb-2 mb-md-0" target="_blank" :href="source.url" v-bind:key="source.symbol" v-for="source in data.item.source">
          <img class="source-logo" :src="source.logoURI" v-b-tooltip.hover :title="source.name" />
        </a>
      </template>
    </b-table>
    <div v-if="!tokensDataForTable">
      <div
        v-for="n in 5"
        :key="n"
        class="preloader token-preloader"
      ></div>
    </div>  
    </div>
  </div>
</template>

<script>
import LabelValue from '@/components/Provider/LabelValue';
import tokensData from "redstone-node/src/config/tokens.json";
import sourcesData from "redstone-node/src/config/sources.json";
import _ from 'lodash';
const axios = require('axios');
import utils from "@/utils";
import constants from "@/constants";

export default {
  name: "Provider",

  props: {
    provider: {}
  },

  data() {
    return {
      fields: [{ key: 'name', label: 'Asset'}, 'symbol', 'sources'],
      firstManifest: null,
      transactionTime: null
    }
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
      let tokens = (this.provider && this.provider.currentManifest && this.provider.currentManifest.tokens) ? Object.entries(this.provider.currentManifest.tokens).map(function (token) {
        let tokenInfo = tokensData[token[0]]
        return {
          logoURI: tokenInfo ? tokenInfo.logoURI : 'https://static.thenounproject.com/png/3094257-200.png',
          symbol: token[0],
          name: tokenInfo ? tokenInfo.name : '',
          source: token[1].source ? token[1].source.map(
            el => {
              return {
                name: el,
                ...sourcesData[el]
              }
            }
          ) : []
        };
      }) : null;

      return tokens;
    },

    firstManifestTxId() {
      return this.provider ? this.provider.manifests[0].manifestTxId : undefined;
    },
    lockedHours() {
      return (this.firstManifest && this.firstManifest.data.lockedHours) ? this.firstManifest.data.lockedHours : undefined
    }
  },

  watch: {
    firstManifestTxId() {
      if (this.firstManifestTxId) {
        axios.get(`https://${constants.arweaveUrl}/tx/${this.firstManifestTxId}/data.json`).then(
          result => this.firstManifest = result
        );

        utils.transactionTime(this.firstManifestTxId).then(
          result => this.transactionTime = result
        );
      }
    },
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
    }

    LabelValue {
      margin-bottom: 10px;
    }

    .provider-www, .provider-description {
      margin-left: 10px;
    }

    .provider-description {
      font-weight: $font-weight-normal;
    }

    .provider-www {
      font-weight: $font-weight-soft-bold;

      i {
        transform: translate(3px, 1px);
      }
    }
  }

  .provider-values {
    margin-left: 10px;

    & > div {
      flex: 0 0 13%;
    }

    @media (max-width: breakpoint-max(sm)) {
      flex-wrap: wrap;
      
      & > div {
        flex: 0 0 50%;
      }
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
  margin: 4px;
}

.text-preloader {
  width: 350px;
  @include preload-animation(2.5s, 350px);

  &:first-of-type {
    height: 16px;
    margin-bottom: 6px;
  }

  &:nth-of-type(2) {
    height: 16px;
    margin-bottom: 5px;
  }
}

.token-preloader {
  height: 35px;
  margin-bottom: 20px;
  border-radius: 3px;
  @include preload-animation(2.5s, 100vw);
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
