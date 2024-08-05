<template>
    <div class="feed-details">
        <div class="feed-details__infos">
            <div class="applicant-info">
                <div class="applicant-info__header">
                    <h3 class="applicant-info__title">1INCH / ETH</h3>
                    <p class="applicant-info__description">1inch</p>
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
                                <span class="applicant-info__text">Ethereum Mainnet</span>
                            </dd>
                        </div>
                        <div class="applicant-info__item">
                            <dt class="applicant-info__label">Trigger parameters</dt>
                            <dd class="applicant-info__column-value">
                                <div class="applicant-info__item">
                            <dt class="applicant-info__label">Deviation threshold
                            </dt>
                            <dd class="applicant-info__value">
                                <span class="applicant-info__text">2</span>
                            </dd>
                        </div>
                        <div class="applicant-info__item">
                            <dt class="applicant-info__label">Heartbeat</dt>
                            <dd class="applicant-info__value">
                                <span class="applicant-info__text">22:05:50</span>
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
import axios from 'axios'
import { mapActions, mapGetters, mapState } from 'vuex'
import LayerName from './components/LayerName'
import LayerChain from './components/LayerChain'
import LayerTriggers from './components/LayerTriggers'
import LayerPriceFeeds from './components/LayerPriceFeeds'
import LayerChart from "./components/LayerChart";


export default {
    components: {
        LayerName,
        LayerChain,
        LayerPriceFeeds,
        LayerTriggers,
        LayerChart
    },
    data() {
        return {
            chartData: [],
            isLoading: false,
            sampleData: [{ timeStamp: "2024-08-01 08:15:30", action: "Login" },
            { timeStamp: "2024-08-01 09:30:45", action: "View Profile" },
            { timeStamp: "2024-08-01 11:20:15", action: "Update Settings" },
            { timeStamp: "2024-08-02 10:05:00", action: "Post Comment" },
            { timeStamp: "2024-08-02 14:45:30", action: "Like Post" },
            { timeStamp: "2024-08-02 16:30:00", action: "Share Content" },
            { timeStamp: "2024-08-02 18:20:15", action: "Logout" },
            { timeStamp: "2024-08-03 09:00:00", action: "Login" },
            { timeStamp: "2024-08-03 11:30:45", action: "Send Message" },
            { timeStamp: "2024-08-04 13:15:30", action: "View Profile" },
            { timeStamp: "2024-08-04 15:45:00", action: "Update Status" },
            { timeStamp: "2024-08-04 17:30:15", action: "Like Post" },
            { timeStamp: "2024-08-04 19:00:30", action: "Logout" },
            { timeStamp: "2024-08-05 08:30:00", action: "Login" },
            { timeStamp: "2024-08-05 10:15:45", action: "Post Comment" },
            { timeStamp: "2024-08-05 12:00:30", action: "Share Content" },
            { timeStamp: "2024-08-05 14:30:15", action: "Send Message" },
            { timeStamp: "2024-08-05 16:45:00", action: "Update Settings" },
            { timeStamp: "2024-08-05 18:20:30", action: "Logout" }]
        };
    },

    async mounted() {
        this.initSingleContract(this.relayerId).then(async () => {
            await this.fetchChartData()
        })
    },
    methods: {
        ...mapActions('feeds', ['initSingleContract']),
        async fetchChartData() {
            this.isLoading = true
            const queryParams = {
                module: 'logs',
                action: 'getLogs',
                address: this.feedData.contractAddress,
                page: '1',
                offset: '1000',
                apikey: process.env.VUE_APP_ETHER_SCAN_API_KEY
            };
            const { data } = await axios.get('https://api.etherscan.io/api', { params: queryParams })
            if (data.result.length > 0 && Array.isArray(data.result)) {
                this.chartData = data.result.map(({ timeStamp, gasUsed, gasPrice }) => ({ timeStamp: this.parseHexTimestamp(timeStamp), gasUsed, gasPrice }))
            }
            this.isLoading = false;
        },
    },
    computed: {
        network() {
            return this.$route.params.network
        },
        token() {
            return this.$route.params.token
        },
        relayerId() {
            return this.$route.params.relayerId
        },
        feedData() {
            return this.combinedFeedsWithDetailsArray.find(feed => feed.routeNetwork === this.network && feed.routeToken === this.token)
        },
        ...mapState('feeds', ['layersDetails', 'layersSchema']),
        ...mapGetters('feeds', [
            'combinedFeedsWithDetailsArray'
        ]),
        layer() {
            return this.layersSchema[this.layerId]
        },
    }
}
</script>
<style lang="scss" scoped src="./Feed.scss" />