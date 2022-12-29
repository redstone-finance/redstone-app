import axios from "axios";
import { getOracleRegistryState } from "redstone-sdk";
import constants from "@/constants";
import Arweave from 'arweave';
import { SmartWeaveNodeFactory } from 'redstone-smartweave';
import Vue from 'vue';

export default {
    namespaced: true,
    state: {
        arweave: null,
        smartweave: null,
        providers: null
    },
    mutations: {
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
        async fetchProviders({ commit, _state, dispatch }) {
            const contractState = await getOracleRegistryState();
            const providers = contractState.dataServices;
            commit('setProviders', providers);
            const nodes = contractState.nodes;
          
            for (const [providerId, provider] of Object.entries(providers)) {
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
                
                const filteredNodes = Object.values(nodes).filter(node => node.dataFeedId === providerId);
                dispatch('updateProvider', { id: providerId, key: 'nodes', value: filteredNodes });
            }
        },
    }
};
