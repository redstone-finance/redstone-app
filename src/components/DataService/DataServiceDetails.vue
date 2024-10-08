<template>
  <div class="provider-details">
    <div class="provider-info mt-2">
      <div class="d-flex justify-content-start mt-3 mb-2 provider-values">
        <div class="pull-model__status">
          <span class="feeds__status-text mr-4"
            ><div><i class="fa fa-server inline"></i> Nodes</div>
            <strong>{{
              provider && provider?.nodes?.length ? provider.nodes.length : "0"
            }}</strong></span
          >
          <span class="feeds__status-text mr-4"
            ><div><i class="fa fa-cube inline"></i> Assets</div>
            <strong>{{
              provider && provider?.assetsCount ? provider.assetsCount : "0"
            }}</strong></span
          >
          <span class="feeds__status-text mr-4"
            ><div><i class="fa fa-clock-o inline"></i> Interval</div>
            <strong>{{
              provider && provider.currentManifest
                ? formatInterval(provider.currentManifest.interval)
                : undefined
            }}</strong></span
          >
        </div>
        <div
          class="pull-model__pagers text-light fw-normal"
          style="margin-left: auto"
        >
          <span class="feeds__status-text">
            Per page:
            <select
              v-model="perPage"
              @change="onPerPageChange"
              class="feeds__select"
            >
              <option
                v-for="option in perPageOptions"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </span>
          <span class="feeds__status-text" style="text-align: right">
            Current page:
            <select
              v-model="currentPage"
              @change="onSelectedPageChange"
              class="feeds__select"
            >
              <option v-for="page in availablePages" :key="page" :value="page">
                {{ page }}
              </option>
            </select>
          </span>
        </div>
      </div>
    </div>
    <hr />
    <div>
      <b-table
        id="assets-table"
        ref="assetsTable"
        stacked="md"
        hover
        :items="tokens"
        :fields="fieldsFiltered"
        :per-page="perPage"
        :current-page="currentPage"
        :filter="filters"
        :filter-function="customFilter"
        @filtered="onFiltered"
        v-if="dataServiceId !== 'redstone-custom-urls-demo'"
      >
        <template #cell(name)="data">
          <img class="token-logo" :src="data.item.logoURI || logoPlaceholder" />
          <span class="token-name ml-3">{{ data.item.name }}</span>
        </template>
        <template #cell(symbol)="data">
          <span
            class="text-truncate d-block"
            v-b-tooltip.hover
            :title="data.item.symbol"
          >
            {{ data.item.symbol }}
          </span>
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
                  :src="source.logoURI || findLogoForSource(source.name) || logoPlaceholder"
                  v-b-tooltip.hover
                  :title="source.name"
                />
              </a>
            </div>
          </div>
        </template>
      </b-table>
      <b-pagination
        :prev-text="prevIcon"
        :next-text="nextIcon"
        limit="1"
        @change="onPageChange"
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        align="fill"
        class="my-3 custom-pagination"
      >
        <template #page="{ page }">
          <span v-if="page === currentPage" class="entry-info">
            <span v-if="totalRows > 0">
              Showing {{ firstEntry }} to {{ lastEntry }} of
              {{ totalRows }} entries
            </span>
            <span v-else
              >No entries found
              <span v-if="hasFiltersAndSearch"> - </span>
              <span
                style="pointer-events: all"
                v-if="hasFiltersAndSearch"
                class="clear-filters"
                @click="resetFilters"
                >Clear filters</span
              ></span
            >
          </span>
          <span v-else>{{ page }}</span>
        </template>
      </b-pagination>
    </div>
  </div>
</template>

