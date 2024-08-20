<template>
  <div class="feeds">
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
                >Selected tokens:
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
            <SelectedFilters
              @remove="removeNetwork"
              class="mt-2"
              :filters="displayedSelectedNetworks"
            />
          </div>
          <div
            class="separator"
            v-if="selectedCryptos.length > 0 && selectedNetworks.length > 0"
          ></div>
          <div v-if="selectedCryptos.length > 0" class="second-filters">
            <div class="selected-items">Selected cryptos:</div>
            <SelectedFilters
              @remove="removeCrypto"
              class="mt-2"
              :filters="displayedSelectedCryptos"
            />
          </div>
        </div>
        <div v-if="hasFilters" class="clear-filters" @click="resetFilters">
          Clear all
        </div>
      </div>
    </div>
    <b-table
      v-if="displayedTableItems"
      id="feeds-table"
      v-model="displayedTableItems"
      key="table"
      stacked="md"
      ref="selectableTable"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
      @filtered="onFiltered"
      :filter="filters"
      sort-icon-left
      sticky-header="500px"
      hover
      :items="feeds"
      :per-page="perPage"
      @sort-changed="handleSort"
      :current-page="currentPage"
      :filter-function="customFilter"
      :fields="fields"
      class="feeds__table"
    >
      <template #head(deviation)="data">
        {{ data.label }}
        <i
          class="fa fa-info-circle"
          v-b-tooltip.hover
          title="The system triggers an update when a node detects that the off-chain data has diverged from the on-chain value beyond a predetermined threshold difference."
        ></i>
      </template>
      <template #head(timestamp)="data">
        {{ data.label }}
        <i
          class="fa fa-info-circle"
          v-b-tooltip.hover
          title="Time since last on-chain price update. Indicates data freshness and helps track update frequency."
        ></i>
      </template>
      <template #head(heartbeat)="data">
        {{ data.label }}
        <i
          class="fa fa-info-circle"
          v-b-tooltip.hover
          title="An automatic timing system forces an on-chain price update when it counts down to 00:00. This acts as a safety net, ensuring updates happen even if price changes stay within the allowed range during the entire heartbeat period."
        ></i>
      </template>
      <template #cell(network)="{ item }">
        <img
          class="feeds__token-image"
          :src="item.network.image"
          :alt="item.network.name"
        />
        {{ item.network.name }}
      </template>
      <template #cell(contract_address)="{ item }">
        <div
          v-if="
            item.feed_address &&
            item.explorer &&
            item.feed_address != '__NO_FEED__'
          "
        >
          <a
            class="feeds__contract-address"
            :title="`Open address in ${item.explorer.name} explorer`"
            target="_blank"
            :href="`${item.explorer.explorerUrl}/address/${item.feed_address}`"
          >
            {{ truncateString(item.feed_address) }}
          </a>
          <CopyToClipboard
            copy-text="Copy feed address"
            :value="item.feed_address"
          />
        </div>
        <div v-else-if="item.contract_address && item.explorer">
          <a
            class="feeds__contract-address"
            :title="`Open address in ${item.explorer.name} explorer`"
            target="_blank"
            :href="`${item.explorer.explorerUrl}/address/${item.contract_address}`"
          >
            {{ truncateString(item.contract_address) }}
          </a>
          <CopyToClipboard
            copy-text="Copy adapter address"
            :value="item.contract_address"
          />
        </div>
      </template>
      <template #cell(feed)="{ item }">
        <img
          :src="item.token_image?.imageName"
          class="feeds__token-image"
          :alt="item.feed"
        />
        <!-- <router-link class="feeds__feed-link"
                    :to="{ name: 'SingleFeed', params: { network: createNetworkUrlParam(item.network.name), token: item.token.toLowerCase(), meta: item } }">
                </router-link> -->
        <span>{{ item.feed }}</span>
      </template>
      <template #cell(timestamp)="{ item }">
        <Loader v-if="item.loaders?.blockTimestamp" class="feeds__loader" />
        <span v-else-if="item.timestamp.raw" class="feeds__timestamp">
          <span class="feeds__timestamp-date">
            {{ item.timestamp.date }}
          </span>
          {{ item.timestamp.parsed }} ago
        </span>
        <span v-else class="feeds__no-data">no-data</span>
      </template>
      <template #cell(heartbeat)="{ item }">
        <Loader v-if="item.loaders?.blockTimestamp" class="feeds__loader" />
        <span v-else class="feeds__timestamp">
          <span v-if="heartbeatIsNumber(item.heartbeat)">
            <to-date-counter :duration="item.heartbeat" />
          </span>
          <div v-else>
            <span style="cursor: pointer" :id="`cron-trigger-${item.layer_id}`">
              <to-date-counter
                class="d-inline"
                :duration="nearestCron(item.heartbeat)"
              />
            </span>
          </div>
        </span>
      </template>
    </b-table>
    <b-pagination
      prev-text="Previous page"
      next-text="Next page"
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
            >No entries found -
            <span
              style="pointer-events: all"
              v-if="hasFilters"
              class="clear-filters"
              @click="resetFilters"
            >
              Clear filters
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
  import { mapActions, mapGetters } from "vuex";
  import {
    hexToDate,
    parseUnixTime,
    getTimeUntilNextHeartbeat,
    timeUntilDate,
    findNearestCronDate,
  } from "@/core/timeHelpers";
  import copyToClipboardHelper from "@/core/copyToClipboard";
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
  import images from "@/data/logosDefinitions.json";

  export default {
    components: {
      Loader,
      CryptoPicker,
      NetworkPicker,
      CheckboxButton,
      ToDateCounter,
      SelectedFilters,
      CopyToClipboard,
    },
    data() {
      return {
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
        mostUsedCryptos: [
          { name: "BitCoin", token: "BTC", image: "btc.webp" },
          { name: "Ethereum", token: "ETH", image: "eth.webp" },
        ],
        fields: [
          {
            key: "feed",
            label: "Feed",
            sortable: true,
            formatter: (value, key, item) => item.feed,
          },
          {
            key: "popularity",
            label: "Popularity",
            sortable: true,
            class: "d-none",
          },
          {
            key: "network",
            label: "Network",
            sortable: true,
            sortByFormatted: true,
            formatter: (value, key, item) => item.network.name,
          },
          { key: "contract_address", label: "Addresses", sortable: false },
          { key: "heartbeat", label: "Heartbeat", sortable: false },
          { key: "deviation", label: "Deviation threshold ", sortable: false },
        ],
      };
    },
    async mounted() {
      prefetchImages(Object.values(networks).map((network) => network.iconUrl));
      await this.init();
      this.initializeFiltersFromRoute();
      this.$nextTick(() => {
        this.isInitialLoad = false;
      });
    },
    methods: {
      copyToClipboardHelper,
      truncateString,
      onPerPageChange() {
        this.currentPage = 1;
        this.$refs.selectableTable.refresh();
        this.updateRouteParams();
      },
      onSelectedPageChange() {
        this.currentPage = this.selectedPage;
        this.updateRouteParams();
      },
      initializeFiltersFromRoute() {
        const { cryptos, networks, page, sortBy, sortDesc, perPage } =
          this.$route.query;
        this.selectedCryptos = cryptos ? cryptos.split(",") : [];
        this.selectedNetworks = networks ? networks.split(",").map(Number) : [];
        this.currentPage = page ? parseInt(page) : 1;
        this.sortBy = sortBy || "popularity";
        this.sortDesc = sortDesc === "true";
        this.perPage = perPage ? parseInt(perPage) : 32;
        this.applyFilters();
      },
      updateRouteParams() {
        if (this.isInitialLoad) return;
        this.scrollPosition =
          window.pageYOffset || document.documentElement.scrollTop;
        const query = { ...this.$route.query };
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
        query.page = this.currentPage.toString();
        if (this.sortBy) {
          query.sortBy = this.sortBy;
          query.sortDesc = this.sortDesc.toString();
        } else {
          delete query.sortBy;
          delete query.sortDesc;
        }
        query.perPage = this.perPage.toString();
        query.page = this.currentPage.toString();

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
        };
        this.$nextTick(() => {
          this.$refs.selectableTable.refresh();
        });
      },
      resetFilters() {
        this.selectedCryptos = [];
        this.selectedNetworks = [];
        this.filters = null;
        this.currentFilter = null;
        this.currentPage = 1;
        this.sortBy = "popularity";
        this.sortDesc = false;
        this.$refs.selectableTable.refresh();
        this.updateRouteParams();
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
        const { selectedCryptos, selectedNetworks } = filters;
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
      unselectInvalidItems() {
        if (this.isUnselecting) return;
        this.isUnselecting = true;
        const newSelectedCryptos = this.selectedCryptos.filter((crypto) =>
          this.filteredCurrencies.some((currency) =>
            currency.toLowerCase().includes(crypto.toLowerCase())
          )
        );
        const newSelectedNetworks = this.selectedNetworks.filter((network) =>
          this.filteredNetworks.includes(network)
        );
        if (!_.isEqual(newSelectedCryptos, this.selectedCryptos)) {
          this.selectedCryptos = newSelectedCryptos;
        }
        if (!_.isEqual(newSelectedNetworks, this.selectedNetworks)) {
          this.selectedNetworks = newSelectedNetworks;
        }
        this.isUnselecting = false;
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
      stripAdditionalFeedInfo(string) {
        const hasUnderscore = string.indexOf("_") >= 0;
        const hasDash = string.indexOf("-") >= 0;
        if (hasUnderscore) {
          return string.split("_")[0];
        } else if (hasDash) {
          return string.split("-")[0];
        }
        return string;
      },
      findNetworkName(networkId) {
        return Object.values(networks).find(
          (network) => network.chainId === networkId
        ).name;
      },
      findNetworkImage(networkId) {
        return Object.values(networks).find(
          (network) => network.chainId === networkId
        ).iconUrl;
      },
      findNetwork(networkId) {
        return Object.values(networks).find(
          (network) => network.chainId === networkId
        );
      },
      findExplorer(networkId) {
        const hasExplorer = Object.values(networks).some(
          (network) => network.chainId === networkId
        );
        if (!hasExplorer)
          console.warn("Missing explorer for chain:", networkId);
        return Object.values(networks).find(
          (network) => network.chainId === networkId
        ).explorerUrl;
      },
      nearestCron(cronString) {
        if (cronString == null) {
          console.warn("Cron string is undefined or null");
          return 0;
        }

        try {
          const parsedCron = JSON.parse(cronString);
          const nearestDate = findNearestCronDate(parsedCron);
          const timeUntil = timeUntilDate(nearestDate);
          return timeUntil;
        } catch (error) {
          console.error("Error parsing cron string:", error);
          return "Invalid cron"; // or some error indicator
        }
      },
      getFirstPart(string) {
        const noSlash = string.split("/")[0];
        const noUnder = noSlash.split("_")[0];
        const noDash = noUnder.split("-")[0];
        return noDash;
      },
      hasSlash(string) {
        return string.indexOf("/") >= 0;
      },
      transformHexString(str) {
        if (str == null) return "no data";
        if (str?.length <= 10) return str;
        return `${str?.slice(0, 7)} . . . ${str?.slice(-4)}`;
      },
      getTokenImage(token) {
        const idealMatchImg = images.find((image) => token === image.token);
        const secondMatch = images.find(
          (image) => token.indexOf(image.token) >= 0
        );
        return (
          idealMatchImg ||
          secondMatch || {
            name: "placeholder",
            imageName: "placeholder.png",
            token: "placeholder",
          }
        );
      },
      createNetworkUrlParam(networkName) {
        return networkName.toLowerCase().replace(" ", "-");
      },
      heartbeatIsNumber(heartbeat) {
        return typeof heartbeat === "number";
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
      tokenInNetwork(token, networkId) {
        return this.tokensInNetworks.some(
          (item) => item.token === token && item.network === networkId
        );
      },
      resolveDeviationPercentage(item) {
        const triggerOverride = item.overrides.filter(
          (override) => override.value !== undefined
        );
        const deviationPercentage =
          triggerOverride.length > 0
            ? triggerOverride[0]?.value ||
              triggerOverride[0].value.deviationPercentage
            : item.triggers.deviationPercentage;
        return deviationPercentage ? deviationPercentage + "%" : "n/a";
      },
      resolveTimeSinceLastUpdateInMilliseconds(item) {
        const triggerOverride = item.overrides.filter(
          (override) => override.value !== undefined
        );
        const timeSinceLastUpdateInMilliseconds =
          triggerOverride.length > 0 &&
          triggerOverride[0]?.type === "full" &&
          triggerOverride[0]?.value?.timeSinceLastUpdateInMilliseconds !==
            undefined
            ? triggerOverride[0].value.timeSinceLastUpdateInMilliseconds
            : item.triggers.timeSinceLastUpdateInMilliseconds;

        return timeSinceLastUpdateInMilliseconds;
      },
      ...mapActions("feeds", ["init", "initSingleContract"]),
    },
    watch: {
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
      totalRows() {
        return this.displayedSelectedNetworks.length > 0 ||
          this.displayedSelectedCryptos.length > 0
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
      ...mapGetters("feeds", ["combinedFeedsWithDetailsArray"]),
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
      networkOrder() {
        return Object.values(networks);
      },
      cryptoOrder() {
        return Object.values(images);
      },
      feeds() {
        if (this.combinedFeedsWithDetailsArray.length === 0) return [];
        return this.combinedFeedsWithDetailsArray.map((item) => {
          return {
            feed: this.hasSlash(item.feedId)
              ? this.stripAdditionalFeedInfo(item.feedId)
              : this.stripAdditionalFeedInfo(item.feedId) + "/USD",
            network: {
              id: item.networkId,
              name: this.findNetworkName(item.networkId),
              image: this.findNetworkImage(item.networkId),
            },
            contract_address: item.contractAddress,
            timestamp: {
              parsed: parseUnixTime(item.timestamp),
              raw: item.timestamp,
              date: hexToDate(item.timestamp),
            },
            layer_id: item.feedId,
            heartbeat:
              getTimeUntilNextHeartbeat(
                item?.timestamp,
                this.resolveTimeSinceLastUpdateInMilliseconds(item)
              ) || JSON.stringify(item.triggers.cron),
            deviation: this.resolveDeviationPercentage(item),
            cron: item.triggers.cron,
            token: item.feedId,
            relayerId: item.layerId,
            feed_address: item.feedAddress,
            crypto_token: this.getFirstPart(item.feedId),
            token_image: this.getTokenImage(this.getFirstPart(item.feedId)),
            loaders: item.loaders,
            popularity: `${this.networkOrder.findIndex((network) => item.networkId === network.chainId)}_${this.cryptoOrder.findIndex((crypto) => this.getFirstPart(item.feedId) === crypto.token)}`,
            explorer: {
              name: this.findNetworkName(item.networkId),
              explorerUrl: this.findExplorer(item.networkId),
            },
          };
        });
      },
    },
  };
</script>
<style lang="scss" src="./Feeds.scss" />
