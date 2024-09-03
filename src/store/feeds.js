import axios from "axios";
import { ethers } from "ethers";
import { isEmpty, isObject } from "lodash";
import Vue from "vue";
import networks from "@/data/networks";

function stringToBytes32(str) {
  const bytes = ethers.utils.toUtf8Bytes(str);
  const truncatedBytes = bytes.slice(0, 32);
  let hexString = ethers.utils.hexlify(truncatedBytes).slice(2);
  hexString = hexString.padEnd(64, "0");
  return "0x" + hexString;
}
const RELAYERS_SCHEMA_URL =
  "https://p6s64pjzub.execute-api.eu-west-1.amazonaws.com/dev/execute";
const RELAYERS_VALUES_URL = "https://api.redstone.finance/feeds-answers-update";
const CONTRACTS_ABI_DEFINITION = [
  "function getBlockTimestampFromLatestUpdate() view returns (uint256)",
  "function getValueForDataFeed(bytes32 dataFeedId) view returns (uint256)",
];
const CONTRACTS_ABI_DEFINITION_MULTIFEED = [
  "function getBlockTimestampFromLatestUpdate(bytes32 dataFeedId) view returns (uint256)",
  "function getValueForDataFeed(bytes32 dataFeedId) view returns (uint256)",
];

export const relayerMapper = (relayerSchema, relayersDetails, relayersValues) => {
  return Object.keys(relayerSchema).flatMap((key) => {
    const layer = relayerSchema[key];
    const networkMapped = Object.values(networks).some(
      (network) => network.chainId === layer.chain.id
    );

    if (!networkMapped) {
      console.warn(
        `Warning: Network not mapped for chain ID ${layer.chain.id}`
      );
      return [];
    }

    return Object.keys(layer.priceFeeds).map((feedId) => {
      const itemKey = `${key}_${feedId}`;
      const keyFeedTimestamp =
        relayersDetails[itemKey]?.blockTimestamp;
      const keyFeedValue = relayersDetails[itemKey]?.dataFeed;
      return {
        routeNetwork: Object.values(networks)
          .find((network) => network.chainId === layer.chain.id)
          .name.toLowerCase()
          .replace(" ", "-"),
        routeToken: feedId.toLowerCase(),
        networkId: layer.chain.id,
        feedId: feedId,
        overrides: [
          {
            type: "deviation",
            value:
              layer.updateTriggers.priceFeedsDeviationOverrides?.[feedId],
          },
          {
            type: "full",
            value: layer.priceFeeds[feedId]?.updateTriggersOverrides,
          },
        ],
        contractAddress: layer.adapterContract,
        feedAddress: isObject(layer.priceFeeds[feedId])
          ? layer.priceFeeds[feedId].priceFeedAddress
          : layer.priceFeeds[feedId],
        triggers: layer.updateTriggers,
        layerId: key,
        timestamp: keyFeedTimestamp || null,
        value: keyFeedValue || null,
        loaders: relayersDetails[itemKey]?.loaders,
        apiValues: relayersValues?.[key]?.[feedId],
      };
    });
  });
}