<script>
  import { findLogoForSource } from "./logosHelper";
  import { mapState } from "vuex";
  import LabelValue from "@/components/DataService/LabelValue";
  import sourcesData from "../../config/sources.json";
  import _ from "lodash";
  import { getDetailsForSymbol } from "@/tokens";
  import { RouteParamsHandler } from "@/core/RouteParamsHandler";

  export default {
    name: "DataService",

    components: {
      LabelValue,
    },

    props: {
      provider: {},
    },

    data() {
      return {
        fields: [
          { key: "name", label: "Asset", thStyle: { width: "300px" } },
          { key: "symbol", label: "Symbol", thStyle: { width: "200px" } },
          "sources",
        ],
        firstManifest: null,
        transactionTime: null,
        tokens: null,
        logoPlaceholder:
          "https://raw.githubusercontent.com/redstone-finance/redstone-images/main/redstone-logo.png",
        currentPage: 1,
        perPage: 16,
        routeParamsHandler: null,
        perPageOptions: [8, 16, 32, 64],
        filteredItems: [],
      };
    },

    computed: {
      ...mapState("layout", ["searchTerm"]),

      filters() {
        return {
          searchTerm: this.searchTerm,
        };
      },

      totalRows() {
        return this.filteredItems.length || this.tokens.length;
      },

      firstEntry() {
        return this.totalRows === 0
          ? 0
          : (this.currentPage - 1) * this.perPage + 1;
      },

      lastEntry() {
        return Math.min(this.currentPage * this.perPage, this.totalRows);
      },

      availablePages() {
        return Array.from(
          { length: Math.ceil(this.totalRows / this.perPage) },
          (_, i) => i + 1
        );
      },

      currentManifest() {
        return this.provider?.currentManifest;
      },

      dataServiceId() {
        return this.$route.params.id;
      },

      fieldsFiltered() {
        return this.fields;
      },

      prevIcon() {
        return "Previous";
      },

      nextIcon() {
        return "Next";
      },

      hasFiltersAndSearch() {
        return this.searchTerm || false; // Add other filter checks if needed
      },
    },

    methods: {
      findLogoForSource,
      onPerPageChange() {
        this.currentPage = 1;
        this.updateRouteParams();
      },

      onSelectedPageChange() {
        this.updateRouteParams();
      },

      removeContentAfterLastDash(str) {
        const lastDashIndex = str.lastIndexOf("-");
        if (lastDashIndex === -1) {
          return str;
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
                return {
                  name: el,
                  ...sourcesData[this.removeContentAfterLastDash(el)],
                };
              }),
            };
          }
        );
      },

      onPageChange(page) {
        this.currentPage = page;
        this.updateRouteParams();
      },

      updateRouteParams() {
        this.routeParamsHandler.updateRouteParams({
          currentPage: this.currentPage,
          perPage: this.perPage,
          searchTerm: this.searchTerm,
        });
      },

      initializeFromRoute() {
        const routeParams =
          this.routeParamsHandler.initializeFiltersFromRoute();
        this.currentPage = routeParams.currentPage;
        this.perPage = routeParams.perPage;
        this.$store.dispatch(
          "layout/updateSearchTerm",
          routeParams.searchTerm || ""
        );
      },

      onFiltered(filteredItems) {
        this.filteredItems = filteredItems;
      },

      formatInterval(interval) {
        return interval / 1000 + " s"; // Convert ms to seconds and format
      },

      customFilter(row, filters) {
        if (!filters.searchTerm) return true;
        const searchLower = filters.searchTerm?.toLowerCase();
        return (
          row.name?.toLowerCase().includes(searchLower) ||
          row.symbol?.toLowerCase().includes(searchLower)
        );
      },

      resetFilters(clearSearch = true) {
        if (clearSearch) {
          this.$store.dispatch("layout/updateSearchTerm", "");
        }
        this.currentPage = 1;
        this.updateRouteParams();
        this.$store.dispatch("layout/updateFeedsFilterStatus", false);
      },
      applyFilters() {
        // this.$refs.assetsTable?.refresh();
        if (this.searchTerm) {
          this.$store.dispatch("layout/updateFeedsFilterStatus", true);
        }
      },
    },

    created() {
      document.addEventListener("scroll", this.scrollFunction);
      this.routeParamsHandler = new RouteParamsHandler(
        this.$router,
        {
          pageParam: "page",
          searchParam: "search",
        },
        16
      );
      this.initializeFromRoute();
    },

    mounted() {
      this.$nextTick(() => {
        this.routeParamsHandler.setInitialLoadComplete();
      });
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
      searchTerm: {
        handler(newValue) {
          this.currentPage = 1;
          this.applyFilters();
          this.updateRouteParams();
          if (this.searchTerm === "") {
            this.$store.dispatch("layout/updateFeedsFilterStatus", true);
          } else if (newValue?.length >= 3) {
            this.resetFilters(false);
            this.$store.dispatch("layout/updateFeedsFilterStatus", false);
          }
        },
      },
    },

    beforeDestroy() {
      document.removeEventListener("scroll", this.scrollFunction);
    },
  };
