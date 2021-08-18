const axios = require("axios");
import dummyWallet from "@/dummy-wallet.json";
import constants from "@/constants";
import utils from "@/utils";
import Arweave from 'arweave';
import {
  CacheableExecutorFactory,
  CacheableStateEvaluator,
  ContractDefinitionLoader,
  HandlerBasedSwcClient,
  HandlerExecutorFactory,
  LexicographicalInteractionsSorter,
  MemCache
} from 'smartweave/lib/v2';
import LocalStorageCache from "@/cache/cache";
import LocalStorageBlockHeightCache from "@/cache/block-height-cache";
import LocalStorageContractInteractionsLoaderCache from "@/cache/contract-interactions-loader-cache";
import Vue from 'vue';


export default {
  namespaced: true,
  state: {
    arweave: null,
    swcClient: null,
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
    setSwcClient(state, client) {
      state.swcClient = client;
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
        .then(() => { return dispatch('swcClient') })
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
    swcClient({ commit, state }) {
      const cacheableExecutorFactory = new CacheableExecutorFactory(state.arweave, new HandlerExecutorFactory(state.arweave), new MemCache());

      const swcClient = new HandlerBasedSwcClient(
        state.arweave,
        new ContractDefinitionLoader(state.arweave, new LocalStorageCache()),
        new LocalStorageContractInteractionsLoaderCache(state.arweave),
        cacheableExecutorFactory,
        new CacheableStateEvaluator(state.arweave, new LocalStorageBlockHeightCache()),
        new LexicographicalInteractionsSorter(state.arweave));
    
      console.log('swcClient created');

      commit("setSwcClient", swcClient);
    },  
    updateProvider({ commit, state }, { id, key, value}) {
      let providers = state.providers;
      Vue.set(providers[id], key, value);
      commit('setProviders', providers);
    },
    async fetchProviders({ commit, state, dispatch }) {

      let providersData = (await state.swcClient.viewState(
        state.providersRegistryContractId,
        {
          function: "providersData",
          data: {
            eagerManifestLoad: true
          }
        },
        dummyWallet
      )).result;
      
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
    providersRegistryContract({ commit, state }, {contractName, mutation}) {
      return state.swcClient.viewState(
        state.contractsRegistryContractId,
        {
          function: "contractsCurrentTxId",
          data: {
            contractNames: [contractName]
          }
        },
        dummyWallet
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
