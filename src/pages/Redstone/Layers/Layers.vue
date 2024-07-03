<template>
    <div class="sources-wrapper">
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
import axios from "axios";
import _ from "lodash";
import { ethers } from 'ethers'

const apiKey = "F13KVG286SK73T1WYNP1WWJW3C3JQFPEUI"
const SOURCE_REPORT_URL = "https://p6s64pjzub.execute-api.eu-west-1.amazonaws.com/dev/execute";
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
        const data = await this.getEvents()
        console.log({ data })
        await this.loadSourcesReport();
        Object.values(this.sources).forEach(contract => {
            console.log(contract.adapterContract);
            this.connecToContract(contract.adapterContract)
        })
    },
    methods: {
        async getEvents() {
            const params = {
                "module": "proxy",
                "action": "eth_getStorageAt",
                "address": "0xdDb6F90fFb4d3257dd666b69178e5B3c5Bf41136",
                // "page": 1,
                // "offset": 1000,
                "apikey": apiKey,
                // "sort": "asc"
            }
            return axios.get('https://api.etherscan.io/api', { params })

        },
        async connecToContract(address) {
            const abi = [
                "function getBlockTimestampFromLatestUpdate() public view returns (uint256 blockTimestamp)",
                "function getValueForDataFeed(bytes32 dataFeedId) external view returns (uint256)",
                "function getDataFeedId() external view returns (bytes32)",
                "function getDataFeedIds() external view returns (bytes32[] memory)",
                "function getValuesForDataFeeds(bytes32[] memory requestedDataFeedIds) external view returns (uint256[] memory)"
            ];

            const provider = new ethers.providers.EtherscanProvider(ethers.providers.getNetwork(), apiKey)
            const contract = new ethers.Contract(address, abi, provider);
            console.log({ contract })
            contract.getBlockTimestampFromLatestUpdate().then(data => {
                console.log('SUCCESS', data)
            }).catch((error) => {})
            contract.getDataFeedIds().then(data => {
                console.log('DATAFEEDID', data)
                contract.functions.getValuesForDataFeeds(data).then((feedData) => {
                    console.log({ feedData })
                }).catch((error) => {
                })

            }).catch((error) => {
            })

            return contract
        },

        async getContract(contract) {
            // const wrap = WrapperBuilder.wrap(contract).usingDataService(
            //     {
            //         dataFeeds: ["ETH", "BTC"],
            //     },
            // );
            // console.log({wrap})
            // return wrap
        },
        async loadSourcesReport() {
            try {
                this.loading = true
                const response = await axios.get(SOURCE_REPORT_URL, {
                    mode: 'no-cors',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json',
                    },
                });
                this.sourcesReportFromGH = response.data;
            } finally {
                this.loading = false
            }
        },

        getColorForPercentage(value) {
            if (value == 100) {
                return '#0F9D58'; // green
            } else if (value >= 99) {
                return '#ff8c00'; // orange
            } else {
                return '#DB4437'; // red
            }
        },

        getReportForSource(source) {
            const reportWithDefaultValue = (defaultVal) => ({
                'incorrect-price-value': defaultVal,
                'fetching-failed': defaultVal,
            });

            const getErrCount = (errType) => {
                const errors = this.sourcesReportFromGH[source][errType];
                if (!errors) {
                    return 0;
                } else {
                    const sumFromLogs = _.sum(Object.values(errors).map(count => Number(count)));
                    return sumFromLogs / 2; // Aws cloudwatch counts errors twice
                }
            };

            if (this.loading) {
                return reportWithDefaultValue('...');
            } else if (this.sourcesReportFromGH && this.sourcesReportFromGH[source]) {
                return {
                    'incorrect-price-value': getErrCount('incorrect-price-value'),
                    'fetching-failed': getErrCount('fetching-failed'),
                };
            } else {
                return reportWithDefaultValue(0);
            }
        }
    },

    computed: {
        sources() {
            const result = [];
            for (const [id, details] of Object.entries(this.sourcesReportFromGH)) {
                const sourceReport = this.getReportForSource(id);
                const failsCount = sourceReport['fetching-failed'];
                const successPercentage = getFetchingSuccessPercentage(failsCount);
                result.push({
                    ...details,
                    id,
                    ...sourceReport,
                    'fetching-success-percentage': successPercentage,
                });
            }
            return result;
        },
    }
}
</script>

<style lang="scss" src="./Layers.scss" />