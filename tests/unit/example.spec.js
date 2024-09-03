import { nextTick } from "vue";
import { mapFeedsData } from "../../src/pages/Redstone/Feeds/utils/FeedsTableDataLayer";
import { relayerMapper } from "../../src/store/feeds";
import relayerSchema from "../mocks/relayers.js";
import apiValues from "../mocks/apiValues.json";

const intiRelayerDetails = (relayers) => {
  const relayerDetails = {};
  Object.keys(relayers).forEach((layerId) => {
    Object.keys(relayers[layerId].priceFeeds).forEach((key) => {
      relayerDetails[`${layerId}_${key}`] = {
        feedId: null,
        blockTimestamp: null,
        dataFeed: null,
        loaders: {
          feedDataValue: true,
          blockTimestamp: true,
        },
      };
    });
  });
  return relayerDetails;
};

describe("FeedsTable.vue", () => {
  const relayerDetails = intiRelayerDetails({
    ...relayerSchema.standard,
    ...relayerSchema.multifeed,
  });
  const storeFeedsMap = relayerMapper({
    ...relayerSchema.standard,
    ...relayerSchema.multifeed,
  }, relayerDetails, apiValues);
  const finalViewData = mapFeedsData(storeFeedsMap);
  console.log({ finalViewData });
});
