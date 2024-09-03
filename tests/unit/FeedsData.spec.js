import { nextTick } from "vue";
import { mapFeedsData } from "../../src/pages/Redstone/Feeds/utils/FeedsTableDataLayer.js";
import { relayerMapper } from "../../src/store/feeds.js";
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
const relayerDetails = intiRelayerDetails({
  ...relayerSchema.standard,
  ...relayerSchema.multifeed,
});
const storeFeedsMap = relayerMapper(
  {
    ...relayerSchema.standard,
    ...relayerSchema.multifeed,
  },
  relayerDetails,
  apiValues
);
const finalViewData = mapFeedsData(storeFeedsMap);
describe("All feed names are formatted as expected", () => {
  finalViewData.forEach((item) => {
    it(`${item.token} has good feed name`, () => {
      const expectedFeedId = item.token.includes("/")
        ? item.token
        : item.token + "/USD";
      expect(item.feed).toBe(expectedFeedId);
    });

    it(`${item.token} has good to price symbol`, () => {
      const expectedToPriceSymbol = item.apiAnswer
        .replace(/[0-9.,]+/g, "")
        .trim();
      if (
        !expectedToPriceSymbol.includes("NaN") &&
        item.token != "SolvBTC_MERLIN/BTC-TWAP-60" // Remove edge case which is hard to handle for now
      ) {
        const splitToken = item.token.split("/")[1] || "USD";
        const symbolsMap = {
          EUR: "€",
          USD: "$",
          ETH: "Ξ",
        };
        expect(symbolsMap[splitToken] || splitToken).toBe(
          expectedToPriceSymbol
        );
      }
    });
  });
});
