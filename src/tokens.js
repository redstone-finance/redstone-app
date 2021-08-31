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
  return tokenDetails[symbol];
}

export function getOrderedProviders() {
  return Object.keys(manifests);
}

export function getAllSupportedTokens() {
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
