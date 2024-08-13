<template>
  <div class="provider-details">
    <div class="provider-info mt-2">
      <div class="mb-3 provider-description">
        <div v-if="provider">
          {{ provider.description }}
        </div>
        <div v-else class="preloader text-preloader"></div>
      </div>
      <!-- <div class="provider-www">
        <a v-if="provider" :href="provider.url" target="_blank">Go to providers website <i class="fa fa-external-link" /></a>
        <div
        v-else
        class="preloader text-preloader"
      ></div>
      </div>    -->
      <div class="d-flex justify-content-start mt-3 mb-2 provider-values">
        <!-- <LabelValue label="Active from" :value="provider ? $options.filters.date(provider.activeFrom) : undefined" /> -->
        <LabelValue
          label="Nodes"
          :value="
            provider && provider?.nodes?.length ? provider.nodes.length : '0'
          "
          :alignRight="true"
        />
        <LabelValue
          label="Assets"
          :value="
            provider && provider?.assetsCount ? provider.assetsCount : '0'
          "
          :alignRight="true"
        />
        <LabelValue
          label="Interval"
          :value="
            provider && provider.currentManifest
              ? formatInterval(provider.currentManifest.interval)
              : undefined
          "
          :alignRight="true"
        />
        <!-- <LabelValue label="Data points" :value="(provider && provider.dataPoints) ? provider.dataPoints.toLocaleString('en-US') : undefined" :alignRight="true"/> -->
        <!-- <LabelValue label="Stake" :value="(provider && provider.stakedTokens) ? provider.stakedTokens.toLocaleString('en-US') : (provider ? null : undefined)" :alignRight="true"/> -->
        <!-- <LabelValue label="Disputes" :value="provider ? null : undefined" /> -->
      </div>
    </div>
    <hr />
    <div>
      <div class="table-title mt-4 mb-2">Provided data:</div>
      <b-table
        id="assets-table"
        stacked="md"
        hover
        :items="visibleTokens"
        :fields="fieldsFiltered"
        v-if="dataServiceId !== 'redstone-custom-urls-demo'"
      >
        <template #cell(name)="data">
          <img class="token-logo" :src="data.item.logoURI" />
          <span class="token-name ml-3">{{ data.item.name }}</span>
        </template>
        <template #cell(symbol)="data">
          {{ data.item.symbol }}
        </template>
        <template #cell(sources)="data">
          <div
            class="d-flex source-links-wrapper"
            :ref="'symbols_' + data.item.symbol"
          >
            <div class="d-flex source-links">
              <a
                class="source-link mb-2 mb-md-0"
                target="_blank"
                :href="source.url"
                v-bind:key="source.symbol"
                v-for="source in data.item.source"
              >
                <img
                  class="source-logo"
                  :src="source.logoURI"
                  v-b-tooltip.hover
                  :title="source.name"
                />
              </a>
            </div>
          </div>
        </template>
      </b-table>
      <div
        v-if="!allTokensVisible"
        v-observe-visibility="loadMoreSectionVisibilityChanged"
      >
        <div v-for="n in 5" :key="n" class="preloader token-preloader"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import LabelValue from "@/components/DataService/LabelValue";
  import sourcesData from "../../config/sources.json";
  import _ from "lodash";
  import showMoreTokensMixin from "@/mixins/show-more-tokens";
  import { getDetailsForSymbol } from "@/tokens";

  export default {
    name: "DataService",

  props: {
    provider: {}
  },

  mixins: [showMoreTokensMixin],

  data() {
    return {
      fields: [{ key: 'name', label: 'Asset'}, 'symbol', 'sources'],
      firstManifest: null,
      transactionTime: null,
      tokens: null,
      VISIBLE_CHUNK_SIZE: 10
    }
  },

  methods: {
    formatSources(source) {
      return source.map(s => _.startCase(s)).join(', ');
    },

        let sourceList = detailsInManifest.source || this.currentManifest.defaultSource;

        return {
          logoURI: tokenInfo?.logoURI,
          symbol,
          name: tokenInfo?.name,
          source: sourceList.map(
            el => {
              return {
                name: el,
                ...sourcesData[el]
              }
            }
          ),
        };
      });

      setTimeout(this.showMoreTokens, 0);
    },
    loadMoreSectionVisibilityChanged() {
      this.showMoreTokens();
    },
    scrollFunction() {
        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
          this.showMoreTokens();
        }
    }
  },

  components: {
    LabelValue
  },

  computed: {
    currentManifest() {
      return this.provider?.currentManifest;
    },
    dataServiceId() {
      return this.$route.params.id;
    },
    fieldsFiltered() {
      return this.fields;
    }
  },

  created() {
    document.addEventListener('scroll', this.scrollFunction);
  },

  watch: {
    currentManifest: {
      immediate: true,
      handler: function() {
        if (this.currentManifest) {
          this.prepareTokensDataForTable();
        }
        return str.substring(0, lastDashIndex);
      },
      formatSources(source) {
        return source.map((s) => _.startCase(s)).join(", ");
      },
      prepareTokensDataForTable() {
        this.tokens = Object.entries(this.currentManifest.tokens).map(
          (entry) => {
            const [symbol, detailsInManifest] = entry;
            let tokenInfo = getDetailsForSymbol(symbol);

            let sourceList =
              detailsInManifest.source || this.currentManifest.defaultSource;

            return {
              logoURI: tokenInfo?.logoURI,
              symbol,
              name: tokenInfo?.name,
              source: sourceList.map((el) => {
                console.log({ el });
                return {
                  name: el,
                  ...sourcesData[this.removeContentAfterLastDash(el)],
                };
              }),
            };
          }
        );

        setTimeout(this.showMoreTokens, 0);
      },
      loadMoreSectionVisibilityChanged() {
        this.showMoreTokens();
      },
      scrollFunction() {
        if (
          window.innerHeight + window.pageYOffset >=
          document.body.offsetHeight
        ) {
          this.showMoreTokens();
        }
      },
    },

    components: {
      LabelValue,
    },

    computed: {
      currentManifest() {
        return this.provider?.currentManifest;
      },
      dataServiceId() {
        return this.$route.params.id;
      },
      fieldsFiltered() {
        return this.fields;
      },
    },

    created() {
      document.addEventListener("scroll", this.scrollFunction);
    },

    watch: {
      currentManifest: {
        immediate: true,
        handler: function () {
          if (this.currentManifest) {
            this.prepareTokensDataForTable();
          }
        },
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import "~@/styles/app";

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
  @import "~@/styles/app";

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
    table-layout: fixed;

  th {
    text-transform: none;
    color: $navy;
    font-size: 12px;
    font-weight:  $font-weight-soft-bold;
  }

  th:nth-of-type(1) {
    width: 250px;
  }

  th:nth-of-type(2) {
    width: 100px;
  }

  th:nth-of-type(3) {
    width: fit-content;
  }

  th:nth-of-type(4) {
    width: 250px;
  }

  th:nth-of-type(2) {
    overflow: hidden;
  }

  td .source-links {
    overflow: hidden;
  }

  td:not(:hover) .source-links-wrapper:after {
    content: "";
    box-shadow: inset -19px 0px 12px -10px $gray-100;
    z-index: 1;
    transform: translateX(-10px);
    height: 30px;
    width: 30px;
}
  
  td:hover {
    .source-links {
      flex-wrap: wrap;
    }
  }
}
</style>
