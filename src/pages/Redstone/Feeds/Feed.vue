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
                <img class="feeds__token-image small" v-if="feedData" :src="feedData.network.image" :alt="feedData.network.name">
                <span class="applicant-info__text">{{ feedData.network.name }}</span>
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
                    <span class="applicant-info__text">{{ feedData.deviation }}</span>
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
            <div class="applicant-info__item">
              <dt class="applicant-info__label">Last update</dt>
              <dd class="applicant-info__value">
                <span class="applicant-info__text">
                  <div class="date-subvalue">August 5, 2024</div>
                  <div>1 hour ago</div>
                </span>
              </dd>
            </div>
            <div class="applicant-info__item">
              <dt class="applicant-info__label">Addresses</dt>
              <dd class="applicant-info__value">
                <contract-address v-if="feedData" :item="feedData" :separate-labels="true" />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
    <div class="feed-chart">
      <layer-chart :data="sampleData" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import LayerChart from "./components/LayerChart"
import ContractAddress from './components/ContractAddress.vue';
import { transformFeed } from './feedUtils';
import TimestampWithLoader from './components/TimestampWithLoader.vue';
import HeartbeatTimer from './components/HeartbeatTimer.vue'
import sample from './sample.json'

export default {
    components: {
        LayerChart,
        ContractAddress,
        TimestampWithLoader,
        HeartbeatTimer
    },
    data() {
        return {
            chartData: [],
            isLoading: false,
            sampleData: sample
        };
    },

    async mounted() {
        await this.fetchRelayerSchema()
    },
    methods: {
        ...mapActions('feeds', ['initSingleContract', 'fetchRelayerSchema'])
    },
    watch: {
        feedData() {
            if (this.feedData.relayerId) {
                if (this.getSmartContractByLayerId(this.feedData.relayerId) == null) {
                    this.initSingleContract(this.feedData.relayerId)
                }
            }
        }
    },
    computed: {
        network() {
            return this.$route.params.network
        },
        token() {
            return this.$route.params.token
        },
        feedData() {
            return transformFeed(this.combinedFeedsWithDetailsArray.find(feed => feed.routeNetwork === this.network && feed.routeToken === this.token))
        },
        ...mapState('feeds', ['relayersDetails', 'relayersSchema']),
        ...mapGetters('feeds', [
            'combinedFeedsWithDetailsArray', 'getSmartContractByLayerId'
        ]),
        layer() {
            return this.relayersSchema[this.layerId]
        },
    }
}
</script>
<style lang="scss" scoped src="./Feed.scss" />
