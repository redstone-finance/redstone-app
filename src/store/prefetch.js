import { getOracleRegistryState } from "redstone-sdk";
import Vue from "vue";

export default {
  namespaced: true,
  state: {
    providers: null,
  },
  mutations: {
    setProviders(state, providers) {
      state.providers = { ...providers };
    },
    // setArweave(state, arweave) {
    //     if (!state.arweave) {
    //         state.arweave = arweave;
    //     }
    // },
    // setSmartweave(state, client) {
    //     state.smartweave = client;
    // },
  },
  getters: {},
  actions: {
    async prefetchAll({ dispatch }) {
      dispatch("fetchProviders");
      // dispatch('initArweave').then(() => { return dispatch('smartweave') })
    },
    // initArweave({ commit }) {
    //     const arweaveObject = Arweave.init({
    //         host: constants.arweaveUrl,
    //         protocol: "https",
    //         port: 443,
    //     });

    //     commit("setArweave", arweaveObject);
    // },
    // smartweave({ commit, state }) {

    //     const arweave = state.arweave;

    //     const smartweave = SmartWeaveNodeFactory
    //         .memCachedBased(arweave)
    //         .build();

    //     commit("setSmartweave", smartweave);
    // },
    updateProvider({ commit, state }, { id, key, value }) {
      let providers = state.providers;
      Vue.set(providers[id], key, value);
      commit("setProviders", providers);
    },
    async fetchProviders({ commit, _state, dispatch }) {
      const contractState = await getOracleRegistryState();
      const providers = contractState.dataServices;
      delete providers["redstone-custom-urls-demo"];
      commit("setProviders", providers);
      for (const [providerId, provider] of Object.entries(providers)) {
        Vue.set(providers, providerId, provider);
        commit("setProviders", providers);
        const manifestName = providerId.split("-")[1];
        const manifest = require(`redstone-monorepo-github/packages/oracle-node/manifests/data-services/${manifestName}.json`);
        dispatch("updateProvider", {
          id: providerId,
          key: "currentManifest",
          value: manifest,
        });
        if (manifest.tokens) {
          const assetsCount = Object.keys(manifest.tokens).length;
          dispatch("updateProvider", {
            id: providerId,
            key: "assetsCount",
            value: assetsCount,
          });
        } else {
          dispatch("updateProvider", {
            id: providerId,
            key: "assetsCount",
            value: 0,
          });
        }
        const nodes = contractState.nodes;
        const filteredNodes = Object.values(nodes).filter(
          (node) => node.dataServiceId === providerId
        );
        dispatch("updateProvider", {
          id: providerId,
          key: "nodes",
          value: filteredNodes,
        });
      }
    },
  },
};
