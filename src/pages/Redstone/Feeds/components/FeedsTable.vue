<template>
  <div>
    <b-table
      v-if="feeds && !isLoading"
      @input="onChange"
      id="feeds-table"
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
          title="Deviation threshold - the system triggers an update when a node detects that the off-chain data has diverged from the on-chain value beyond a predetermined threshold difference."
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
          :src="item.token_image?.logoURI"
          class="feeds__token-image"
          :alt="item.feed"
        />
        <RouterLink
          :to="{
            name: 'SingleFeed',
            params: {
              network: toUrlParam(item.network.name),
              token: toUrlParam(item.token),
            },
          }"
          >{{ clearFeedName(item.feed) }}</RouterLink
        >
        <img v-if="item.isFundamentalFeed" style="width: 25px; height: 25px; margin-left: 5px; background-color: #fff; border-radius: 50%; padding: 2px; opacity: 0.7;" src="../../../../assets/icons/fundamental.svg">
        <img v-if="item.isTwap30" style="width: 25px; height: 25px; margin-left: 5px; background-color: #fff; border-radius: 50%; padding: 2px; opacity: 0.7;" src="../../../../assets/icons/twap-30.svg">
        <img v-if="item.isTwap60" style="width: 25px; height: 25px; margin-left: 5px; background-color: #fff; border-radius: 50%; padding: 2px; opacity: 0.7;" src="../../../../assets/icons/twap-60.svg">
      </template>
      <template #cell(answer)="{ item }">
        <strong style="font-weight: 500" v-if="item.apiValues?.value">{{
          item.apiAnswer
        }}</strong>
        <Loader v-else-if="item.loaders?.feedDataValue" class="feeds__loader" />
        <span v-else-if="item.answer">
          <strong style="font-weight: 500">
            {{ item.contractAnswer }}
          </strong>
        </span>
        <span v-else class="feeds__no-data">no-data</span>
      </template>
      <template #cell(heartbeat)="{ item }">
        <Loader
          v-if="
            item.loaders?.blockTimestamp && item?.apiValues?.timestamp == null
          "
          class="feeds__loader"
        />
        <span v-else class="feeds__timestamp">
          <span v-if="heartbeatIsNumber(item.heartbeat)">
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: center;
              "
            >
              <span> {{ item.heartbeatTitle }}</span>
              <to-date-counter
                class="ml-2"
                :interval="item.heartbeatInterval"
                :duration="item.heartbeat"
              />
            </div>
          </span>
          <div v-else>
            <span class="cron-trigger"  :id="`cron-trigger-${item.layer_id}`">
              <span>Cron: {{ item.heartbeatTitle }}</span>
              <cron-counter :crons="item.heartbeat" class="mt-2" />
            </span>
          </div>
        </span>
      </template>
    </b-table>
    <vue-loaders-ball-beat
      v-else
      class="table-loader"
      color="var(--redstone-red-color)"
      scale="0.5"
    ></vue-loaders-ball-beat>
  </div>
</template>

<script>
  import { mapState, mapGetters } from "vuex";
  import {
    parseToCurrency,
    heartbeatIsNumber,
    nearestCron,
    toUrlParam,
    clearFeedName
  } from "../utils/FeedsTableDataLayer.js";
  import Loader from "../../../../components/Loader/Loader";
  import CopyToClipboard from "./CopyToClipboard.vue";
  import ToDateCounter from "./ToDateCounter.vue";
  import CronCounter from "./CronCounter.vue";
  import truncateString from "@/core/truncate";
  export default {
    components: {
      Loader,
      CopyToClipboard,
      CronCounter,
      ToDateCounter,
    },
    data() {
      return {
        displayedItems: [],
        fields: [
          {
            key: "feed",
            label: "Feed",
            sortable: true,
            formatter: (value, key, item) => item.feed,
            thStyle: { width: "300px" },
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
          { key: "answer", label: "Answer", sortable: false },
          { key: "deviation", label: "Deviation", sortable: false, thStyle: { width: "120px" } },
          { key: "heartbeat", label: "Heartbeat", sortable: false, thStyle: { width: "180px" }, },
        ],
      };
    },
    props: {
      isLoading: Boolean,
      feeds: Array,
      filters: Object,
      perPage: Number,
      sortBy: String,
      sortDesc: Boolean,
      currentPage: Number,
    },
    methods: {
      toUrlParam,
      truncateString,
      nearestCron,
      parseToCurrency,
      heartbeatIsNumber,
      clearFeedName,
      handleSort(ctx) {
        this.$emit("update:sort", ctx);
      },
      onChange(value) {
        this.$emit("change", value);
      },
      onFiltered(filteredItems) {
        this.$emit("update:filteredItems", filteredItems);
      },
      customFilter(row, filters) {
        if (!filters) return true;
        const { selectedCryptos, selectedNetworks, searchTerm } = filters;
        let matchesSearch = true;
        if (searchTerm && searchTerm.trim() !== "") {
          const searchLower = searchTerm.toLowerCase();
          const tokenLower = row.feed ? row.feed.toLowerCase() : "";

          matchesSearch =
            row.feed.toLowerCase().includes(searchLower) ||
            row.network.name.toLowerCase().includes(searchLower) ||
            (row.contract_address &&
              row.contract_address.toLowerCase().includes(searchLower)) ||
            (row.feed_address &&
              row.feed_address.toLowerCase().includes(searchLower)) ||
            (row.feed && tokenLower.includes(searchLower));
          return matchesSearch;
        }

        const cryptoMatch =
          selectedCryptos?.length === 0 || selectedCryptos?.includes(row.token);
        const networkMatch =
          selectedNetworks?.length === 0 ||
          selectedNetworks?.includes(row.network.id);
        return cryptoMatch && networkMatch;
      },
    },
    computed: {
      ...mapState("feeds", ["relayersDetails"]),
      ...mapGetters("feeds", ["allLoadersComplete"]),
    },
  };
</script>
