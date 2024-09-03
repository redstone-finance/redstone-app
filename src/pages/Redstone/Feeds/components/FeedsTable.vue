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
        <span>{{ item.feed }}</span>
      </template>
      <template #cell(answer)="{ item }">
        <strong style="font-weight: 500" v-if="item.apiValues?.value">{{
          parseToCurrency(item.apiValues.value * 100000000)
        }}</strong>
        <Loader v-else-if="item.loaders?.feedDataValue" class="feeds__loader" />
        <span v-else-if="item.answer">
          <strong style="font-weight: 500">
            {{ parseToCurrency(item.answer, item.token.split("/")[1]) }}
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
  } from "../utils/FeedsTableDataLayer.js";
  import Loader from "../../../../components/Loader/Loader";
  import CopyToClipboard from "./CopyToClipboard.vue";
  import ToDateCounter from "./ToDateCounter.vue";
  import truncateString from "@/core/truncate";

  export default {
    components: {
      Loader,
      CopyToClipboard,
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
          { key: "deviation", label: "Deviation threshold ", sortable: false },
          { key: "heartbeat", label: "Heartbeat", sortable: false },
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
      truncateString,
      nearestCron,
      parseToCurrency,
      heartbeatIsNumber,
      handleSort(ctx) {
        this.$emit("update:sort", ctx);
      },
      onChange(value){
        this.$emit("change", value);
      },
      onFiltered(filteredItems) {
        this.$emit("update:filteredItems", filteredItems);
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
    },
    computed: {
      ...mapState("feeds", ["relayersDetails"]),
      ...mapGetters("feeds", [
        "allLoadersComplete",
      ]),
    },
  };
</script>
