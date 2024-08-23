<template>
  <div>
    <div class="feed-details">
      <dl class="stats-grid">
        <div class="stat-item">
          <dt class="stat-title">Answer</dt>
          <dd class="stat-value">
            $ <strong>{{ chartData[chartData.length - 1].value }}</strong>
          </dd>
        </div>
        <div class="stat-item">
          <dt class="stat-title">Network</dt>
          <dd class="stat-value">
            <img
              class="feeds__token-image small"
              v-if="feedData"
              :src="feedData.network.image"
              :alt="feedData.network.name"
            />
            <span class="applicant-info__text">{{
              feedData.network?.name
            }}</span>
          </dd>
        </div>
        <div class="stat-item">
          <dt class="stat-title">Symbol</dt>
          <dd class="stat-value">{{ feedData.feed }}</dd>
        </div>
        <div class="stat-item">
          <dt class="stat-title">Deviation threshold</dt>
          <dd class="stat-value">{{ feedData.deviation }}</dd>
        </div>
        <div class="stat-item">
          <dt class="stat-title">Heartbeat</dt>
          <dd class="stat-value">
            <HeartbeatTimer
              v-if="feedData.heartbeat"
              :isLoading="feedData.loaders.blockTimestamp"
              :heartbeat="feedData.heartbeat"
              :layerId="feedData.layer_id"
            />
          </dd>
        </div>
      </dl>
      <div class="feed-chart">
        <layer-chart
          v-if="chartData"
          :data="chartData"
          :range="currentRange"
          @range-change="handleRangeChange"
        />
      </div>
    </div>
    <div class="applicant-info__item">
      <dt class="applicant-info__label">Addresses</dt>
      <dd class="applicant-info__value">
        <contract-address
          v-if="feedData"
          :item="feedData"
          :separate-labels="true"
        />
      </dd>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import LayerChart from "./components/LayerChart";
import ContractAddress from "./components/ContractAddress.vue";
import { transformFeed } from "./feedUtils";
import TimestampWithLoader from "./components/TimestampWithLoader.vue";
import Loader from './../../../components/Loader/Loader.vue'
import HeartbeatTimer from "./components/HeartbeatTimer.vue";
import axios from "axios";

export default {
  components: {
    LayerChart,
    ContractAddress,
    TimestampWithLoader,
    HeartbeatTimer,
    Loader,
  },
  data() {
    return {
      isLoading: false,
      chartData: null,
      currentRange: "1w",
    };
  },
  async mounted() {
    await this.fetchRelayerSchema();
    await this.fetchChartData();
  },
  methods: {
    hexToPrice(hex) {
      let decimalValue = parseInt(hex, 16);
      let price = decimalValue / 100000000;
      return price;
    },
    ...mapActions("feeds", ["initSingle", "fetchRelayerSchema"]),
    async fetchChartData() {
      this.isLoading = true;
      try {
        const { data } = await axios.get(this.chartEndpoint);
        this.chartData = data.onChainUpdates;
      } catch (error) {
      console.error("Error fetching chart data:", error);
      } finally {
        this.isLoading = false;
      }
    },
    handleRangeChange(range) {
      this.currentRange = range;
      this.fetchChartData();
    },
  },
  watch: {
    relayerId() {
      if (this.relayerId) {
        console.log(this.relayerId)
        if (this.getSmartContractByLayerId(this.relayerId) == null) {
          this.initSingle(this.relayerId);
        }
      }
    },
  },
  computed: {
    network() {
      return this.$route.params.network;
    },
    token() {
      return this.$route.params.token;
    },
    feedData() {
      return transformFeed(
        this.combinedFeedsWithDetailsArray.find(
          (feed) =>
            feed.routeNetwork === this.network &&
            feed.routeToken === this.token
        )
      );
    },
    relayerId() {
      return this.feedData.relayerId
    },
    chartEndpoint() {
      const baseUrl = "https://api.redstone.finance/on-chain-updates";
      const dataFeedId = this.feedData.token || "ETH";
      const adapterName = this.feedData.relayerId;
      const daysRange =
        this.currentRange === "1d" ? 1 : this.currentRange === "1w" ? 7 : 30;
      return `${baseUrl}?dataFeedId=${dataFeedId}&adapterName=${adapterName}&daysRange=${daysRange}`;
    },
    ...mapState("feeds", ["relayersDetails", "relayersSchema"]),
    ...mapGetters("feeds", [
      "combinedFeedsWithDetailsArray",
      "getSmartContractByLayerId",
    ]),
    layer() {
      return this.relayersSchema[this.layerId];
    },
  },
};
</script>
<style lang="scss" scoped src="./Feed.scss" />