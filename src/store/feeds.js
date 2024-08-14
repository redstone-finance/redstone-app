import axios from "axios";
import { ethers } from "ethers";
import { isEmpty, isObject } from "lodash";
import Vue from "vue";
import networks from "@/data/networks";

const RELAYERS_SCHEMA_URL =
  "https://p6s64pjzub.execute-api.eu-west-1.amazonaws.com/dev/execute";
const CONTRACTS_ABI_DEFINITION = [
  "function getBlockTimestampFromLatestUpdate() view returns (uint256)",
  "function getValueForDataFeed(bytes32 dataFeedId) view returns (uint256)",
  "function getValuesForDataFeeds(bytes32[] requestedDataFeedIds) view returns (uint256[])",
  "function getDataFeedId() view returns (bytes32)",
  "function getDataFeedIds() view returns (bytes32[])",
];
const CONTRACTS_ABI_DEFINITION_MULTIFEED = [
  "function getBlockTimestampFromLatestUpdate(bytes32 dataFeedId) view returns (uint256)",
  "function getValueForDataFeed(bytes32 dataFeedId) view returns (uint256)",
  "function getValuesForDataFeeds(bytes32[] requestedDataFeedIds) view returns (uint256[])",
  "function getDataFeedId() view returns (bytes32)",
  "function getDataFeedIds() view returns (bytes32[])",
];

