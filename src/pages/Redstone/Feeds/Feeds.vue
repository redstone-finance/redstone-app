<template>
  <div class="feeds">
    <div class="feeds__view-details">
      <h1>Push Model (On-chain Feeds)</h1>
      <p>
        RedStone Push Oracle offers robust, reliable and accurate data feeds
        available to query from the destination network.
      </p>
    </div>
    <div class="feeds__actions-wrapper">
      <div style="width: 100%">
        <div class="feeds__actions-wrapper-item">
          <NetworkPicker
            @input="handleFilter('networks', $event)"
            :value="selectedNetworks"
            :items="networksMap"
            class="feeds__network-picker"
          />
          <CryptoPicker
            :items="cryptoImages"
            @input="handleFilter('cryptos', $event)"
            :value="selectedCryptos"
            class="feeds__crypto-picker"
          />
          <div class="feeds__status">
            <div
              class="feeds__actions-wrapper-label mr-4 ml-4 text-light fw-normal"
            >
              <span class="feeds__status-text"
                >Selected networks:
                <strong>{{
                  selectedNetworks.length || networksMap.length
                }}</strong></span
              >
              <span class="feeds__status-text"
                >Selected feeds:
                <strong>{{
                  selectedCryptos.length || cryptoImages.length
                }}</strong></span
              >
            </div>
            <div
              class="feeds__actions-wrapper-label mr-4 text-light fw-normal"
            ></div>
          </div>
          <div
            class="feeds__actions-wrapper-label text-light fw-normal"
            style="margin-left: auto"
          >
            <span class="feeds__status-text mb-2">
              Feeds per page:
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
                v-model="selectedPage"
                @change="onSelectedPageChange"
                class="feeds__select"
              >
                <option
                  v-for="page in availablePages"
                  :key="page"
                  :value="page"
                >
                  {{ page }}
                </option>
              </select>
            </span>
          </div>
        </div>
        <div class="feeds__actions-wrapper-item">
          <div v-if="selectedNetworks.length > 0">
            <div class="selected-items">Selected networks:</div>
            <div class="selected-filters-icons">
              <SelectedFilters
                @remove="removeNetwork"
                :filters="displayedSelectedNetworks"
              />
            </div>
          </div>
          <div
            class="separator"
            v-if="selectedCryptos.length > 0 && selectedNetworks.length > 0"
          ></div>
          <div v-if="selectedCryptos.length > 0">
            <div class="selected-items">Selected feeds:</div>
            <div class="selected-filters-icons">
              <SelectedFilters
                @remove="removeCrypto"
                :filters="displayedSelectedCryptos"
              />
            </div>
          </div>
        </div>
        <div
          v-if="hasFiltersAndSearch"
          class="clear-filters"
          @click="resetFilters"
        >
          Clear all
        </div>
      </div>
    </div>
    <FeedsTable
      :is-loading="isLoading"
      :filters="filters"
      :feeds="feeds"
      @change="(value) => (displayedTableItems = value)"
      :per-page="perPage"
      :sort-by="sortBy"
      :sort-desc="sortDesc"
      :current-page="currentPage"
      @update:sort="handleSort"
      @update:filteredItems="onFiltered"
    />
    <b-pagination
      v-if="!isLoading"
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
            <span
              style="pointer-events: all"
              v-if="hasFiltersAndSearch"
              class="clear-filters"
              @click="resetFilters"
            >
              - Clear filters
            </span></span
          >
        </span>
        <span v-else>{{ page }}</span>
      </template>
    </b-pagination>
  </div>
</template>

