<template>
    <div class="layers">
        <hr>
        <vue-loaders-ball-beat v-if="isLoading" class="chart-loader" color="var(--redstone-red-color)" scale="1" />
        <LayerChart v-if="chartData.length > 0" :data="chartData" />
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
            isLoading: false
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
        relayerId(){
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
<style lang="scss">
.chart-loader {
    margin: 0 auto;
    display: block;
    width: 60px;
}
</style>