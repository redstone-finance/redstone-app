import { ethers } from 'ethers'
import axios from 'axios';

const ETHER_SCAN_API_KEY = "F13KVG286SK73T1WYNP1WWJW3C3JQFPEUI"
const LAYERS_SCHEMA_URL = "https://p6s64pjzub.execute-api.eu-west-1.amazonaws.com/dev/execute";

const CONTRACTS_ABI_DEFINITION = [
    "function getBlockTimestampFromLatestUpdate() public view returns (uint256 blockTimestamp)",
    "function getValueForDataFeed(bytes32 dataFeedId) external view returns (uint256)",
    "function getDataFeedId() external view returns (bytes32)",
    "function getDataFeedIds() external view returns (bytes32[] memory)", // to handle more soruces
    "function getValuesForDataFeeds(bytes32[] memory requestedDataFeedIds) external view returns (uint256[] memory)" // handling more sources while doing one call
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
            state.layersDetails[layerId][key] = data
        }
    },
    getters: {
        getSmartContractByLayerId(layerId) {
            const contract = this.smartContracts[layerId]
            if (contract == null) throw Error('No contract assigned to layer id:', layerId)
            return contract
        }
    },
    actions: {
        // Ether.js initialization methods
        createEtherScanProvider({ commit }) {
            const provider = new ethers.providers.EtherscanProvider(ethers.providers.getNetwork(), ETHER_SCAN_API_KEY)
            commit('assignEtherScanProvider', provider);
        },
        createSmartContract({ commit, state }, layerId, contractAddress) {
            if (state.etherScanProvider == null) throw Error('Cannot create contract before establishing EtherScan provider')
            const contract = new ethers.Contract(contractAddress, CONTRACTS_ABI_DEFINITION, state.etherScanProvider);
            commit('assignCreatedSmartContract', { contract, layerId })
        },
        // Handling smart contracts
        async fetchDataFeedIds({ commit }, layerId) {
            const feedIds = await this.getSmartContractByLayerId(layerId).getDataFeedIds()
            commit('assignLayerDetails', { key: 'feedId', layerId, data: feedIds })
        },
        // Init fetchning of all details required for the UI
        async fetchLayersSchema({ commit }) {
            const { data } = await axios.get(LAYERS_SCHEMA_URL)
            commit('assignLayerSchema', data)
        },
        async fetchContractDetails() {
            // await this.fetchDataFeedIds()
        }
    }
}