export default {
  namespaced: true,
  state: {
    relayerSchema: {},
    smartContracts: {},
    relayersDetails: {},
  },
  mutations: {
    assignRelayerSchema(state, schema) {
      state.relayerSchema = schema;
    },
    assignCreatedSmartContract(state, { contract, layerId }) {
      state.smartContracts[layerId] = contract;
    },
    assignRelayerDetails(state, { key, layerId, data }) {
      state.relayersDetails[layerId][key] = data;
    },
    disableLoaderMutation(state, { loaderId, layerId }) {
      state.relayersDetails[layerId].loaders[loaderId] = false;
    },
  },
  getters: {
    getSmartContractByLayerId: (state) => (layerId) => {
      const contract = state.smartContracts[layerId];
      if (contract == null)
        throw Error("No contract assigned to layer id:", layerId);
      return contract;
    },
    hasMultipleFeeds: (state) => (layerId) => {
      return state.relayerSchema[layerId].priceFeeds.length > 1;
    },
    combinedFeedsWithDetailsArray(state, getters) {
      return Object.keys(state.relayerSchema).flatMap((key) => {
        const layer = state.relayerSchema[key];
        const networkMapped = Object.values(networks).some(
          (network) => network.chainId === layer.chain.id
        );

        if (!networkMapped) {
          console.warn(
            `Warning: Network not mapped for chain ID ${layer.chain.id}`
          );
          return [];
        }

        return Object.keys(layer.priceFeeds).map((feedId) => ({
          routeNetwork: Object.values(networks)
            .find((network) => network.chainId === layer.chain.id)
            .name.toLowerCase()
            .replace(" ", "-"),
          routeToken: feedId.toLowerCase(),
          networkId: layer.chain.id,
          feedId: feedId,
          contractAddress: layer.adapterContract,
          feedAddress: isObject(layer.priceFeeds[feedId])
            ? layer.priceFeeds[feedId].priceFeedAddress
            : layer.priceFeeds[feedId],
          triggers: layer.updateTriggers,
          layerId: key,
          foo: state.relayersDetails[`${key}_${layer.priceFeeds[feedId].priceFeedAddress}`],
          timestamp: state.relayersDetails[key]?.blockTimestamp ||  state.relayersDetails[`${key}_${layer.priceFeeds[feedId].priceFeedAddress}`?.blockTimestamp],
          loaders: state.relayersDetails[key]?.loaders || state.relayersDetails[`${key}_${layer.priceFeeds[feedId].priceFeedAddress}`]?.loaders,
        }));
      });
    },
  },
  actions: {
    createSmartContract(
      { commit, state },
      { layerId, contractAddress, chainId, contractType }
    ) {
      const contractNetwork = Object.values(networks).find(
        (network) => network.chainId === chainId
      );
      const provider = new ethers.providers.JsonRpcProvider(
        contractNetwork.rpcUrl
      );
      console.log(contractType)
      const abi = contractType === 'multi-feed' ? CONTRACTS_ABI_DEFINITION_MULTIFEED : CONTRACTS_ABI_DEFINITION
      const contract = new ethers.Contract(
        contractAddress,
        abi,
        provider
      );
      commit("assignCreatedSmartContract", { contract, layerId });
    },
    async fetchDataFeedId({ commit, state }, layerId) {
      const api = this.getters["feeds/getSmartContractByLayerId"](layerId);
      try {
        var id = await api.getDataFeedId();
      } catch (error) {
        // console.log('error, id, single', layerId, error)
      }
      try {
        var ids = await api.getDataFeedIds();
      } catch (error) {
        this.dispatch("feeds/disableLoader", {
          layerId,
          loaderId: "feedDataValue",
        });
      }
      commit("assignRelayerDetails", {
        key: "feedId",
        layerId,
        data: id || ids,
      });
      this.dispatch("feeds/disableLoader", { layerId, loaderId: "feedId" });
    },
    async fetchBlockTimeStamp({ commit, state }, layerId) {
      this.getters["feeds/getSmartContractByLayerId"](layerId)
        .getBlockTimestampFromLatestUpdate()
        .then((timestamp) => {
          commit("assignRelayerDetails", {
            key: "blockTimestamp",
            layerId,
            data: timestamp._hex,
          });
        })
        .catch((error) => {
          // console.log('timestamp error', layerId, error)
        })
        .finally(() => {
          this.dispatch("feeds/disableLoader", {
            layerId,
            loaderId: "blockTimestamp",
          });
        });
    },
    async fetchBlockTimeStampMultifeed({ commit, state }, {layerId, feedId}) {

      this.getters["feeds/getSmartContractByLayerId"](layerId)
        .getBlockTimestampFromLatestUpdate(feedId)
        .then((timestamp) => {
          console.log({timestamp,  layerId:`${layerId}_${feedId}`})
          commit("assignRelayerDetails", {
            key: "blockTimestamp",
            layerId:`${layerId}_${feedId}`,
            data: timestamp._hex,
          });
        })
        .catch((error) => {
          console.log('timestamp error', layerId, error)
        })
        .finally(() => {
          this.dispatch("feeds/disableLoader", {
            layerId: `${layerId}_${feedId}`,
            loaderId: "blockTimestamp",
          });
        });
    },
    async fetchValueForDataFeed({ commit, state }, { layerId, feedId }) {
      if (feedId == null) return;
      const api = this.getters["feeds/getSmartContractByLayerId"](layerId);
      try {
        var value = await api.getValueForDataFeed(feedId);
      } catch (error) {
        // console.log({ error, layerId }, 'single')
      }
      if (isEmpty(value)) {
        try {
          const values = await api.getValuesForDataFeeds(feedId);
          commit("assignRelayerDetails", {
            key: "dataFeed",
            layerId,
            data: values.arguments,
          });
          this.dispatch("feeds/disableLoader", {
            layerId,
            loaderId: "feedDataValue",
          });
        } catch (error) {
          // console.log({ error, layerId }, 'multiple')
        }
      } else {
        commit("assignRelayerDetails", {
          key: "dataFeed",
          layerId,
          data: value.arguments,
        });
        this.dispatch("feeds/disableLoader", {
          layerId,
          loaderId: "feedDataValue",
        });
      }
      this.dispatch("feeds/disableLoader", {
        layerId,
        loaderId: "feedDataValue",
      });
    },
    async fetchFeedIdAndValue({ state }, { layerId }) {
      this.dispatch("feeds/fetchDataFeedId", layerId).then(() => {
        const feedId = state.relayersDetails[layerId]?.feedId;
        this.dispatch("feeds/fetchValueForDataFeed", { layerId, feedId });
      });
    },
    disableLoader({ commit }, { layerId, loaderId }) {
      commit("disableLoaderMutation", { layerId, loaderId });
    },
    initializeLayerDetails({ state }) {
      Object.keys(state.relayerSchema).forEach((layerId) => {
        // Using Vue.set to make values reactive
        if(state.relayerSchema[layerId].adapterContractType !== 'multi-feed'){
          Vue.set(state.relayersDetails, layerId, {
            feedId: null,
            blockTimestamp: null,
            dataFeed: null,
            loaders: {
              feedId: true,
              feedDataValue: true,
              blockTimestamp: true,
            },
          });
        }else{
          Object.values(state.relayerSchema[layerId].priceFeeds).forEach(address => {
            Vue.set(state.relayersDetails, `${layerId}_${address.priceFeedAddress}`, {
              feedId: null,
              blockTimestamp: null,
              dataFeed: null,
              loaders: {
                feedId: true,
                feedDataValue: true,
                blockTimestamp: true,
              },
          })
          })
        }
      });
    },
    async fetchRelayerSchema({ commit, state }) {
      const { data } = await axios.get(RELAYERS_SCHEMA_URL);
      commit("assignRelayerSchema", { ...data.standard, ...data.multifeed });
      if (isEmpty(state.relayersDetails)) {
        this.dispatch("feeds/initializeLayerDetails");
      }
    },
    async initSingleContract({ state }, layerId, feedId) {
      await this.dispatch("feeds/fetchRelayerSchema");
      await this.dispatch("feeds/createSmartContract", {
        layerId: layerId,
        contractAddress: state.relayerSchema[layerId].adapterContract,
        chainId: state.relayerSchema[layerId].chain.id,
        contractType: state.relayerSchema[layerId].adapterContractType
      });
      if(state.relayerSchema[layerId].adapterContractType === 'multi-feed'){
        await this.dispatch("feeds/fetchBlockTimeStampMultifeed", {layerId, feedId});
      }else{
        await this.dispatch("feeds/fetchBlockTimeStamp", layerId);
      }
     
      await this.dispatch("feeds/fetchFeedIdAndValue", {
        layerId: layerId,
        feedId: state.relayersDetails[layerId]?.feedId,
      });
    },
    async init({ state }) {
      if (!isEmpty(state.relayerSchema)) return;
      await this.dispatch("feeds/fetchRelayerSchema");
      Object.keys(state.relayerSchema).forEach(async (key) => {
        await this.dispatch("feeds/createSmartContract", {
          layerId: key,
          contractAddress: state.relayerSchema[key].adapterContract,
          chainId: state.relayerSchema[key].chain.id,
          contractType: state.relayerSchema[key].adapterContractType
        });
        if(state.relayerSchema[key].adapterContractType === 'multi-feed'){
          Object.values(state.relayerSchema[key].priceFeeds).forEach(async address => {
            if(address.priceFeedAddress){
              await this.dispatch("feeds/fetchBlockTimeStampMultifeed", {layerId: key, feedId: address.priceFeedAddress});
            }
          })
        }else{
          await this.dispatch("feeds/fetchBlockTimeStamp", key);
        }
        await this.dispatch("feeds/fetchFeedIdAndValue", {
          layerId: key,
          feedId: state.relayersDetails[key]?.feedId,
        });
      });
    },
  },
};
