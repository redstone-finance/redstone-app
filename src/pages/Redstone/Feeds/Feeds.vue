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
      :isLoading="isLoading"
      :displayedTableItems="displayedTableItems"
      :filters="filters"
      :perPage="perPage"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
      :currentPage="currentPage"
      @update:sortBy="sortBy = $event"
      @update:sortDesc="sortDesc = $event"
      @update:filteredItems="filteredItems = $event"
    />
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
    processTokenData,
    parseToCurrency,
    heartbeatIsNumber,
    nearestCron,
  } from "./utils/FeedsTableDataLayer";
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
        selectedChain: null,
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
      prefetchImages(Object.values(networks).map((network) => network.iconUrl));
      await this.initValues();
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
      onPerPageChange() {
        this.currentPage = 1;
        this.$refs.selectableTable?.refresh();
        this.updateRouteParams();
      },
      onSelectedPageChange() {
        this.currentPage = this.selectedPage;
        this.updateRouteParams();
      },
      initializeFiltersFromRoute() {
        const { cryptos, networks, page, sortBy, sortDesc, perPage, search } =
          this.$route.query;
        this.selectedCryptos = search ? [] : cryptos ? cryptos.split(",") : [];
        this.selectedNetworks = search
          ? []
          : networks
            ? networks.split(",").map(Number)
            : [];
        this.currentPage = page ? parseInt(page) : 1;
        this.sortBy = sortBy || "popularity";
        this.sortDesc = sortDesc === "true";
        this.perPage = perPage ? parseInt(perPage) : 32;
        // Note: We don't set searchTerm here as it's managed by the Vuex store
        this.applyFilters();
      },
      updateRouteParams() {
        if (this.isInitialLoad) return;
        this.scrollPosition =
          window.pageYOffset || document.documentElement.scrollTop;
        const query = { ...this.$route.query };

        if (this.searchTerm) {
          query.search = this.searchTerm;
          delete query.cryptos;
          delete query.networks;
        } else {
          delete query.search;
          if (this.selectedCryptos.length > 0) {
            query.cryptos = this.selectedCryptos.join(",");
          } else {
            delete query.cryptos;
          }
          if (this.selectedNetworks.length > 0) {
            query.networks = this.selectedNetworks.join(",");
          } else {
            delete query.networks;
          }
        }

        query.page = this.currentPage.toString();
        query.sortBy = this.sortBy;
        query.sortDesc = this.sortDesc.toString();
        query.perPage = this.perPage.toString();

        this.$router
          .replace({ query })
          .then(() => {
            this.$nextTick(() => {
              window.scrollTo(0, this.scrollPosition);
            });
          })
          .catch((err) => {
            if (err.name !== "NavigationDuplicated") {
              throw err;
            }
          });
      },
      handleFilter(filterType, value) {
        if (filterType === "cryptos") {
          this.selectedCryptos = value;
        } else if (filterType === "networks") {
          this.selectedNetworks = value;
        }
        if (!this.isInitialLoad) {
          this.currentPage = 1;
        }
        this.applyFilters();
        this.updateRouteParams();
      },
      handleSort(ctx) {
        this.sortBy = ctx.sortBy;
        this.sortDesc = ctx.sortDesc;
        this.updateRouteParams();
      },
      applyFilters() {
        this.filters = {
          selectedCryptos: this.selectedCryptos,
          selectedNetworks: this.selectedNetworks,
          searchTerm: this.searchTerm,
        };
        this.$nextTick(() => {
          this.$refs.selectableTable?.refresh();
        });
        if (this.hasFilters) {
          this.$store.dispatch("layout/updateFeedsFilterStatus", true);
        }
      },
      resetFilters(clearSearch = true) {
        this.selectedCryptos = [];
        this.selectedNetworks = [];
        if (clearSearch) {
          this.$store.dispatch("layout/updateSearchTerm", "");
        }
        this.filters = null;
        this.currentFilter = null;
        this.currentPage = 1;
        this.sortBy = "popularity";
        this.sortDesc = false;
        this.$refs.selectableTable?.refresh();
        this.updateRouteParams();
        this.$store.dispatch("layout/updateFeedsFilterStatus", false);
      },

      onPageChange(page) {
        this.currentPage = page;
        this.updateRouteParams();
      },
      onFiltered(filteredItems) {
        this.filteredItems = filteredItems;
      },
      customFilter(row, filters) {
        if (!filters) return true;
        const { selectedCryptos, selectedNetworks, searchTerm } = filters;

        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            row.feed.toLowerCase().includes(searchLower) ||
            row.network.name.toLowerCase().includes(searchLower) ||
            (row.contract_address &&
              row.contract_address.toLowerCase().includes(searchLower))
          );
        }

        const cryptoMatch =
          selectedCryptos.length === 0 ||
          selectedCryptos.some((crypto) => {
            const feedParts = row.feed.split("/");
            return feedParts[0].toLowerCase() === crypto.toLowerCase();
          });

        const networkMatch =
          selectedNetworks.length === 0 ||
          selectedNetworks.includes(row.network.id);

        return cryptoMatch && networkMatch;
      },
      handleSingleFilterCheckbox(data) {
        if (!data.isChecked) {
          this.selectedCryptos.push(data.value);
        } else {
          this.selectedCryptos = this.selectedCryptos.filter(
            (token) => token != data.value
          );
        }
        this.handleFilter("crypto", this.selectedCryptos);
      },
      tokenInNetwork(token, networkId) {
        return processTokenData(this.tokensInNetworks).some(
          (item) => item.token === token && item.network === networkId
        );
      },
      removeCrypto(item) {
        this.selectedCryptos = this.selectedCryptos.filter(
          (crypto) => crypto != item
        );
        this.handleFilter("cryptos", this.selectedCryptos);
        this.updateRouteParams();
      },
      removeNetwork(item) {
        this.selectedNetworks = this.selectedNetworks.filter(
          (network) => network != item
        );
        this.handleFilter("networks", this.selectedNetworks);
        this.updateRouteParams();
      },
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
      prevIcon() {
        return isScreen("sm") || isScreen("xs") ? 'Previous' : "Previous page";
      },
      nextIcon() {
        return isScreen("sm") || isScreen("xs") ? 'Next' : "Next page";
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
          name: this.findNetworkName(network),
          imageUrl: this.findNetworkImage(network),
        }));
      },
      displayedSelectedCryptos() {
        return this.selectedCryptos.map((crypto) => ({
          key: crypto,
          name: crypto,
          imageUrl: this.getTokenImage(crypto).imageName,
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
      ...mapState("feeds", ["relayersDetails"]),
      ...mapState("layout", ["searchTerm"]),
      ...mapGetters("feeds", [
        "combinedFeedsWithDetailsArray",
        "allLoadersComplete",
      ]),
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
