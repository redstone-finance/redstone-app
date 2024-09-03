import {
  hexToDate,
  parseUnixTime,
  getTimeUntilNextHeartbeat,
  timeUntilDate,
  findNearestCronDate,
} from "@/core/timeHelpers";
import { getUnixTime } from "date-fns";

import networks from "@/data/networks.json";
import images from "@/data/symbols.json";

export const mapFeedsData = (storeFeedsArray) => {
  if (storeFeedsArray?.length === 0) return [];
  return storeFeedsArray.map((item) => {
    const answerCurrency = item.feedId.split("/")[1]
    return {
      answer: parseToDecimal(item.value),
      feed: hasSlash(item.feedId) ? item.feedId : item.feedId + "/USD",
      timestamp: getTimestampValue(item),
      heartbeat: getHeartbeatValue(item),
      deviation: getDeviationValue(item),
      crypto_token: removeSeparators(item.feedId),
      token_image: getTokenImage(item.feedId),
      popularity: getPopularityValue(item),
      contract_address: item.contractAddress,
      cron: item.triggers.cron,
      layer_id: item.feedId,
      token: item.feedId,
      relayerId: item.layerId,
      feed_address: item.feedAddress,
      loaders: item.loaders,
      apiValues: item.apiValues,
      contractAnswer: parseToCurrency(parseToDecimal(item.value), answerCurrency),
      apiAnswer: parseToCurrency(item.apiValues?.value * 100000000, answerCurrency),
      network: {
        id: item.networkId,
        name: findNetworkName(item.networkId),
        image: findNetworkImage(item.networkId),
      },
      explorer: {
        name: findNetworkName(item.networkId),
        explorerUrl: findExplorer(item.networkId),
      },
    };
  });
};

const resolveTimestampForHeartbeat = (item) =>
  item?.apiValues?.timestamp != null
    ? "0x" +
      getUnixTime(new Date(item?.apiValues?.timestamp))
        .toString(16)
        .padStart(8, "0")
    : item?.timestamp;

const getHeartbeatValue = (item) =>
  getTimeUntilNextHeartbeat(
    resolveTimestampForHeartbeat(item),
    resolveTimeSinceLastUpdateInMilliseconds(item)
  ) || JSON.stringify(item.triggers.cron);

const getTimestampValue = (item) => ({
  parsed: parseUnixTime(item.timestamp),
  raw: item.timestamp,
  date: hexToDate(item.timestamp),
});

const getDeviationValue = (item) =>
  resolveDeviationPercentage(item) != "n/a"
    ? resolveDeviationPercentage(item) + "%"
    : "n/a";

const getPopularityValue = (item) =>
  `${networkOrder().findIndex((network) => item.networkId === network.chainId)}_${cryptoOrder().findIndex((crypto) => removeSeparators(item.feedId) === crypto.token)}`;

const parseToDecimal = (hexValue) => {
  hexValue = hexValue?.replace(/^0x/, "");
  return parseInt(hexValue, 16);
};

export const hasSlash = (string) => {
  return string.indexOf("/") >= 0;
};

const removeSeparators = (string) => {
  const noSlash = string.split("/")[0];
  const noUnder = noSlash.split("_")[0];
  const noSeparators = noUnder.split("-")[0];
  return noSeparators;
};

 export const findNetworkName = (networkId) => {
  return Object.values(networks).find(
    (network) => network.chainId === networkId
  ).name;
};

export const findNetworkImage = (networkId) => {
  return Object.values(networks).find(
    (network) => network.chainId === networkId
  ).iconUrl;
};

const findNetwork = (networkId) => {
  return Object.values(networks).find(
    (network) => network.chainId === networkId
  );
};

const findExplorer = (networkId) => {
  const hasExplorer = Object.values(networks).some(
    (network) => network.chainId === networkId
  );
  if (!hasExplorer) console.warn("Missing explorer for chain:", networkId);
  return Object.values(networks).find(
    (network) => network.chainId === networkId
  ).explorerUrl;
};

