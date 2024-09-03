import networks from "@/data/networks.json";
import images from "@/data/symbols.json";
import {
  parseUnixTime,
  hexToDate,
  getTimeUntilNextHeartbeat,
  findNearestCronDate,
  timeUntilDate,
} from "@/core/timeHelpers";

export const findNetworkName = (networkId) => {
  return Object.values(networks).find(
    (network) => network.chainId === networkId
  )?.name;
};

export const findNetworkImage = (networkId) => {
  return Object.values(networks).find(
    (network) => network.chainId === networkId
  )?.iconUrl;
};

export const findNetwork = (networkId) => {
  return Object.values(networks).find(
    (network) => network.chainId === networkId
  );
};

export const findExplorer = (networkId) => {
  const network = Object.values(networks).find(
    (network) => network.chainId === networkId
  );
  if (!network) {
    console.warn("Missing explorer for chain:", networkId);
    return null;
  }
  return network;
};

export const getFirstPart = (string) => {
  const noSlash = string.split("/")[0];
  const noUnder = noSlash.split("_")[0];
  const noDash = noUnder.split("-")[0];
  return noDash;
};

export const getTokenImage = (token) => {
  const idealMatchImg = images.find((image) => token === image.token);
  const secondMatch = images.find(
    (image) => token.indexOf(image.token) >= 0
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

export const hasSlash = (string) => {
  return string.indexOf("/") >= 0;
};

export const stripAdditionalFeedInfo = (string) => {
  return string;
};

export const findUseRatioProp = (token) => {
  const idealMatch = images.find((image) => token === image.token);
  const secondMatch = images.find(
    (image) => token.indexOf(image.token) >= 0
  );
  return idealMatch?.useEthRatio || secondMatch?.useEthRatio;
};

export const resolveDeviationPercentage = (item) => {
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

export const resolveTimeSinceLastUpdateInMilliseconds = (item) => {
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

export const parseToDecimal = (hexValue) => {
  hexValue = hexValue?.replace(/^0x/, "");
  return parseInt(hexValue, 16);
};

export const parseToUsd = (decimalValue, parseToEth) => {
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
  if (parseToEth) {
    formattedValue = formattedValue.replace("$", "Ξ");
  }

  return formattedValue;
};

export const nearestCron = (cronString) => {
  if (cronString == null) {
    console.warn("Cron string is undefined or null");
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

export const transformFeed = (item) => {
  if (item?.feedId) {
    const useEthRatio = findUseRatioProp(item.feedId);
    return {
      answer: parseToDecimal(item.value),
      feed: hasSlash(item.feedId)
        ? stripAdditionalFeedInfo(item.feedId)
        : stripAdditionalFeedInfo(item.feedId) + (useEthRatio ? "/ETH" : "/USD"),
      network: {
        id: item.networkId,
        name: findNetworkName(item.networkId),
        image: findNetworkImage(item.networkId),
      },
      contract_address: item.contractAddress,
      timestamp: {
        parsed: parseUnixTime(item.timestamp),
        raw: item.timestamp,
        date: hexToDate(item.timestamp),
      },
      layer_id: item.feedId,
      heartbeat:
        getTimeUntilNextHeartbeat(
          item?.timestamp,
          resolveTimeSinceLastUpdateInMilliseconds(item)
        ) || JSON.stringify(item.triggers.cron),
      deviation:
        resolveDeviationPercentage(item) != "n/a"
          ? resolveDeviationPercentage(item) + "%"
          : "n/a",
      cron: item.triggers.cron,
      token: item.feedId,
      useEthRatio,
      relayerId: item.layerId,
      feed_address: item.feedAddress,
      crypto_token: getFirstPart(item.feedId),
      token_image: getTokenImage(item.feedId),
      loaders: item.loaders,
      explorer: {
        name: findNetworkName(item.networkId),
        explorerUrl: findExplorer(item.networkId)?.explorerUrl,
      },
      value: item.value,
    };
  } else {
    return false;
  }
};