import tokenDetails from "./config/tokens.json";
import primaryManifest from "redstone-monorepo-github/packages/oracle-node/manifests/data-services/main.json";
import mainManifest from "redstone-monorepo-github/packages/oracle-node/manifests/data-services/main.json";

const manifests = {
  "redstone-primary-prod": primaryManifest,
  "coingecko": mainManifest,
};

export function getDetailsForSymbol(symbol) {
  return tokenDetails[symbol];
}

export async function getOrderedProviders() {
  return Object.keys(manifests);
}


export async function getAllSupportedTokens() {
  const allTokens = {};
  for (const manifest of Object.values(manifests)) {
    for (const symbol of Object.keys(manifest.tokens)) {
      if (!allTokens[symbol]) {
        allTokens[symbol] = getDetailsForSymbol(symbol);
      }
    }
  }

  return allTokens;
}
