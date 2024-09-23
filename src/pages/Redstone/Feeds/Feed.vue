<template>
  <div>
    <div class="feed-details">
      <dl class="stats-grid">
        <div class="stat-item">
          <dt class="stat-title">Answer</dt>
          <dd class="stat-value" v-if="feedData">
            <strong
              >{{
                currenciesMap[feedData?.token.split("/")[1]] ||
                feedData.token.split("/")[1] ||
                "$"
              }}{{
                feedData?.apiValues?.value
              }}</strong
            >
          </dd>
        </div>
        <div class="stat-item">
          <dt class="stat-title">Network</dt>
          <dd class="stat-value">
            <img
              class="feeds__token-image small"
              v-if="feedData"
              :src="feedData?.network.image"
              :alt="feedData?.network.name"
            />
            <span class="applicant-info__text">{{
              feedData?.network?.name
            }}</span>
          </dd>
        </div>
        <div class="stat-item">
          <dt class="stat-title">Symbol</dt>
          <dd class="stat-value">{{ feedData?.token }}</dd>
        </div>
        <div class="stat-item">
          <dt class="stat-title">Deviation threshold</dt>
          <dd class="stat-value">{{ feedData?.deviation }}</dd>
        </div>
        <div class="stat-item" v-if="feedData">
          <dt class="stat-title">Heartbeat</dt>
          <dd class="stat-value">
            <i class="fa fa-heartbeat"></i>
            <Loader
              v-if="
                feedData?.loaders?.blockTimestamp &&
                feedData?.apiValues?.timestamp == null
              "
              class="feeds__loader"
            />
            <span
              v-else
              class="feeds__timestamp"
              v-b-tooltip.hover
              :title="feedData?.heartbeatTitle"
            >
              <span v-if="heartbeatIsNumber(feedData?.heartbeat)">
                <to-date-counter :duration="feedData?.heartbeat" />
              </span>
              <div v-else>
                <span
                  style="cursor: pointer"
                  :id="`cron-trigger-${feedData?.layer_id}`"
                >
                  <to-date-counter
                    class="d-inline"
                    :duration="nearestCron(feedData?.heartbeat)"
                  />
                </span>
              </div>
            </span>
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
          :currency="getCurrency(feedData.token)"
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
          <a :href="feedData?.explorer?.explorerUrl" target="_blank">{{
            feedData?.explorer.name
          }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapActions, mapGetters, mapState } from "vuex";
  import LayerChart from "./components/LayerChart";
  import ContractAddress from "./components/ContractAddress.vue";
  import ToDateCounter from "./components/ToDateCounter.vue";
  import {
    mapFeedsData,
    parseToCurrency,
    toUrlParam,
    findNetworkName,
    heartbeatIsNumber
  } from "./utils/FeedsTableDataLayer";
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
      ToDateCounter
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
        rawChartData: null,
        currenciesMap: {
          ETH: "Ξ",
          EUR: "€",
          USD: "$",
        },
      };
    },
    async mounted() {
      await this.fetchRelayerValues();
      await this.fetchRelayerSchema();
      await this.initializeData();
    },
    methods: {
      parseToCurrency,
      heartbeatIsNumber,
      hexToPrice(hex) {
        let decimalValue = parseInt(hex, 16);
        let price = decimalValue / 100000000;
        return price;
      },
      ...mapActions("feeds", [
        "initSingleContract",
        "fetchRelayerSchema",
        "fetchRelayerValues",
      ]),
      async fetchChartData() {
        if (this.rawChartData) {
          return this.rawChartData;
        }

        try {
          const endpoint = this.getChartEndpoint(30);
          const { data } = await axios.get(endpoint);
          this.rawChartData = data.onChainUpdates;
          return this.rawChartData;
        } catch (error) {
          console.error(`Error fetching chart data:`, error);
          return null;
        }
      },
      getCurrency(token) {
        const currency = token.split("/")[1];
        let symbol = "$";
        if (currency && currency !== "USD") {
          switch (currency) {
            case "EUR":
              symbol = "€";
              break;
            case "ETH":
              symbol = "Ξ";
              break;
            default:
              symbol = currency;
          }
        }
        return symbol;
      },
      async initializeData() {
        this.isLoading = true;
        try {
          const rawData = await this.fetchChartData();
          if (rawData) {
            this.mapDataToRanges(rawData);
            this.compareDateSets();
          }
        } catch (error) {
          console.error("Error initializing data:", error);
        } finally {
          this.isLoading = false;
        }
      },
      mapDataToRanges(rawData) {
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

        this.chartDataCache["1m"] = rawData;
        this.chartDataCache["1w"] = rawData.filter(
          (item) => item.timestamp >= oneWeekAgo
        );
        this.chartDataCache["1d"] = rawData.filter(
          (item) => item.timestamp >= oneDayAgo
        );
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
      getChartEndpoint(daysRange) {
        const baseUrl = "https://api.redstone.finance/on-chain-updates";
        const dataFeedId = this.feedData.token || "ETH";
        const adapterName = this.feedData?.relayerId;
        return `${baseUrl}?dataFeedId=${dataFeedId}&adapterName=${adapterName}&daysRange=${daysRange}`;
      },
    },
    watch: {
      relayerId() {
        if (
          this.relayerId &&
          this.getSmartContractByLayerId(this.relayerId) == null
        ) {
          this.initSingleContract({
            layerId: this.relayerId,
            feedId: this.feedData?.token,
          });
        }
      },
    },
    computed: {
      feedsInRelayer() {
        return this.relayerSchema[this.relayerId].priceFeeds;
      },
      network() {
        return this.$route.params?.network;
      },
      token() {
        return this.$route.params.token;
      },
      getFeedDetails(relayerId) {
        return mapFeedsData(
          this.combinedFeedsWithDetailsArray.filter(
            (feed) => feed.layerId === relayerId
          )
        );
      },
      feedData() {
        return mapFeedsData(
          this.combinedFeedsWithDetailsArray.filter(
            (feed) =>
              toUrlParam(findNetworkName(feed?.networkId)) === this.network &&
              toUrlParam(feed.feedId) === this.token
          )
        )[0];
      },
      relayerId() {
        return this.feedData?.relayerId;
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
