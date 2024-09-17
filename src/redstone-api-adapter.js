import redstone from "redstone-api";
import axios from "axios";
import symbolToId from "./coingecko-symbol-to-id.json";

const CURRENCY = "usd";
const COINGECKO_URL = "https://dy9r79395zjk.cloudfront.net/api/v3";

const coingeckoId = (symbol) => symbolToId[symbol] || symbol.toLowerCase();

const daysParams = (daysCount) => {
  const endDate = new Date().getTime();
  return {
    toTimestamp: endDate,
    fromTimestamp: endDate - daysCount * 24 * 3600 * 1000,
    interval: 3600 * 1000,
  };
};

const lastHourParams = () => {
  const endDate = new Date().getTime();
  return {
    toTimestamp: endDate,
    fromTimestamp: endDate - 1 * 60 * 60 * 1000,
    interval: 60 * 1000,
  };
};

const makeConfigurableRequest = async (baseUrl, params = {}) => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, value);
    }
  });
  const result = await axios.get(url.toString());
  return result.data;
};

const getApiData = async function (symbol, opts) {
  const baseUrl = "http://localhost:9000/prices";
  let params = {
    provider: opts.provider,
    symbol: symbol,
    forceInflux: true,
    fromTimestamp: opts.startDate,
    toTimestamp: opts.endDate,
    interval: 1,
  };
  if (opts.daysCount) {
    params = {
      ...params,
      ...daysParams(opts.daysCount),
    };
  }

  if (opts.lastHour) {
    params = {
      ...params,
      ...lastHourParams(),
    };
  }

  if (opts.symbols) {
    params = {
      ...params,
      symbols: opts.symbols,
      symbol: undefined
    };
  }

  return await makeConfigurableRequest(baseUrl, params);
};

/** Represents PriceData from redstone-api */
const priceData = (symbol, provider, value, timestamp) => ({
  symbol,
  provider,
  source: {
    [provider]: value,
  },
  value,
  timestamp,
  id: `${provider}-${symbol}-${timestamp}`,
});

function fixHistoricalRedstoneProvider(opts) {
  opts.provider = opts.provider?.includes("redstone")
    ? "redstone"
    : opts.provider;

  return opts;
}

export default {
  getPrice: async function (symbol, opts) {
    if (opts.provider === "coingecko") {
      const geckoId = coingeckoId(symbol);
      const baseUrl = `${COINGECKO_URL}/simple/price`;
      const params = {
        ids: geckoId,
        vs_currencies: CURRENCY,
        precision: 2,
        include_last_updated_at: true,
      };

      const geckoResult = await makeConfigurableRequest(baseUrl, params);

      return priceData(
        symbol,
        opts.provider,
        geckoResult[geckoId][CURRENCY],
        geckoResult[geckoId]["last_updated_at"] * 1000
      );
    } else {
      const data = await getApiData(symbol, { provider: opts.provider, symbols: [symbol] });
      return data[symbol]
    }
  },
  getHistoricalPrice: async function (symbol, opts) {
    if (opts.provider === "coingecko") {
      const baseUrl = `${COINGECKO_URL}/coins/${coingeckoId(
        symbol
      )}/market_chart/range`;
      const params = {
        from: Math.floor(opts.startDate / 1000),
        to: Math.floor(opts.endDate / 1000),
        precision: 2,
        vs_currency: CURRENCY,
      };

      const geckoResult = await makeConfigurableRequest(baseUrl, params);

      return geckoResult.prices
        .reverse()
        .map((p) => priceData(symbol, opts.provider, p[1], p[0]));
    } else {
      return await getApiData(symbol, {
        provider: opts.provider,
        lastHour: true,
      });
    }
  },
  query: async function (provider, symbol, daysCount) {
    if (provider === "coingecko") {
      const baseUrl = `${COINGECKO_URL}/coins/${coingeckoId(
        symbol
      )}/market_chart`;
      const params = {
        days: daysCount,
        precision: 2,
        vs_currency: CURRENCY,
      };

      const geckoResult = await makeConfigurableRequest(baseUrl, params);

      return geckoResult.prices
        .reverse()
        .map((p) => priceData(symbol, provider, p[1], p[0]));
    } else {
      return await getApiData(symbol, { provider, daysCount });
    }
  },
  getAllPrices: async function (opts) {
    return await redstone.getAllPrices(fixHistoricalRedstoneProvider(opts));
  },
};
