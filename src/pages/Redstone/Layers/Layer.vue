<template>
    <div class="layers" v-if="layer">
        <LayerName :layerName="layerId">
            <div>
                <strong style="color: #000;">{{ layer.adapterContract }}</strong>
            </div>
        </LayerName>
        <LayerChain :chain="layer.chain.name" :chainId="layer.chain.id" />
        <LayerTriggers :updateTriggers="layer.updateTriggers" />
        <LayerPriceFeeds :priceFeeds="layer.priceFeeds" />
        <hr>
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
import parseHexTimestamp from '../../../core/timeHelpers'
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
            chartData: []
        };
    },

    async mounted() {
        this.initSingleContract(this.$route.params.layerId).then(async () => {
            await this.fetchChartData()
        })
    },
    methods: {
        ...mapActions('layers', ['initSingleContract']),
        ...mapActions('layout', ['updateSearchTerm']),
        async fetchChartData() {
            const queryParams = {
                module: 'logs',
                action: 'getLogs',
                address: this.layer?.adapterContract,
                page: '1',
                offset: '1000',
                apikey: process.env.VUE_APP_ETHER_SCAN_API_KEY
            };
            const { data } = await axios.get('https://api.etherscan.io/api', { params: queryParams })
            if (data.result.length > 0 && Array.isArray(data.result)) {
                this.chartData = data.result.map(({ timeStamp, gasUsed, gasPrice }) => ({ timeStamp: this.parseHexTimestamp(timeStamp), gasUsed, gasPrice }))
            }
        },
        parseHexTimestamp,
    },
    computed: {
        layerId() {
            return this.$route.params.layerId
        },
        ...mapState('layers', ['layersDetails', 'layersSchema']),
        ...mapGetters('layers', [
            'combinedLayersWithDetailsArray'
        ]),
        layer() {
            return this.layersSchema[this.layerId]
        },
    }
}
</script>