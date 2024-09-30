import tokenConfig from "./config/tokens.json";
import mainManifest from "redstone-monorepo-github/packages/oracle-node/manifests/data-services/main.json";
import arbitrumManifest from "redstone-monorepo-github/packages/oracle-node/manifests/data-services/arbitrum.json";
import avalancheManifest from "redstone-monorepo-github/packages/oracle-node/manifests/data-services/avalanche.json";
import primaryManifest from "redstone-monorepo-github/packages/oracle-node/manifests/data-services/primary.json";
import primaryManifestLong from "redstone-monorepo-github/packages/oracle-node/manifests/data-services/primary-long.json";

export const DEFAULT_PROVIDER = "coingecko";

const primaryManifestCombined = {
  ...primaryManifest,
  tokens: {
    ...primaryManifest.tokens,
    ...primaryManifestLong.tokens,
  },
};
const manifests = {
  coingecko: mainManifest,
  "redstone-primary-prod": primaryManifestCombined,
  "redstone-avalanche-prod": avalancheManifest,
  "redstone-arbitrum-prod": arbitrumManifest,
};

let symbolDetails = undefined;

export function getDetailsForSymbol(symbol) {
  return getAllSymbolDetails()[symbol];
}

export async function getOrderedProviders() {
  return Object.keys(manifests);
}

export async function getAllSupportedTokens() {
  return getAllSymbolDetails();
}

function getAllSymbolDetails() {
  if (symbolDetails) {
    return symbolDetails;
  }

  const tokenDetails = {};

  Object.entries(tokenConfig).forEach(([symbol, config]) => {
    tokenDetails[symbol] = { ...config, providers: [DEFAULT_PROVIDER] };
  });

  for (const [provider, manifest] of Object.entries(manifests)) {
    for (const [symbol, config] of Object.entries(manifest.tokens)) {
      if (
        tokenDetails[symbol] &&
        tokenDetails[symbol].providers &&
        tokenDetails[symbol].providers[0] === DEFAULT_PROVIDER &&
        config.source &&
        config.source.length
      ) {
        tokenDetails[symbol].providers = [provider];
        if (!mainManifest.tokens[symbol]) {
          console.warn(`Missing ${symbol} in main manifest!`);
        }
      }
    }
  }

  symbolDetails = {};
  for (const [symbol, config] of Object.entries(tokenDetails).filter(
    ([, config]) => config.providers[0] !== DEFAULT_PROVIDER
  )) {
    symbolDetails[symbol] = config;
  }

  for (const [symbol, config] of Object.entries(tokenDetails).filter(
    ([, config]) => config.providers[0] === DEFAULT_PROVIDER
  )) {
    symbolDetails[symbol] = config;
  }

  return symbolDetails;
}

export function isCurrencyToken(details) {
  return !details.tags?.includes("lens");
}

export function getCurrency(details) {
  if (details.name?.includes("/")) {
    const [, currency] = details.name?.split("/");

    return currency.replaceAll(" ", "-");
  }

  if (details.symbol?.includes("/")) {
    const [, currency] = details.symbol?.split("/");

    return currency.replaceAll(" ", "-");
  }

  return "USD";
}
