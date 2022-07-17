import axios from "axios";
import ArweaveService from "redstone-node/dist/src/arweave/ArweaveService";
import constants from "@/constants";
import tokenDetails from "redstone-node-github/src/config/tokens.json";
import rapidManifest from "redstone-node-github/manifests/rapid.json";
import stocksManifest from "redstone-node-github/manifests/stocks.json";
import mainManifest from "redstone-node-github/manifests/main.json";

const manifests = {
  "redstone-rapid": rapidManifest,
  "redstone-stocks": stocksManifest,
  "redstone": mainManifest,
};

export const CUSTOM_URLS_NODE_1_ID = "redstone-custom-urls-1";

export function getDetailsForSymbol(symbol) {
  const details = tokenDetails[symbol];
  if (details) {
    return details;
  } else if (symbol.startsWith("0x")) {
    return {
      logoURI: "https://redstone.finance/assets/img/redstone-logo-full.svg",
      name: symbol,
      url: "https://redstone.finance/",
      tags: [
        "custom-urls"
      ],
      providers: [ CUSTOM_URLS_NODE_1_ID ]
    }
  }
}

export async function getOrderedProviders() {
  const manifestsWithCustom = { ...manifests };
  const customManifest = await fetchCustomUrlManifest();
  Object.assign(manifestsWithCustom, { 'redstone-custom-urls': customManifest });
  Object.assign(manifestsWithCustom, { 'redstone-custom-urls-1': {} })
  return Object.keys(manifestsWithCustom);
}

const fetchCustomUrlManifest = async () => {
  const arweaveService = new ArweaveService();
  const contractState = await arweaveService.getOracleRegistryContractState();
  const manifestTxId = contractState.dataFeeds[constants.customUrlDataFeedId].manifestTxId;
  return (await axios.get(`https://${constants.arweaveUrl}/${manifestTxId}`)).data;
}

export async function getAllSupportedTokens() {
  const manifestsWithCustom = { ...manifests };
  const customManifest = await fetchCustomUrlManifest();
  Object.assign(manifestsWithCustom, { 'redstone-custom-urls': customManifest });
  Object.assign(manifestsWithCustom, { 'redstone-custom-urls-1': customManifest });
  const allTokens = {};
  for (const manifest of Object.values(manifestsWithCustom)) {
    for (const symbol of Object.keys(manifest.tokens)) {
      if (!allTokens[symbol]) {
        allTokens[symbol] = getDetailsForSymbol(symbol);
        if (symbol.startsWith("0x")) {
          allTokens[symbol].comment = manifest.tokens[symbol].comment;
        }
      }
    }
  }

  return allTokens;
}
