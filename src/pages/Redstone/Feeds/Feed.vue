<template>
  <div>
    <div class="feed-details">
      <dl class="stats-grid">
        <div class="stat-item">
          <dt class="stat-title">Answer</dt>
          <dd class="stat-value" v-if="currentChartData">
            $
            <strong>{{
              currentChartData[currentChartData.length - 1].value
            }}</strong>
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
            <i class="fa fa-heartbeat"></i>
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
          v-if="currentChartData && !isLoading"
          :data="currentChartData"
          :range="currentRange"
          @range-change="handleRangeChange"
          :duplicated-ranges="duplicateRanges.flat()"
        />
        <div class="loading-container" v-else>
          <vue-loaders-ball-beat
            color="var(--redstone-red-color)"
            scale="1"
          ></vue-loaders-ball-beat>
        </div>
      </div>
    </div>
    <div class="additional-details-card__wrapper">
      <div class="additional-details-card__item">
        <h3>Addresses</h3>
        <contract-address
          v-if="feedData"
          :item="feedData"
          :separate-labels="false"
        />
      </div>
      <div class="additional-details-card__item">
        <h3>Product information</h3>
        <div class="additional-details-cart__value">
          Relayer ID: <strong>{{ relayerId }}</strong>
        </div>
        <div class="additional-details-cart__value">
          Explorer:
          <a :href="feedData.explorer.explorerUrl" target="_blank">{{
            feedData.explorer.name
          }}</a>
        </div>
      </div>
    </div>

    <!-- <div class="additional-details-card__wrapper">
      <div
        class="additional-details-card__item additional-details-card__item--full"
      >
        <h3>Feeds over same network</h3>
        <ul>
          <li v-for="relayerId in feedsInNetwork" :key="relayerId">
            {{ getFeedDetails(relayerId) }}
          </li>
        </ul>
      </div>
    </div> -->
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapState } from "vuex";
  import LayerChart from "./components/LayerChart";
  import ContractAddress from "./components/ContractAddress.vue";
  import { transformFeed } from "./feedUtils";
  import TimestampWithLoader from "./components/TimestampWithLoader.vue";
  import Loader from "./../../../components/Loader/Loader.vue";
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
        chartDataCache: {
          "1d": null,
          "1w": null,
          "1m": null,
        },
        currentRange: "1w",
        duplicateRanges: [],
      };
    },
    async mounted() {
      await this.fetchRelayerSchema();
      await this.initializeData();
    },
    methods: {
      hexToPrice(hex) {
        let decimalValue = parseInt(hex, 16);
        let price = decimalValue / 100000000;
        return price;
      },
      ...mapActions("feeds", ["initSingle", "fetchRelayerSchema"]),
      async fetchChartData(range) {
        if (this.chartDataCache[range]) {
          return this.chartDataCache[range];
        }

        try {
          const endpoint = this.getChartEndpoint(range);
          const { data } = await axios.get(endpoint);
          return data.onChainUpdates;
        } catch (error) {
          console.error(`Error fetching chart data for ${range}:`, error);
          return null;
        }
      },
      async initializeData() {
        this.isLoading = true;
        try {
          const ranges = ["1d", "1w", "1m"];
          const fetchPromises = ranges.map((range) =>
            this.fetchChartData(range)
          );
          const results = await Promise.all(fetchPromises);

          ranges.forEach((range, index) => {
            this.chartDataCache[range] = results[index];
          });

          this.compareDateSets();
        } catch (error) {
          console.error("Error initializing data:", error);
        } finally {
          this.isLoading = false;
        }
      },
      compareDateSets() {
        const ranges = ["1d", "1w", "1m"];
        this.duplicateRanges = [];
        let equalPairs = [];
        let singleItemRanges = [];
        for (let i = 0; i < ranges.length; i++) {
          if (this.chartDataCache[ranges[i]]?.length === 1) {
            singleItemRanges.push(ranges[i]);
          }
          for (let j = i + 1; j < ranges.length; j++) {
            if (
              this.areDataSetsEqual(
                this.chartDataCache[ranges[i]],
                this.chartDataCache[ranges[j]]
              )
            ) {
              equalPairs.push([ranges[i], ranges[j]]);
            }
          }
        }
        if (equalPairs.length === 3) {
          this.duplicateRanges = [ranges[1], ranges[2]];
          this.chartDataCache[ranges[1]] = this.chartDataCache[ranges[2]] =
            this.chartDataCache[ranges[0]];
        } else if (equalPairs.length === 1) {
          const [smaller, larger] = equalPairs[0];
          this.duplicateRanges = [larger];
          this.chartDataCache[larger] = this.chartDataCache[smaller];
        }
        this.duplicateRanges.push(...singleItemRanges);
        this.duplicateRanges = [...new Set(this.duplicateRanges)];
      },
      areDataSetsEqual(dataset1, dataset2) {
        if (!dataset1 || !dataset2 || dataset1.length !== dataset2.length) {
          return false;
        }

        return dataset1.every(
          (item, index) =>
            item.timestamp === dataset2[index].timestamp &&
            item.value === dataset2[index].value
        );
      },
      handleRangeChange(range) {
        this.currentRange = range;
      },
      getChartEndpoint(range) {
        const baseUrl = "https://api.redstone.finance/on-chain-updates";
        const dataFeedId = this.feedData.token || "ETH";
        const adapterName = this.feedData.relayerId;
        const daysRange = range === "1d" ? 1 : range === "1w" ? 7 : 30;
        return `${baseUrl}?dataFeedId=${dataFeedId}&adapterName=${adapterName}&daysRange=${daysRange}`;
      },
    },
    watch: {
      relayerId() {
        if (
          this.relayerId &&
          this.getSmartContractByLayerId(this.relayerId) == null
        ) {
          this.initSingle(this.relayerId);
        }
      },
    },
    computed: {
      // feedsInNetwork() {
      //   return Object.keys(this.relayerSchema).filter(
      //     (relayer) => relayer.chain.id === this.layer.chain.id
      //   )
      // },
      feedsInRelayer() {
        return this.relayerSchema[this.relayerId].priceFeeds;
      },
      network() {
        return this.$route.params.network;
      },
      token() {
        return this.$route.params.token;
      },
      getFeedDetails(relayerId) {
        return transformFeed(
          this.combinedFeedsWithDetailsArray.filter(
            (feed) =>
              feed.layerId === relayerId
          )
        );
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
        return this.feedData.relayerId;
      },
      currentChartData() {
        return this.chartDataCache[this.currentRange];
      },
      ...mapState("feeds", ["relayersDetails", "relayerSchema"]),
      ...mapGetters("feeds", [
        "combinedFeedsWithDetailsArray",
        "getSmartContractByLayerId",
      ]),
      layer() {
        return this.relayerSchema[this.relayerId];
      },
    },
  };
</script>
<style lang="scss" scoped src="./Feed.scss" />