export default {
  namespaced: true,
  state: {
    relayerSchema: {},
    smartContracts: {},
    relayersDetails: {},
    relayersValues: {},
  },
  mutations: {
    assignRelayerSchema(state, schema) {
      state.relayerSchema = schema;
    },
    assignRelayerValues(state, values) {
      state.relayersValues = values;
    },
    assignCreatedSmartContract(state, { contract, layerId }) {
      state.smartContracts[layerId] = contract;
    },
    assignRelayerDetails(state, { key, layerId, data }) {
      if (state.relayersDetails[layerId]) {
        state.relayersDetails[layerId][key] = data;
      }
    },
    disableLoaderMutation(state, { loaderId, layerId }) {
      if (state.relayersDetails[layerId]) {
        state.relayersDetails[layerId].loaders[loaderId] = false;
      }
    },
  },
  getters: {
    allLoadersComplete: (state) => {
      return Object.values(state.relayersDetails).every((relayer) => {
        return Object.values(relayer.loaders).every(
          (loader) => loader === false
        );
      });
    },
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
      return relayerMapper(state.relayerSchema, state.relayersDetails, state.relayersValues)
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
      const abi =
        contractType === "multi-feed" || contractType === "mento"
          ? CONTRACTS_ABI_DEFINITION_MULTIFEED
          : CONTRACTS_ABI_DEFINITION;
      const contract = new ethers.Contract(contractAddress, abi, provider);
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
    async fetchBlockTimeStampMultifeed({ commit, state }, { layerId, feedId }) {
      if (
        state.relayersDetails[`${layerId}_${feedId}`].loaders.blockTimestamp ===
        false
      )
        return;
      const method =
        state.relayerSchema[layerId]?.adapterContractType === "multi-feed"
          ? this.getters["feeds/getSmartContractByLayerId"](
              layerId
            ).getBlockTimestampFromLatestUpdate(stringToBytes32(feedId))
          : this.getters["feeds/getSmartContractByLayerId"](
              layerId
            ).getBlockTimestampFromLatestUpdate();
      method
        .then((timestamp) => {
          commit("assignRelayerDetails", {
            key: "blockTimestamp",
            layerId: `${layerId}_${feedId}`,
            data: timestamp?._hex,
          });
        })
        .catch((error) => {
          // console.log("timestamp error", layerId, error);
        })
        .finally(() => {
          this.dispatch("feeds/disableLoader", {
            layerId: `${layerId}_${feedId}`,
            loaderId: "blockTimestamp",
          });
        });
    },
    async fetchValueForDataFeedMultifeed(
      { commit, state },
      { layerId, feedId }
    ) {
      if (
        state.relayersDetails[`${layerId}_${feedId}`].loaders.feedDataValue ===
        false
      )
        return;
      this.getters["feeds/getSmartContractByLayerId"](layerId)
        .getValueForDataFeed(stringToBytes32(feedId))
        .then((value) => {
          // console.log(value, feedId);
          commit("assignRelayerDetails", {
            key: "dataFeed",
            layerId: `${layerId}_${feedId}`,
            data: value?._hex,
          });
        })
        .catch((error) => {
          // console.log("timestamp error", layerId, error);
        })
        .finally(() => {
          this.dispatch("feeds/disableLoader", {
            layerId: `${layerId}_${feedId}`,
            loaderId: "feedDataValue",
          });
        });
    },
    disableLoader({ commit }, { layerId, loaderId }) {
      commit("disableLoaderMutation", { layerId, loaderId });
    },
    initializeLayerDetails({ state }) {
      Object.keys(state.relayerSchema).forEach((layerId) => {
        Object.keys(state.relayerSchema[layerId].priceFeeds).forEach((key) => {
          Vue.set(state.relayersDetails, `${layerId}_${key}`, {
            feedId: null,
            blockTimestamp: null,
            dataFeed: null,
            loaders: {
              feedDataValue: true,
              blockTimestamp: true,
            },
          });
        });
      });
    },
    async fetchRelayerSchema({ commit, state }) {
      const { data } = await axios.get(RELAYERS_SCHEMA_URL);
      commit("assignRelayerSchema", { ...data.standard, ...data.multifeed });
      if (isEmpty(state.relayersDetails)) {
        this.dispatch("feeds/initializeLayerDetails");
      }
    },
    async fetchRelayerValues({ commit, state }) {
      try {
        const { data } = await axios.get(RELAYERS_VALUES_URL);
        commit("assignRelayerValues", data);
      } catch (error) {
        console.log({ error });
      }
    },
    async initSingleContract({ state }, layerId, feedId) {
      await this.dispatch("feeds/fetchRelayerSchema");
      await this.dispatch("feeds/createSmartContract", {
        layerId: layerId,
        contractAddress: state.relayerSchema[layerId].adapterContract,
        chainId: state.relayerSchema[layerId].chain.id,
        contractType: state.relayerSchema[layerId]?.adapterContractType,
      });
      if (state.relayerSchema[layerId]?.adapterContractType === "multi-feed") {
        await this.dispatch("feeds/fetchBlockTimeStampMultifeed", {
          layerId,
          feedId,
        });
      } else {
        await this.dispatch("feeds/fetchBlockTimeStamp", layerId);
      }

      await this.dispatch("feeds/fetchValueForDataFeed", {
        layerId: layerId,
        feedId: feedId,
      });
    },
    async createContractAndFetchValues({ state }, { relayerId, feedId }) {
      await this.dispatch("feeds/createSmartContract", {
        layerId: relayerId,
        contractAddress: state.relayerSchema[relayerId].adapterContract,
        chainId: state.relayerSchema[relayerId].chain.id,
        contractType: state.relayerSchema[relayerId]?.adapterContractType,
      });
      if (!state.relayersValues?.[relayerId]?.[feedId]?.timestamp) {
        await this.dispatch("feeds/fetchBlockTimeStampMultifeed", {
          layerId: relayerId,
          feedId,
        });
      }
      if (!state.relayersValues?.[relayerId]?.[feedId]?.value) {
        await this.dispatch("feeds/fetchValueForDataFeedMultifeed", {
          layerId: relayerId,
          feedId,
        });
      }
    },
    async createContractAndFetchValuesForRelayer({ state }, relayerId) {
      await this.dispatch("feeds/createSmartContract", {
        layerId: relayerId,
        contractAddress: state.relayerSchema[relayerId].adapterContract,
        chainId: state.relayerSchema[relayerId].chain.id,
        contractType: state.relayerSchema[relayerId]?.adapterContractType,
      });
      Object.keys(state.relayerSchema[relayerId]?.priceFeeds).forEach(
        async (feedId) => {
          if (!state.relayersValues?.[relayerId]?.[feedId]?.timestamp) {
            await this.dispatch("feeds/fetchBlockTimeStampMultifeed", {
              layerId: relayerId,
              feedId,
            });
          }
        }
      );

      Object.keys(state.relayerSchema[relayerId]?.priceFeeds).forEach(
        async (feedId) => {
          if (!state.relayersValues?.[relayerId]?.[feedId]?.value) {
            await this.dispatch("feeds/fetchValueForDataFeedMultifeed", {
              layerId: relayerId,
              feedId,
            });
          }
        }
      );
    },
    async initSchema({ state }) {
      if (!isEmpty(state.relayerSchema)) return;
      await this.dispatch("feeds/fetchRelayerSchema");
    },
    async initValues({ state }) {
      await Object.keys(state.relayerSchema).forEach(async (key) => {
        await this.dispatch(
          "feeds/createContractAndFetchValuesForRelayer",
          key
        );
      });
    },
  },
};
