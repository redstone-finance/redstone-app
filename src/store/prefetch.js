const axios = require("axios");
import dummyWallet from "@/dummy-wallet.json";
import constants from "@/constants";
import Arweave from 'arweave';
import { SmartWeaveNodeFactory } from 'redstone-smartweave';
import Vue from 'vue';

export default {
    namespaced: true,
    state: {
        arweave: null,
        smartweave: null,
        oracleRegistryContractId: null,
        contractsRegistryContractId: null,
        providers: null
    },
    mutations: {
        setOracleRegistryContractId(state, oracleRegistryContractId) {
            state.oracleRegistryContractId = oracleRegistryContractId;
        },
        setContractsRegistryContractId(state, contractsRegistryContractId) {
            state.contractsRegistryContractId = contractsRegistryContractId;
        },
        setProviders(state, providers) {
            state.providers = {...providers };
        },
        setArweave(state, arweave) {
            if (!state.arweave) {
                state.arweave = arweave;
            }
        },
        setSmartweave(state, client) {
            state.smartweave = client;
        },
    },
    getters: {},
    actions: {
        async prefetchAll({ dispatch }) {
            dispatch('initArweave')
                .then(() => { return dispatch('smartweave') })
                .then(() => { return dispatch('oracleRegistryContract') })
                .then(() => { return dispatch('contractsRegistryContract') })
                .then(() => { dispatch('fetchProviders'); });
        },
        initArweave({ commit }) {
            const arweaveObject = Arweave.init({
                host: constants.arweaveUrl,
                protocol: "https",
                port: 443,
            });

            commit("setArweave", arweaveObject);
        },
        smartweave({ commit, state }) {

            const arweave = state.arweave;

            const smartweave = SmartWeaveNodeFactory
                .memCachedBased(arweave)
                .build();

            commit("setSmartweave", smartweave);
        },
        updateProvider({ commit, state }, { id, key, value }) {
            let providers = state.providers;
            Vue.set(providers[id], key, value);
            commit("setProviders", providers);
        },
        async fetchProviders({ commit, state, dispatch }) {
            const oracleRegistryContract = state.smartweave
                .contract(state.oracleRegistryContractId)
                .connect(dummyWallet);

            const providersList = (await oracleRegistryContract.viewState({
                function: "listDataFeeds",
            })).result;

            const nodesList = (await oracleRegistryContract.viewState({
                function: "listNodes",
            })).result;

            const nodes = []
            for (const nodeAddress of nodesList) {
                const node = (await oracleRegistryContract.viewState({
                    function: "getNodeDetails",
                    data: {
                        address: nodeAddress
                    }
                })).result;
                nodes.push(node)
            }
            let providers = {};
            for (const providerId of providersList) {
                const provider = (await oracleRegistryContract.viewState({
                    function: "getDataFeedDetailsById",
                    data: {
                        id: providerId
                    }
                })).result;
                Vue.set(providers, providerId, provider);
                commit('setProviders', providers);
        
                const currentManifestTxId = provider.manifestTxId;
                if (currentManifestTxId) {
                    const currentManifest = await axios.get(`https://${constants.arweaveUrl}/${currentManifestTxId}`);
                    dispatch('updateProvider', { id: providerId, key: 'currentManifest', value: currentManifest.data });
                    if (currentManifest.data.tokens) {
                      const assetsCount = Object.keys(currentManifest.data.tokens).length;
                      dispatch('updateProvider', { id: providerId, key: 'assetsCount', value: assetsCount });
                    } else {
                      dispatch('updateProvider', { id: providerId, key: 'assetsCount', value: 0 });
                    }
                }
                
                const filteredNodes = nodes.filter(node => node.dataFeedId === providerId);
                dispatch('updateProvider', { id: providerId, key: 'nodes', value: filteredNodes });
            }
        },
        async oracleRegistryContract({ commit }) {
            const response = await axios.get(constants.smartweaveContractAddressesUrl);
            const oracleRegistryContractId = response.data['oracle-registry'];
            commit('setOracleRegistryContractId', oracleRegistryContractId);
        }
    }
};
