const axios = require("axios");
import dummyWallet from "@/dummy-wallet.json";
import constants from "@/constants";
import utils from "@/utils";
import Arweave from 'arweave';
import {
  CacheableStateEvaluator,
  ContractDefinitionLoader,
  SmartWeaveWebFactory
} from 'redstone-smartweave';
import LocalStorageCache from "@/cache/cache";
import LocalStorageBlockHeightCache from "@/cache/block-height-cache";
import Vue from 'vue';


export default {
  namespaced: true,
  state: {
    arweave: null,
    smartweave: null,
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
    setSmartweave(state, client) {
      state.smartweave = client;
    },
    setContractsRegistryContractId(state, id) {
      state.contractsRegistryContractId = id;
    }
  },
  getters: {
  },
  actions: {
    async prefetchAll({ dispatch }) {
      dispatch('initArweave')
        .then(() => { return dispatch('smartweave') })
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
    smartweave({ commit, state }) {
      
      const arweave = state.arweave;
      const contractDefinitionLoader = new ContractDefinitionLoader(state.arweave, new LocalStorageCache("_REDSTONE_APP_"));
      const cacheableStateEvaluator = new CacheableStateEvaluator(state.arweave, new LocalStorageBlockHeightCache("_REDSTONE_APP_STATE_"));

      const smartweave = SmartWeaveWebFactory
        .memCachedBased(arweave)
        .setDefinitionLoader(contractDefinitionLoader)
        .setStateEvaluator(cacheableStateEvaluator)
        .build();
    
      commit("setSmartweave", smartweave);
    },  
    updateProvider({ commit, state }, { id, key, value}) {
      let providers = state.providers;
      Vue.set(providers[id], key, value);
      commit('setProviders', providers);
    },
    async fetchProviders({ commit, state, dispatch }) {

    const providersRegistryContract = 
      state.smartweave
        .contract(state.providersRegistryContractId)
        .connect(dummyWallet);

      let providersData = (await providersRegistryContract.viewState({
        function: "providersData",
        data: {
          eagerManifestLoad: false,
        },
      })).result;  
      
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

                let pointsPerInterval = 0;
                Object.values(currentManifest.data.tokens).forEach(
                  token => { 
                      pointsPerInterval += (token.source ? Object.keys(token.source).length : 1 )
                  });

                  console.log(o)
                let dataPoints = utils.dataPoints(
                  o,
                  currentManifest.data.interval,
                  pointsPerInterval
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
    providersRegistryContract({ commit, state }, {contractName, mutation}) {
      const contractsRegistryContract = 
        state.smartweave
          .contract(state.contractsRegistryContractId)
          .connect(dummyWallet);

      return contractsRegistryContract
              .viewState(
                {
                  function: "contractsCurrentTxId",
                  data: {
                    contractNames: [contractName]
                  }
                }
              ).then(
                result => {
                  commit(mutation, result.result[contractName]);
                }
            );
    },
    async contractsRegistryContract({ commit }) {
      const contractsRegistryContractId = await (await fetch("https://raw.githubusercontent.com/redstone-finance/redstone-smartweave-contracts/main/contracts-registry.address.txt")).text();
      commit('setContractsRegistryContractId', contractsRegistryContractId);
    }
  },
};
