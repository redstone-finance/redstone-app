import redstone from "redstone-api";
import axios from "axios";
import symbolToId from "./coingecko-symbol-to-id.json";

const CURRENCY = 'usd';
const COINGECKO_URL = 'https://dy9r79395zjk.cloudfront.net/api/v3'

const coingeckoId = (symbol) => symbolToId[symbol] || symbol.toLowerCase();

/** Represents PriceData from redstone-api */
const priceData = (symbol, provider, value, timestamp) => ({
    symbol,
    provider,
    source: {
      [provider]: value
    },
    value,
    timestamp,
    id: `${provider}-${symbol}-${timestamp}`
});

function fixHistoricalRedstoneProvider(opts) {
    opts.provider = opts.provider?.includes('redstone') ? 'redstone' : opts.provider;

    return opts;
}

export default {
    getPrice: async function (symbol, opts) {
        if (opts.provider === 'coingecko') {
            const geckoId = coingeckoId(symbol);
            const url = `${COINGECKO_URL}/simple/price?ids=${geckoId}&vs_currencies=${CURRENCY}&precision=2&include_last_updated_at=true`;
            const geckoResult = (await axios.get(url)).data;

            return priceData(symbol, opts.provider, geckoResult[geckoId][CURRENCY], geckoResult[geckoId]["last_updated_at"] * 1000);
        } else {
            return await redstone
              .query()
              .symbol(symbol)
              .latest()
              .exec({defaultProvider: opts.provider});
        }
    },
    getHistoricalPrice: async function (symbol, opts) {
        if (opts.provider === 'coingecko') {
            const from = (opts.startDate / 1000) | 0;
            const to = (opts.endDate / 1000) | 0;
            const url = `${COINGECKO_URL}/coins/${coingeckoId(symbol)}/market_chart/range?from=${from}&to=${to}&precision=2&vs_currency=${CURRENCY}`;
            const geckoResult = (await axios.get(url)).data;

            return geckoResult.prices.reverse().map((p) => priceData(symbol, opts.provider, p[1], p[0]));
        } else {
            return (await redstone.getHistoricalPrice(symbol, fixHistoricalRedstoneProvider(opts)))
              .map((priceData) => {
                  priceData.provider = opts.provider;
                  return priceData
              });
        }
    },
    query: async function (provider, symbol, daysCount) {
        if (provider === 'coingecko') {
            const url = `${COINGECKO_URL}/coins/${coingeckoId(symbol)}/market_chart?days=${daysCount}&precision=2&vs_currency=${CURRENCY}`;
            const geckoResult = (await axios.get(url)).data;

            return geckoResult.prices.reverse().map((p) => priceData(symbol, provider, p[1], p[0]));
        } else {
            return await redstone
                .query()
                .symbol(symbol)
                .forLastDays(daysCount)
                .exec({defaultProvider: provider});
        }
    },
    getAllPrices: async function (opts) {
        return await redstone.getAllPrices(fixHistoricalRedstoneProvider(opts));
    }
}
