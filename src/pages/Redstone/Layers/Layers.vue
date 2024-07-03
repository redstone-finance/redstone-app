<template>
    <div class="sources-wrapper">
        {{ layersDetails }}
        <b-table id="sources-table" stacked="md" sort-icon-left :busy="loading" hover :items="sources" :fields="fields">

            <template #cell(name)="source">
                <div class="source-name">
                    <img class="source-logo" :src="source.item.logoURI" />
                    <span class="ml-3">
                        {{ source.item.id }}
                    </span>
                </div>
            </template>

            <template #cell(fetching-success-percentage)="source">
                <span class="stability-percantage"
                    :style="{ color: getColorForPercentage(source.item['fetching-success-percentage']) }">
                    {{ source.item['fetching-success-percentage'] }}%
                </span>
            </template>

            <template #cell(link)="source">
                <a :href="source.item.url" target="_blank">
                    <i class="fa fa-external-link" />
                </a>
            </template>

            <template #cell(detailed-report)="source">
                <div class="source-report-link-container">
                    <a :href="'/#/app/source/' + source.item.id">
                        <span>View report</span>
                        <i class="fa fa-angle-right ml-2" />
                    </a>
                </div>
            </template>
        </b-table>

        <div v-if="showReportsLink" class="report-source-link">
            Data source:
            <a target="_blank" href="https://github.com/redstone-finance/redstone-reports">
                github.com/redstone-finance/redstone-reports
            </a>
        </div>
    </div>
</template>

<script>
import _ from "lodash";
import { mapActions, mapState, mapGetters } from 'vuex'

const MAX_FETCHING_SUCCESS = 60 * 24 * 5; // 5 days of the main redstone-node work

function getFetchingSuccessPercentage(failCount) {
    return Number((100 * (MAX_FETCHING_SUCCESS - failCount) / MAX_FETCHING_SUCCESS).toFixed(2));
}

export default {
    data() {
        return {
            loading: false,
            showReportsLink: false,
            sourcesReportFromGH: {},
            fields: [
                { key: 'name', label: 'Source', stickyColumn: true },
                { key: 'link', label: 'URL' },
                { key: 'incorrect-price-value', label: 'Incorrect price', sortable: true },
                { key: 'fetching-failed', label: 'Fetching failed', sortable: true },
                { key: 'fetching-success-percentage', label: 'Success', sortable: true },
                { key: 'detailed-report', label: 'Stability report' },
            ],
        };
    },

    async mounted() {
        await this.fetchLayersSchema()
        await this.createEtherScanProvider()
        Object.keys(this.layersSchema).forEach(async key => {
            await this.createSmartContract({ layerId: key, contractAddress: this.layersSchema[key].adapterContract })
            await this.fetchBlockTimeStamp(key)
            await this.fetchFeedIdAndValue({ layerId: key, feedId: this.layersDetails[key]?.feedId })
        })
        console.log(this.layersDetails)
    },
    methods: {
        ...mapActions('layers', [
            'fetchLayersSchema',
            'createEtherScanProvider',
            'createSmartContract',
            'fetchBlockTimeStamp',
            'fetchFeedIdAndValue'
        ]),
        getColorForPercentage(value) {
            if (value == 100) {
                return '#0F9D58'; // green
            } else if (value >= 99) {
                return '#ff8c00'; // orange
            } else {
                return '#DB4437'; // red
            }
        },
    },

    computed: {
        ...mapState('layers', [
            'layersDetails',
            'layersSchema'
        ]),
        sources() {
            return []
        },
    }
}
</script>

<style lang="scss" src="./Layers.scss" />