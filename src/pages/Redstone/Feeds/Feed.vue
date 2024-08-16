<template>
  <div class="feed-details">
    <div class="feed-details__infos">
      <div class="applicant-info" v-if="feedData">
        <div class="applicant-info__header">
          <h3 class="applicant-info__title">{{ feedData.feed }}</h3>
        </div>
        <div class="applicant-info__content">
          <dl class="applicant-info__list">
            <div class="applicant-info__item">
              <dt class="applicant-info__label">Answer</dt>
              <dd class="applicant-info__value">
                <span class="applicant-info__text">0.0001044191</span>
              </dd>
            </div>
            <div class="applicant-info__item">
              <dt class="applicant-info__label">Network</dt>
              <dd class="applicant-info__value">
                <img
                  class="feeds__token-image small"
                  v-if="feedData"
                  :src="feedData.network.image"
                  :alt="feedData.network.name"
                />
                <span class="applicant-info__text">{{
                  feedData.network.name
                }}</span>
              </dd>
            </div>
            <div class="applicant-info__item">
              <dt class="applicant-info__label">Last update</dt>
              <dd class="applicant-info__value">
                <span class="applicant-info__text">
                  <TimestampWithLoader
                    :isLoading="feedData.loaders.blockTimestamp"
                    :rawTimestamp="feedData.timestamp.raw"
                    :formattedDate="feedData.timestamp.date"
                    :parsedTimestamp="feedData.timestamp.parsed"
                  />
                </span>
              </dd>
            </div>
            <div class="applicant-info__item">
              <dt class="applicant-info__label">Trigger parameters</dt>
              <dd class="applicant-info__column-value">
                <div class="applicant-info__item">
                  <dt class="applicant-info__label">Deviation threshold</dt>
                  <dd class="applicant-info__value">
                    <span class="applicant-info__text">{{
                      feedData.deviation
                    }}</span>
                  </dd>
                </div>
                <div class="applicant-info__item">
                  <dt class="applicant-info__label">Heartbeat</dt>
                  <dd class="applicant-info__value">
                    <HeartbeatTimer
                      v-if="feedData"
                      :isLoading="feedData.loaders.blockTimestamp"
                      :heartbeat="feedData.heartbeat"
                      :layerId="feedData.layer_id"
                    />
                  </dd>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
    <div class="feed-chart">
      <div class="range-buttons">
        <button
          @click="setRange('1d')"
          :class="{ active: currentRange === '1d' }"
        >
          1 Day
        </button>
        <button
          @click="setRange('1w')"
          :class="{ active: currentRange === '1w' }"
        >
          1 Week
        </button>
        <button
          @click="setRange('1m')"
          :class="{ active: currentRange === '1m' }"
        >
          1 Month
        </button>
      </div>
      <layer-chart v-if="chartData" :data="chartData" :range="currentRange" />
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
  import HeartbeatTimer from "./components/HeartbeatTimer.vue";
  import axios from "axios";

  export default {
    components: {
      LayerChart,
      ContractAddress,
      TimestampWithLoader,
      HeartbeatTimer,
    },
    data() {
      return {
        isLoading: false,
        chartData: null,
        currentRange: "1m",
      };
    },

    async mounted() {
      await this.fetchRelayerSchema();
      await this.fetchChartData();
    },
    methods: {
      ...mapActions("feeds", ["initSingleContract", "fetchRelayerSchema"]),
      async fetchChartData() {
        this.isLoading = true;
        try {
          const { data } = await axios.get(this.chartEndpoint);
          console.log({ data });
          this.chartData = data.onChainUpdates
        } catch (error) {
          console.error("Error fetching chart data:", error);
        } finally {
          this.isLoading = false;
        }
      },
      setRange(range) {
        this.currentRange = range;
        this.fetchChartData();
      },
    },
    watch: {
      feedData() {
        if (this.feedData.relayerId) {
          if (this.getSmartContractByLayerId(this.feedData.relayerId) == null) {
            this.initSingleContract(this.feedData.relayerId);
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
      chartEndpoint() {
        const baseUrl = "https://api.redstone.finance/on-chain-updates";
        const dataFeedId = this.feedData.token || "ETH";
        const adapterName = this.feedData.relayerId
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
