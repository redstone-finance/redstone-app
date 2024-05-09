import tokenDetails from "./config/tokens.json";
import primaryManifest from "redstone-monorepo-github/packages/oracle-node/manifests/data-services/primary.json";
import mainManifest from "redstone-monorepo-github/packages/oracle-node/manifests/data-services/main.json";

const manifests = {
  "redstone": primaryManifest,
  "coingecko": mainManifest,
  // "redstone": mainManifest,
};

let allTokenProviders = undefined;

export function getDetailsForSymbol(symbol) {
  let detail = tokenDetails[symbol];
  if (detail) {
    detail.providers = [getAllTokenProviders()[symbol]];
  }

  return detail;
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

function getAllTokenProviders() {
  if (allTokenProviders) {
    return allTokenProviders;
  }

  const tokenProviders = {};
  for (const [provider, manifest] of Object.entries(manifests)) {
    for (const symbol of Object.keys(manifest.tokens)) {
      if (!tokenProviders[symbol]) {
        tokenProviders[symbol] = provider;
      }
    }
  }

  allTokenProviders = tokenProviders;

  return tokenProviders;
}
