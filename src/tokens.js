import tokenDetails from "./config/tokens.json";
import mainManifest from "redstone-monorepo-github/packages/oracle-node/manifests/data-services/main.json";

const manifests = {
  "redstone": mainManifest,
};

export function getDetailsForSymbol(symbol) {
  return tokenDetails[symbol];
}

export async function getOrderedProviders() {
  const manifestsWithCustom = { ...manifests };
  return Object.keys(manifestsWithCustom);
}


export async function getAllSupportedTokens() {
  const manifestsWithCustom = { ...manifests };
  const allTokens = {};
  for (const manifest of Object.values(manifestsWithCustom)) {
    for (const symbol of Object.keys(manifest.tokens)) {
      if (!allTokens[symbol]) {
        allTokens[symbol] = getDetailsForSymbol(symbol);
      }
    }
  }

  return allTokens;
}