const transformHexString = (str) => {
  if (str == null) return "no data";
  if (str?.length <= 10) return str;
  return `${str?.slice(0, 7)} . . . ${str?.slice(-4)}`;
};

export const getTokenImage = (token) => {
  const idealMatchImg = images.find((image) => token === image.token);
  const secondMatch = images.find(
    (image) => token.split("/")[0] === image.token
  );
  return (
    idealMatchImg ||
    secondMatch || {
      name: "placeholder",
      imageName: "placeholder.png",
      token: "placeholder",
    }
  );
};

export const createNetworkUrlParam = (networkName) => {
  return networkName.toLowerCase().replace(" ", "-");
};

export const processTokenData = (data) => {
  const tokenMap = new Map();
  data.forEach(({ token, network }) => {
    const tokens = token.includes("/") ? token.split("/") : [token];
    tokens.forEach((t) => {
      if (!tokenMap.has(network)) {
        tokenMap.set(network, new Set());
      }
      tokenMap.get(network).add(t);
    });
  });
  const processedData = [];
  for (const [network, tokens] of tokenMap.entries()) {
    tokens.forEach((token) => {
      processedData.push({ token, network });
    });
  }
  return processedData;
};

const resolveDeviationPercentage = (item) => {
  const triggerOverride = item.overrides.filter(
    (override) => override.value !== undefined
  );
  const deviationPercentage =
    triggerOverride.length > 0
      ? triggerOverride[0]?.value ||
        triggerOverride[0].value.deviationPercentage
      : item.triggers.deviationPercentage;
  return deviationPercentage
    ? deviationPercentage?.deviationPercentage || deviationPercentage
    : "n/a";
};

const resolveTimeSinceLastUpdateInMilliseconds = (item) => {
  const triggerOverride = item.overrides.filter(
    (override) => override.value !== undefined
  );
  const timeSinceLastUpdateInMilliseconds =
    triggerOverride.length > 0 &&
    triggerOverride[0]?.type === "full" &&
    triggerOverride[0]?.value?.timeSinceLastUpdateInMilliseconds !== undefined
      ? triggerOverride[0].value.timeSinceLastUpdateInMilliseconds
      : item.triggers.timeSinceLastUpdateInMilliseconds;

  return timeSinceLastUpdateInMilliseconds;
};

export const nearestCron = (cronString) => {
  if (cronString == null) {
    return 0;
  }
  try {
    const parsedCron = JSON.parse(cronString);
    const nearestDate = findNearestCronDate(parsedCron);
    const timeUntil = timeUntilDate(nearestDate);
    return timeUntil;
  } catch (error) {
    console.error("Error parsing cron string:", error);
    return "Invalid cron";
  }
};

export const heartbeatIsNumber = (value) => {
  return !isNaN(value);
};

export const parseToCurrency = (decimalValue, currency) => {
  const value = decimalValue / Math.pow(10, 8);
  let formatterOptions = {
    style: "currency",
    currency: "USD",
  };
  if (value >= 1) {
    formatterOptions.minimumFractionDigits = 3;
    formatterOptions.maximumFractionDigits = 3;
  } else {
    formatterOptions.notation = "standard";
    formatterOptions.minimumSignificantDigits = 4;
    formatterOptions.maximumSignificantDigits = 4;
  }
  const formatter = new Intl.NumberFormat("en-US", formatterOptions);
  let formattedValue = formatter.format(value);
  if (currency && currency !== "USD") {
    switch (currency) {
      case "EUR":
        formattedValue = formattedValue.replace("$", "€");
        break;
      case "ETH":
        formattedValue = formattedValue.replace("$", "Ξ");
        break;
      default:
        formattedValue = formattedValue.replace("$", currency);
    }
  }
  return formattedValue;
};

const networkOrder = () => {
  return Object.values(networks);
};
const cryptoOrder = () => {
  return Object.values(images);
};
