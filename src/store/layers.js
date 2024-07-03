import { ethers } from 'ethers'
import axios from 'axios';
import { isEmpty, debounce} from 'lodash';
import Vue from 'vue';
// To whoever will be checking this out, I know this should .env 
const ETHER_SCAN_API_KEY = "F13KVG286SK73T1WYNP1WWJW3C3JQFPEUI"
const LAYERS_SCHEMA_URL = "https://p6s64pjzub.execute-api.eu-west-1.amazonaws.com/dev/execute";

const CONTRACTS_ABI_DEFINITION = [
    "function getBlockTimestampFromLatestUpdate() public view returns (uint256 blockTimestamp)",
    "function getValueForDataFeed(bytes32 dataFeedId) external view returns (uint256)",
    "function getValuesForDataFeeds(bytes32[] memory requestedDataFeedIds) external view returns (uint256[] memory)",
    "function getDataFeedId() external view returns (bytes32)",
    "function getDataFeedIds() external view returns (bytes32[] memory)"
];

// Helper methods for handling promises
const etherNetLinkMessage = (address) => `validate it here: https://etherscan.io/address/${address}`

export default {
    namespaced: true,
    state: {
        layersSchema: {},
        smartContracts: {},
        layersDetails: {},
        etherScanProvider: null
    },
    mutations: {
        assignLayerSchema(state, schema) {
            state.layersSchema = schema;
        },
        assignEtherScanProvider(state, provider) {
            state.etherScanProvider = provider;
        },
        assignCreatedSmartContract(state, { contract, layerId }) {
            state.smartContracts[layerId] = contract;
        },
        assignLayerDetails(state, { key, layerId, data }) {
            state.layersDetails[layerId][key] = data
        },
        disableLoaderMutation(state, { loaderId, layerId }) {
            state.layersDetails[layerId].loaders[loaderId] = false
        },
    },
    getters: {
        getSmartContractByLayerId: (state) => (layerId) => {
            const contract = state.smartContracts[layerId]
            if (contract == null) throw Error('No contract assigned to layer id:', layerId)
            return contract
        },
        hasMultipleFeeds: (state) => (layerId) => {
            return state.layersSchema[layerId].priceFeeds.length > 1
        },
        // combined data which will be displayed as a UI - mapping fetched data with initial schema layers
        combinedLayersWithDetailsArray(state) {
            return Object.keys(state.layersSchema)
                .map((key) => ({
                    key,
                    values: {
                        ...state.layersSchema[key],
                        details: { ...state.layersDetails[key] }
                    }
                }))
        }
    },
    actions: {
        // 
        // Ether.js initialization methods
        // 
        createEtherScanProvider({ commit }) {
            const provider = new ethers.providers.EtherscanProvider(ethers.providers.getNetwork(), ETHER_SCAN_API_KEY)
            commit('assignEtherScanProvider', provider);
        },
        createSmartContract({ commit, state }, { layerId, contractAddress }) {
            if (state.etherScanProvider == null) throw Error('Cannot create contract before establishing EtherScan provider. Please call createEtherScanProvider method before creating a contract')
            const contract = new ethers.Contract(contractAddress, CONTRACTS_ABI_DEFINITION, state.etherScanProvider);
            commit('assignCreatedSmartContract', { contract, layerId })
        },
        // 
        // Handling smart contracts
        // Condider making some sort of handler for async then/catch/finally cause it hurts eyes. Would be nice to have some sort of generic handler since, methods are very similar
        // But only when we are sure the business logic + it will be much easier to provide unit tests
        // 
        async fetchDataFeedId({ commit, state }, layerId) {
            const method = this.getters['layers/hasMultipleFeeds'](layerId) ? 'getDataFeedIds' : 'getDataFeedId'
            return this.getters['layers/getSmartContractByLayerId'](layerId)[method]().then(feedId => {
                commit('assignLayerDetails', { key: 'feedId', layerId, data: feedId })
            }).catch(() => {
                // since data feed id is required for fetching feed value we disable the feed value loader as well
                this.dispatch('layers/disableLoader', { layerId, loaderId: 'feedDataValue' })
                console.log(`No FeedId found for ${layerId}, ${etherNetLinkMessage(state.layersSchema[layerId].adapterContract)}`)
            }).finally(() => {
                this.dispatch('layers/disableLoader', { layerId, loaderId: 'feedId' })
            })
        },
        async fetchBlockTimeStamp({ commit, state }, layerId) {
            this.getters['layers/getSmartContractByLayerId'](layerId).getBlockTimestampFromLatestUpdate().then(timestamp => {
                commit('assignLayerDetails', { key: 'blockTimestamp', layerId, data: timestamp })
            }).catch(() => {
                console.log(`No blockTimestamp found for ${layerId}, ${etherNetLinkMessage(state.layersSchema[layerId].adapterContract)}`)
            }).finally(() => {
                this.dispatch('layers/disableLoader', { layerId, loaderId: 'blockTimestamp' })
            })
        },
        async fetchValueForDataFeed({ commit, state }, { layerId, feedId }) {
            if (feedId == null) return
            // Most contract with multiple feeds expose only method for multiple values
            // I'm not sure if this is a general rule for every contract, would be nice to have consistensy across contracts.
            const method = this.getters['layers/hasMultipleFeeds'](layerId) ? 'getValuesForDataFeeds' : 'getValueForDataFeed'
            this.getters['layers/getSmartContractByLayerId'](layerId)[method](feedId).then(dataFeed => {
                commit('assignLayerDetails', { key: 'dataFeed', layerId, data: dataFeed })
            }).catch(() => {
                console.log(`No dataFeed found for ${layerId}, validate it here: https://etherscan.io/address/${state.layersSchema[layerId].adapterContract}`)
            }).finally(() => {
                this.dispatch('layers/disableLoader', { layerId, loaderId: 'feedDataValue' })
            })
        },
        // This one should be used to obtain feed value thus it requires feedId query to be chained
        async fetchFeedIdAndValue({ state }, { layerId }) {
            this.dispatch('layers/fetchDataFeedId', layerId).then(() => {
                const feedId = state.layersDetails[layerId]?.feedId
                this.dispatch('layers/fetchValueForDataFeed', { layerId, feedId })
            })
        },
        // 
        // Helpers
        // 
        disableLoader({ commit }, { layerId, loaderId }) {
            commit('disableLoaderMutation', { layerId, loaderId })
        },
        initializeLayerDetails({ state }) {
            Object.keys(state.layersSchema).forEach(layerId => {
                // Using Vue.set to make values reactive
                Vue.set(state.layersDetails, layerId, {
                    feedId: null,
                    blockTimestamp: null,
                    dataFeed: null,
                    // additional loader object for each property we fetch so we can reflect it in the ui
                    loaders: {
                        feedId: true,
                        feedDataValue: true,
                        blockTimestamp: true,
                    }
                });
            })
        },
        // 
        // Init fetchning of all details required for the UI
        // 
        async fetchLayersSchema({ commit, state }) {
            if (!isEmpty(state.layersSchema)) return
            const { data } = await axios.get(LAYERS_SCHEMA_URL)
            commit('assignLayerSchema', data)
            if (isEmpty(state.layersDetails)) {
                this.dispatch('layers/initializeLayerDetails')
            }
        },

        async init({ state }) {
            await this.dispatch('layers/fetchLayersSchema')
            await this.dispatch('layers/createEtherScanProvider')
            Object.keys(state.layersSchema).forEach(async key => {
                await this.dispatch('layers/createSmartContract', { layerId: key, contractAddress: state.layersSchema[key].adapterContract })
                await this.dispatch('layers/fetchBlockTimeStamp', key)
                await this.dispatch('layers/fetchFeedIdAndValue', { layerId: key, feedId: state.layersDetails[key]?.feedId })
            })
        }
    }
}
