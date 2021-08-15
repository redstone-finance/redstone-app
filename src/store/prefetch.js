const {interactRead} = require("smartweave");
const axios = require("axios");
import dummyWallet from "@/dummy-wallet.json";
import constants from "@/constants";
import utils from "@/utils";
import Arweave from 'arweave';
import Vue from 'vue';

export default {
  namespaced: true,
  state: {
    arweave: null,
    contractsRegistryContractId: null,
    providersRegistryContractId: null,
    providers: null
  },
  mutations: {
    setProvidersRegistryContractId(state, providersRegistryContractId) {
      state.providersRegistryContractId = providersRegistryContractId;
    },
    setProviders(state, providers) {
      state.providers = { ...providers };
    },
    setArweave(state, arweave) {
      if (!state.arweave) {
        state.arweave = arweave;
      }
    },
    setContractsRegistryContractId(state, id) {
      state.contractsRegistryContractId = id;
    }
  },
  getters: {
    getArweave(state){
      return state.arweave;
    },
    getProviders(state){
      return state.providers;
    },
    getProvidersRegistryContractId(state){
      return state.providersRegistryContractId;
    },
    getContractsRegistryContractId(state){
      return state.contractsRegistryContractId;
    }
  },
  actions: {
    async prefetchAll({ dispatch }) {
      dispatch('initArweave')
        .then(() => { return dispatch('contractsRegistryContract') })
        .then(() => { return dispatch('providersRegistryContract', {contractName: 'providers-registry', mutation: 'setProvidersRegistryContractId'}) })
        .then(() => { dispatch('fetchProviders');}
      );
    },
    initArweave({ commit }) {
      const arweaveObject = Arweave.init({
        host: constants.arweaveUrl,
        protocol: "https",
        port: 443,
      });

      commit("setArweave", arweaveObject);
    },  
    updateProvider({ commit, state }, { id, key, value}) {
      let providers = state.providers;
      Vue.set(providers[id], key, value);
      commit('setProviders', providers);
    },
    async fetchProviders({ commit, getters, dispatch }) {

      let providersData = await interactRead(
        getters.getArweave,
        dummyWallet,
        getters.getProvidersRegistryContractId,
         {
            function: "providersData",
            data: {
              eagerManifestLoad: true
            }
          }
      );
      
      let providers = {};

      for (let o in providersData.providers) {
        Vue.set(providers, o, providersData.providers[o]);
        commit('setProviders', providers);

        const currentManifestTxId = providersData.providers[o].manifests
          .slice(-1)
          .pop().manifestTxId;

        const firstManifestTxId =
          providersData.providers[o].manifests[0].manifestTxId;

        let currentManifestPromise = axios.get(
          `https://${constants.arweaveUrl}/${currentManifestTxId}`
        )
        .then(
          (resp) => {
            dispatch('updateProvider', { id: o, key: 'currentManifest', value: resp.data })
            return resp;
          }
        );

        let firstManifestPromise = axios.get(
          `https://${constants.arweaveUrl}/${firstManifestTxId}`
        );

        Promise.all([currentManifestPromise, firstManifestPromise]).then(
          ([currentManifest, firstManifest]) => {
            utils.transactionTime(firstManifestTxId).then(
              transactionTime => {
                const lockedHours = firstManifest.data.lockedHours
                ? firstManifest.data.lockedHours
                : 0;
  
                let activeFrom = utils.activeFrom(transactionTime, lockedHours);
                let dataPoints = utils.dataPoints(
                  currentManifest.data.interval,
                  activeFrom
                );
    
                Vue.set(providers[o], 'activeFrom', activeFrom);
                Vue.set(providers[o], 'dataPoints', dataPoints);
                Vue.set(providers, o, providers[o]);
    
                commit('setProviders', providers);
              }
            )
          }
        )
      }

    },
    providersRegistryContract({ commit, getters }, {contractName, mutation}) {
      return interactRead(
        getters.getArweave,
        dummyWallet,
        getters.getContractsRegistryContractId,
         {
            function: "contractsCurrentTxId",
            data: {
              contractNames: [contractName]
            }
          }
      ).then(
        result => {
          commit(mutation, result[contractName]);
        }
    );
    },
    async contractsRegistryContract({ commit }) {
      const contractsRegistryContractId = await (await fetch("https://raw.githubusercontent.com/redstone-finance/redstone-smartweave-contracts/main/contracts-registry.address.txt")).text();
      commit('setContractsRegistryContractId', contractsRegistryContractId);
    }
  },
};