<script>
  import _ from "lodash";
  import { mapActions, mapGetters, mapState } from "vuex";
  import {
    mapFeedsData,
    parseToCurrency,
    heartbeatIsNumber,
    nearestCron,
    findNetworkName,
    findNetworkImage,
    getTokenImage,
  } from "./utils/FeedsTableDataLayer";
  import filterMethods from "./utils/FilteringMethods.js";
  import prefetchImages from "@/core/prefetchImages";
  import truncateString from "@/core/truncate";
  import Loader from "../../../components/Loader/Loader";
  import CryptoPicker from "./components/CryptoPicker.vue";
  import NetworkPicker from "./components/NetworkPicker.vue";
  import CheckboxButton from "./components/CheckboxButton.vue";
  import ToDateCounter from "./components/ToDateCounter.vue";
  import SelectedFilters from "./components/SelectedFilters.vue";
  import CopyToClipboard from "./components/CopyToClipboard.vue";
  import networks from "@/data/networks.json";
  import images from "@/data/symbols.json";
  import isScreen from "@/core/screenHelper";
  import FeedsTable from "./components/FeedsTable.vue";

  export default {
    components: {
      Loader,
      CryptoPicker,
      NetworkPicker,
      CheckboxButton,
      ToDateCounter,
      SelectedFilters,
      CopyToClipboard,
      FeedsTable,
    },
    data() {
      return {
        isLoading: true,
        displayedTableItems: [],
        filters: null,
        selectedCryptos: [],
        selectedNetworks: [],
        perPage: 32,
        sortBy: "popularity",
        sortDesc: false,
        currentPage: 1,
        filteredItems: [],
        isUnselecting: false,
        isInitialLoad: true,
        selectedPage: 1,
        scrollPosition: 0,
        perPageOptions: [8, 16, 32, 64],
      };
    },
    async mounted() {
      await this.initSchema();
      await this.fetchRelayerValues();
      await this.initValues();
      prefetchImages(Object.values(networks).map((network) => network.iconUrl));
      this.isLoading = false;
      this.initializeFiltersFromRoute();
      this.$nextTick(() => {
        this.isInitialLoad = false;
      });
    },
    methods: {
      nearestCron,
      parseToCurrency,
      truncateString,
      heartbeatIsNumber,
      ...filterMethods,
      ...mapActions("feeds", [
        "initSchema",
        "initValues",
        "initSingleContract",
        "fetchRelayerValues",
      ]),
    },
    watch: {
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
        immediate: true,
      },
      currentPage(newPage) {
        this.selectedPage = newPage;
      },
      feeds() {
        this.filteredItems = [];
      },
      "$route.query": {
        handler() {
          this.$nextTick(() => {
            window.scrollTo(0, this.scrollPosition);
          });
        },
        deep: true,
      },
    },
    computed: {
      ...mapState("feeds", ["relayersDetails"]),
      ...mapState("layout", ["searchTerm"]),
      ...mapGetters("feeds", [
        "combinedFeedsWithDetailsArray",
        "allLoadersComplete",
      ]),
      prevIcon() {
        return isScreen("sm") || isScreen("xs") ? "Previous" : "Previous page";
      },
      nextIcon() {
        return isScreen("sm") || isScreen("xs") ? "Next" : "Next page";
      },
      totalPages() {
        return Math.ceil(this.totalRows / this.perPage);
      },
      availablePages() {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
      },
      tokensInNetworks() {
        return this.feeds.map((item) => ({
          token: item.token,
          network: item.network.id,
        }));
      },
      displayedSelectedNetworks() {
        return this.selectedNetworks.map((network) => ({
          key: network,
          name: findNetworkName(network),
          imageUrl: findNetworkImage(network),
        }));
      },
      displayedSelectedCryptos() {
        return this.selectedCryptos.map((crypto) => ({
          key: crypto,
          name: crypto,
          imageUrl: getTokenImage(crypto).imageName,
        }));
      },
      cryptoImages() {
        return images.filter((image) => {
          const networks =
            this.selectedNetworks.length > 0
              ? this.selectedNetworks
              : this.filteredNetworks;
          return networks?.some((networkId) => {
            return this.tokenInNetwork(image.token, networkId);
          });
        });
      },
      hasFilters() {
        return (
          this.filters &&
          (this.filters.selectedCryptos.length > 0 ||
            this.filters.selectedNetworks.length > 0)
        );
      },
      hasFiltersAndSearch() {
        return this.searchTerm || this.hasFilters;
      },
      totalRows() {
        return this.hasFiltersAndSearch
          ? this.filteredItems.length
          : this.feeds.length;
      },
      firstEntry() {
        if (this.totalRows == 0) return 0;
        return (this.currentPage - 1) * this.perPage + 1;
      },
      lastEntry() {
        return Math.min(this.currentPage * this.perPage, this.totalRows);
      },
      networksMap() {
        const map = Object.values(networks).map((network) => ({
          label: network.name,
          value: network.chainId,
        }));
        return map.filter((item) => this.filteredNetworks.includes(item.value));
      },
      paginatedFeeds() {
        const startIndex = (this.currentPage - 1) * this.perPage;
        const endIndex = startIndex + this.perPage;
        return this.feeds?.slice(startIndex, endIndex);
      },
      filteredNetworks() {
        {
          if (this.selectedCryptos.length === 0) {
            return Object.values(networks).map((item) => item.chainId);
          }

          const networkSet = new Set();
          this.displayedTableItems?.forEach((feed) => {
            if (
              this.selectedCryptos.some(
                (crypto) => feed.feed.indexOf(crypto) >= 0
              )
            ) {
              networkSet.add(feed.network.id);
            }
          });

          return Array.from(networkSet);
        }
      },
      filteredCurrencies() {
        {
          if (this.selectedNetworks.length === 0) {
            return images.map((image) => image.token);
          }

          const networkSet = new Set();
          this.displayedTableItems?.forEach((feed) => {
            if (
              this.selectedNetworks.some(
                (chainId) => feed.network.id === chainId
              )
            ) {
              networkSet.add(feed.crypto_token);
            }
          });
          return Array.from(networkSet);
        }
      },
      feeds() {
        return mapFeedsData(this.combinedFeedsWithDetailsArray);
      },
    },
  };
</script>
<style lang="scss" src="./Feeds.scss" />
