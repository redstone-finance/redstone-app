import { ethers } from 'ethers'
import axios from 'axios';
import { stat } from 'fs';

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
            console.log(state.layersDetails)
        }
    },
    getters: {
        getSmartContractByLayerId: (state) => (layerId) => {
            const contract = state.smartContracts[layerId]
            if (contract == null) throw Error('No contract assigned to layer id:', layerId)
            return contract
        },
        hasMultipleFeeds: (state) => (layerId) => {
            return state.layersSchema[layerId].priceFeeds.length > 1
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
            return this.getters['layers/getSmartContractByLayerId'](layerId).getDataFeedId().then(feedId => {
                commit('assignLayerDetails', { key: 'feedId', layerId, data: feedId })
            }).catch(() => {
                console.log(`No FeedId found for ${layerId}, ${etherNetLinkMessage(state.layersSchema[layerId].adapterContract)}`)
            }).finally(() => {
                this.dispatch('layers/disableLoader', { layerId, loaderId: 'feedId' })
            })
        },
        async fetchBlockTimeStamp({ commit, state}, layerId) {
            this.getters['layers/getSmartContractByLayerId'](layerId).getBlockTimestampFromLatestUpdate().then(timestamp => {
                commit('assignLayerDetails', { key: 'blockTimestamp', layerId, data: timestamp })
            }).catch(() => {
                console.log(`No blockTimestamp found for ${layerId}, ${etherNetLinkMessage(state.layersSchema[layerId].adapterContract)}`)
            }).finally(() => {
                this.dispatch('layers/disableLoader', { layerId, loaderId: 'timestamp' })
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
                // since data feed id is required for fetching feed value we disable the feed value loader as well
                this.dispatch('layers/fetchValueForDataFeed', { layerId, feedId })
                console.log(`No dataFeed found for ${layerId}, validate it here: https://etherscan.io/address/${state.layersSchema[layerId].adapterContract}`)
            }).finally(() => {
                this.dispatch('layers/disableLoader', { layerId, loaderId: 'value' })
            })
        },
        async fetchFeedIdAndValue({ state }, { layerId }) {
            const method = this.getters['layers/hasMultipleFeeds'](layerId) ? 'layers/fetchDataFeedIds' : 'layers/fetchDataFeedId'
            this.dispatch(method, layerId).then(() => {
                const feedId = state.layersDetails[layerId]?.feedId
                this.dispatch('layers/fetchValueForDataFeed', { layerId, feedId })
            })
        },
        // 
        // Helpers
        // 
        disableLoader({ state }, { layerId, loaderId }) {
            state.layersDetails[layerId].loaders[loaderId] = false
        },
        initializeLayerDetails({ state }) {
            Object.keys(state.layersSchema).forEach(layerId => {
                if (state.layersDetails[layerId] == null) {
                    // Create empty object only on init of store
                    state.layersDetails[layerId] = {
                        // additional loader object for each property we fetch so we can reflect it in the ui
                        // mutation is not really need
                        loaders: {
                            feedId: true,
                            value: true,
                            timestamp: true,
                        }
                    }
                }
            });
        },
        // 
        // Init fetchning of all details required for the UI
        // 
        async fetchLayersSchema({ commit, state }) {
            const { data } = await axios.get(LAYERS_SCHEMA_URL)
            commit('assignLayerSchema', data)
            this.dispatch('layers/initializeLayerDetails')
        },
        async initLayersContracts() {
            // await this.fetchDataFeedIds()
        }
    }
}
