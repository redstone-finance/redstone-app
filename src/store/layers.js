import { ethers } from 'ethers'
import axios from 'axios';

const ETHER_SCAN_API_KEY = "F13KVG286SK73T1WYNP1WWJW3C3JQFPEUI"
const LAYERS_SCHEMA_URL = "https://p6s64pjzub.execute-api.eu-west-1.amazonaws.com/dev/execute";

const CONTRACTS_ABI_DEFINITION = [
    "function getBlockTimestampFromLatestUpdate() public view returns (uint256 blockTimestamp)",
    "function getValueForDataFeed(bytes32 dataFeedId) external view returns (uint256)",
    "function getDataFeedId() external view returns (bytes32)",
];

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
            if (state.layersDetails[layerId] == null) {
                // Create empty object only on init of store
                state.layersDetails[layerId] = {}
            }
            state.layersDetails[layerId][key] = data
            console.log(state.layersDetails)
        }
    },
    getters: {
        getSmartContractByLayerId: (state) => (layerId) => {
            const contract = state.smartContracts[layerId]
            if (contract == null) throw Error('No contract assigned to layer id:', layerId)
            return contract
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
        // 
        async fetchDataFeedId({ commit }, layerId) {
            return this.getters['layers/getSmartContractByLayerId'](layerId).getDataFeedId().then(feedId => {
                commit('assignLayerDetails', { key: 'feedId', layerId, data: feedId })
            }).catch(() => {
                console.log('No FeedId found for', layerId)
            })
        },
        async fetchBlockTimeStamp({ commit }, layerId) {
            this.getters['layers/getSmartContractByLayerId'](layerId).getBlockTimestampFromLatestUpdate().then(timestamp => {
                commit('assignLayerDetails', { key: 'blockTimestamp', layerId, data: timestamp })
            }).catch(() => {
                console.log('No blockTimestamp found for', layerId)
            })
        },
        async fetchValueForDataFeed({ commit }, { layerId, feedId }) {
            if (feedId == null) return
            this.getters['layers/getSmartContractByLayerId'](layerId).getValueForDataFeed(feedId).then(dataFeed => {
                commit('assignLayerDetails', { key: 'dataFeed', layerId, data: dataFeed })
            }).catch(() => {
                console.log('No dataFeed found for', layerId)
            })
        },

        async fetchFeedIdAndValue({ commit, state }, { layerId }) {
            this.dispatch('layers/fetchDataFeedId', layerId).then(() => {
                const feedId = state.layersDetails[layerId]?.feedId
                console.log({feedId})
                this.dispatch('layers/fetchValueForDataFeed', { layerId, feedId })
            })
        },
        // 
        // Init fetchning of all details required for the UI
        // 
        async fetchLayersSchema({ commit }) {
            const { data } = await axios.get(LAYERS_SCHEMA_URL)
            commit('assignLayerSchema', data)
        },
        async initLayersContracts() {
            // await this.fetchDataFeedIds()
        }
    }
}