</script>

<style lang="scss" scoped>
  @import "~@/styles/app";

  .provider-details {
    .token-logo {
      width: 40px;
      height: 40px;
      padding: 5px;
      box-shadow: var(--content-shadow);
      border-radius: 40px;
      border: 2px solid #ebebeb;
      margin: 10px;
    }

    .provider-info {
      margin-bottom: 30px;
    }

    LabelValue {
      margin-bottom: 10px;
    }

    .provider-www,
    .provider-description {
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

  .pull-model {
    font-size: 14px;
    background-color: $gray-100;
    border-radius: 10px;
    padding: 2rem;
    box-shadow: var(--content-shadow);

    &__pagers {
      display: flex;
      justify-content: center;
      align-items: center;
      justify-items: center;
      span {
        text-align: center !important;
      }
      select {
        width: 100px;
      }
    }
    &__view-details {
      padding: 0 10px;
      margin-bottom: 30px;
      h1 {
        font-size: 18px;
      }
    }
    &__status {
      display: flex;
      flex-flow: row;
      align-items: center;
      border-radius: 10px;
      border: 1px solid rgb(227, 227, 227);
      background-color: $gray-200;
      // box-shadow: var(--content-shadow);
      padding: 10px;
      div {
        display: flex;
        align-items: center;
        i {
          margin-right: 5px;
        }
      }
      strong {
        font-size: 15px;
      }
    }
    table {
      border-top: 1px solid rgb(227, 227, 227);
    }

    thead {
      tr {
        background: #f4f4f4;
      }

      th {
        background-position: 30px !important;
        padding: 30px 15px !important;
        text-align: center;
        border: 1px solid rgb(227, 227, 227) !important;
        text-transform: capitalize !important;
        font-size: 12px !important;
      }
    }

    tbody tr {
      &:hover {
        background: #fff !important;
      }

      &:nth-child(even) {
        background: #f4f4f4 !important;
      }

      padding: 10px !important;

      td {
        text-align: center;
        border-top: 1px solid rgb(227, 227, 227);
        border-bottom: 1px solid rgb(227, 227, 227);
        padding: 20px 10px;
        &:first-child {
          text-align: left;
        }
        &:nth-child(3) {
          // second is taken by popularity
          text-align: left;
        }

        @media (min-width: breakpoint-min(lg)) {
          &:first-child {
            border-left: 1px solid rgb(227, 227, 227);
          }

          &:last-child {
            border-right: 1px solid rgb(227, 227, 227);
          }
        }
      }
    }

    &__table {
      font-size: 14px;
    }

    @media (max-width: breakpoint-min(md)) {
      &__table {
        border: 0;

        thead {
          display: none;
        }

        tbody {
          tr {
            border: 1px solid #ced4da;
            margin-bottom: 1rem;
            display: block;
            border-radius: 5px;
            &:nth-child(even) {
              background-color: #fff !important;
            }

            td {
              display: block;
              text-align: left;
              padding: 15px 0 !important;
              position: relative;
              border: 0 !important;
              div {
                width: 100% !important;
              }
              &::before {
                content: attr(data-label);
                text-align: left;
                font-size: 10px;
              }
            }
          }
        }
      }
    }

    // .table.b-table > tbody > tr > [data-label]::before {
    //   content: attr(data-label);
    // }

    .disable-sorting {
      thead {
        th:nth-child(5) {
          pointer-events: none !important;
        }
      }
    }

    .table-loader {
      width: 100%;
      text-align: center;
      margin: 0 auto;
      padding: 100px 0;
    }
  }

  .label-value {
    .value {
      color: $gray-750;
      font-weight: $font-weight-normal;
    }

    .label {
      font-weight: $font-weight-soft-bold;
      color: $navy;
    }
  }

  .provider-details #assets-table {
    table-layout: fixed;

    th {
      text-transform: none;
      color: $navy;
      font-size: 12px;
      font-weight: $font-weight-soft-bold;
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
