import axios from "axios";
import constants from "@/constants";
import tokenDetails from "redstone-monorepo-github/packages/oracle-node/src/config/tokens.json";
import mainManifest from "redstone-monorepo-github/packages/oracle-node/manifests/data-services/main.json";

const manifests = {
  "redstone": mainManifest,
};

export const CUSTOM_URLS_NODE_1_ID = "redstone-custom-urls-1";
export const CUSTOM_URLS_NODE_2_ID = "redstone-custom-urls-2";

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
      providers: [ CUSTOM_URLS_NODE_1_ID, CUSTOM_URLS_NODE_2_ID ]
    }
  }
}

export async function getOrderedProviders() {
  const manifestsWithCustom = { ...manifests };
  const customManifest = await fetchCustomUrlManifest();
  Object.assign(manifestsWithCustom, { 'redstone-custom-urls-1': {} })
  return Object.keys(manifestsWithCustom);
}

const fetchCustomUrlManifest = async () => {
  const params = new URLSearchParams([["id", constants.oracleRegistryAddress]]);
  const response = await axios.get(constants.smartweaveDreNodeUlr, {
    params,
  });
  const contractState = response.data.state;
  const manifestTxId = contractState.dataFeeds[constants.customUrlDataServiceId].manifestTxId;
  return (await axios.get(`https://${constants.arweaveUrl}/${manifestTxId}`)).data;
}

export async function getAllSupportedTokens() {
  const manifestsWithCustom = { ...manifests };
  const customManifest = await fetchCustomUrlManifest();
  Object.assign(manifestsWithCustom, { 'redstone-custom-urls-1': customManifest });
  const allTokens = {};
  for (const manifest of Object.values(manifestsWithCustom)) {
    for (const symbol of Object.keys(manifest.tokens)) {
      if (!allTokens[symbol]) {
        allTokens[symbol] = getDetailsForSymbol(symbol);
        if (symbol.startsWith("0x")) {
          allTokens[symbol].comment = manifest.tokens[symbol].comment;
        }
      } else {
        if (symbol.startsWith("0x") && !allTokens[symbol].tags.includes("custom-urls")) {
          allTokens[symbol].tags.push("custom-urls");
        }
      }
    }
  }

  return allTokens;
}
