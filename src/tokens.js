import Arweave from 'arweave';
import { SmartWeaveNodeFactory } from 'redstone-smartweave';
import axios from 'axios';
import constants from "@/constants";
import tokenDetails from "redstone-node/dist/src/config/tokens.json";
import rapidManifest from "redstone-node/dist/manifests/rapid.json";
import stocksManifest from "redstone-node/dist/manifests/stocks.json";
import mainManifest from "redstone-node/dist/manifests/main.json";

const manifests = {
  "redstone-rapid": rapidManifest,
  "redstone-stocks": stocksManifest,
  "redstone": mainManifest,
};

export function getDetailsForSymbol(symbol) {
  const details = tokenDetails[symbol];
  if (details) {
    return details;
  } else if (symbol.startsWith("0x")) {
    return {
      logoURI: "https://redstone.finance/assets/img/redstone-logo-full.svg",
      name: `custom-url-${symbol}`,
      url: "https://redstone.finance/",
      tags: [
        "custom-urls"
      ],
      providers: []
    }
  }
}

export function getOrderedProviders() {
  return Object.keys(manifests);
}

const fetchCustomUrlManifest = async () => {
  const arweave = Arweave.init({
    host: constants.arweaveUrl,
    protocol: "https",
    port: 443,
  });
  
  const smartweave = SmartWeaveNodeFactory
    .memCachedBased(arweave)
    .build();

  const response = await axios.get(constants.smartweaveContractAddressesUrl);
  const oracleRegistryContractId = response.data['oracle-registry'];
  
  const oracleRegistryContract = smartweave.contract(oracleRegistryContractId);
  
  const provider = (await oracleRegistryContract.viewState({
      function: "getDataFeedDetailsById",
      data: {
          id: 'redstone-custom-urls-demo'
      }
  })).result;
  return await (await fetch(`https://${constants.arweaveUrl}/${provider.manifestTxId}`)).json();
}

export async function getAllSupportedTokens() {
  const customManifest = await fetchCustomUrlManifest();
  const allTokens = {};
  Object.assign(manifests, { 'custom-urls': { tokens: customManifest, defaultSource: ['custom-urls'] } });
  for (const manifest of Object.values(manifests)) {
    for (const symbol of Object.keys(manifest.tokens)) {
      if (!allTokens[symbol]) {
        allTokens[symbol] = getDetailsForSymbol(symbol);
      }
    }
  }

  return allTokens;
}
