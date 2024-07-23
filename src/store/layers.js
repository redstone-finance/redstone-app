import axios from 'axios';
import Web3 from 'web3'
import { isEmpty } from 'lodash';
import Vue from 'vue';
import relayers from '@/data/relayers.js'
import networks from '@/data/networks.js'
const LAYERS_SCHEMA_URL = "https://p6s64pjzub.execute-api.eu-west-1.amazonaws.com/dev/execute";

const CONTRACTS_ABI_DEFINITION = [
    {
        "inputs": [],
        "name": "getBlockTimestampFromLatestUpdate",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "dataFeedId", "type": "bytes32" }],
        "name": "getValueForDataFeed",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "name": "requestedDataFeedIds", "type": "bytes32[]" }],
        "name": "getValuesForDataFeeds",
        "outputs": [{ "name": "", "type": "uint256[]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getDataFeedId",
        "outputs": [{ "name": "", "type": "bytes32" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getDataFeedIds",
        "outputs": [{ "name": "", "type": "bytes32[]" }],
        "stateMutability": "view",
        "type": "function"
    }
];

// Helper methods for handling promises
const etherNetLinkMessage = (address) => `validate it here: https://etherscan.io/address/${address}`


export default {
    namespaced: true,
    state: {
        layersSchema: {},
        smartContracts: {},
        layersDetails: {},
    },
    mutations: {
        assignLayerSchema(state, schema) {
            state.layersSchema = schema;
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
                    feeds: Object.keys(state.layersSchema[key].priceFeeds).map((feedId => ({
                        networkId: state.layersSchema[key].chain.id,
                        feedId: feedId,
                        contractAddress: state.layersSchema[key].adapterContract,
                        triggers:  state.layersSchema[key].updateTriggers
                    })))
                }))
        }
    },
    actions: {
        createSmartContract({ commit, state }, { layerId, contractAddress, chainId }) {
            const contractNetwork = Object.values(networks).find(network => network.chainId === chainId)
            const web3 = new Web3(new Web3.providers.HttpProvider(contractNetwork.rpcUrl));
            const contract = new web3.eth.Contract(CONTRACTS_ABI_DEFINITION, contractAddress);
            commit('assignCreatedSmartContract', { contract, layerId })
        },
        // 
        // Handling smart contracts
        // Condider making some sort of handler for async then/catch/finally cause it hurts eyes. Would be nice to have some sort of generic handler since, methods are very similar
        // But only when we are sure the business logic + it will be much easier to provide unit tests
        // 
        async fetchDataFeedId({ commit, state }, layerId) {
            const api = this.getters['layers/getSmartContractByLayerId'](layerId).methods
            try {
                var id = await api.getDataFeedId().call()
            } catch (error) {
                console.log('error, id, single', layerId, error)
            }
            try {
                var ids = await api.getDataFeedIds().call()
            } catch (error) {
                console.log('error, id, multiple', layerId, error)
                this.dispatch('layers/disableLoader', { layerId, loaderId: 'feedDataValue' })
            }
            commit('assignLayerDetails', { key: 'feedId', layerId, data: id || ids })
            this.dispatch('layers/disableLoader', { layerId, loaderId: 'feedId' })
        },
        async fetchBlockTimeStamp({ commit, state }, layerId) {
            this.getters['layers/getSmartContractByLayerId'](layerId).methods.getBlockTimestampFromLatestUpdate().call().then(timestamp => {
                console.log(timestamp, layerId)
                commit('assignLayerDetails', { key: 'blockTimestamp', layerId, data: timestamp })
            }).catch((error) => {
                console.log('timestamp error', layerId, error)
            }).finally(() => {
                this.dispatch('layers/disableLoader', { layerId, loaderId: 'blockTimestamp' })
            })
        },
        async fetchValueForDataFeed({ commit, state }, { layerId, feedId }) {
            if (feedId == null) return
            const api = this.getters['layers/getSmartContractByLayerId'](layerId).methods
            try {
                var value = await api.getValueForDataFeed(feedId)
            } catch (error) {
                console.log({ error, layerId }, 'single')
            }
            if (isEmpty(value)) {
                try {
                    const values = await api.getValuesForDataFeeds(feedId)
                    commit('assignLayerDetails', { key: 'dataFeed', layerId, data: values.arguments })
                    this.dispatch('layers/disableLoader', { layerId, loaderId: 'feedDataValue' })
                } catch (error) {
                    console.log({ error, layerId }, 'multiple')
                }


            } else {
                commit('assignLayerDetails', { key: 'dataFeed', layerId, data: value.arguments })
                this.dispatch('layers/disableLoader', { layerId, loaderId: 'feedDataValue' })
            }
            this.dispatch('layers/disableLoader', { layerId, loaderId: 'feedDataValue' })
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
            // const { data } = await axios.get(LAYERS_SCHEMA_URL)
            commit('assignLayerSchema', {...relayers.standard})
            if (isEmpty(state.layersDetails)) {
                this.dispatch('layers/initializeLayerDetails')
            }
        },
        async initSingleContract({ state }, layerId) {
            await this.dispatch('layers/fetchLayersSchema')
            await this.dispatch('layers/createSmartContract', { layerId: layerId, contractAddress: state.layersSchema[layerId].adapterContract, chainId: state.layersSchema[layerId].chain.id })
            await this.dispatch('layers/fetchBlockTimeStamp', layerId)
            await this.dispatch('layers/fetchFeedIdAndValue', { layerId: layerId, feedId: state.layersDetails[layerId]?.feedId })
        },
        async init({ state }) {
            if (!isEmpty(state.layersSchema)) return
            await this.dispatch('layers/fetchLayersSchema')
            Object.keys(state.layersSchema).forEach(async key => {
                await this.dispatch('layers/createSmartContract', { layerId: key, contractAddress: state.layersSchema[key].adapterContract, chainId: state.layersSchema[key].chain.id })
                await this.dispatch('layers/fetchBlockTimeStamp', key)
                await this.dispatch('layers/fetchFeedIdAndValue', { layerId: key, feedId: state.layersDetails[key]?.feedId })
            })
        }
    }
}
