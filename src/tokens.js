import tokenDetails from "./config/tokens.json";
import primaryManifest from "redstone-monorepo-github/packages/oracle-node/manifests/data-services/primary.json";
import mainManifest from "redstone-monorepo-github/packages/oracle-node/manifests/data-services/main.json";

const manifests = {
  "coingecko": mainManifest,
  "redstone": primaryManifest
};

let symbolDetails = undefined;

export function getDetailsForSymbol(symbol) {
  return getAllSymbolDetails()[symbol];
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

function getAllSymbolDetails() {
  if (symbolDetails) {
    return symbolDetails;
  }

  const tokenProviders = {};
  for (const [provider, manifest] of Object.entries(manifests)) {
    for (const symbol of Object.keys(manifest.tokens)) {
      if (tokenDetails[symbol]) {
        tokenProviders[symbol] = tokenDetails[symbol];
        tokenProviders[symbol].providers = [provider];
      }
    }
  }

  symbolDetails = tokenProviders;

  return tokenProviders;
}
