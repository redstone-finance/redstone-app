import redstone from "redstone-api";
import axios from "axios";
import symbolToId from "./coingecko-symbol-to-id.json";

const CURRENCY = 'usd';
const GECKO_URL = 'https://dy9r79395zjk.cloudfront.net/api/v3'

const coingeckoId = (symbol) => symbolToId[symbol] || symbol.toLowerCase();

/** Represents PriceData from redstone-api */
const priceData = (symbol, provider, value, timestamp) => ({
    symbol,
    provider,
    source: {
      [provider]: value
    },
    value,
    timestamp
});

export default {
    getPrice: async function (symbol, opts) {
        if (opts.provider === 'coingecko') {
            const geckoId = coingeckoId(symbol);
            const geckoResult = (await axios.get(`${GECKO_URL}/simple/price?ids=${geckoId}&vs_currencies=${CURRENCY}&precision=2`)).data;
            return priceData(symbol, opts.provider, geckoResult[geckoId][CURRENCY], Date.now());
        } else {
            return await redstone.getPrice(symbol, opts);
        }
    },
    getHistoricalPrice: async function (symbol, opts) {
        if (opts.provider === 'coingecko') {
            const from = (opts.startDate / 1000) | 0;
            const to = (opts.endDate / 1000) | 0;
            const geckoResult = (await axios.get(`${GECKO_URL}/coins/${coingeckoId(symbol)}/market_chart/range?from=${from}&to=${to}&precision=2&vs_currency=${CURRENCY}`)).data;
            return geckoResult.prices.map((p) => priceData(symbol, opts.provider, p[1], p[0]));
        } else {
            return await redstone.getHistoricalPrice(symbol, opts);
        }
    },
    query: async function (provider, symbol, daysCount) {
        if (provider === 'coingecko') {
            const geckoResult = (await axios.get(`${GECKO_URL}/coins/${coingeckoId(symbol)}/market_chart?days=${daysCount}&precision=2&vs_currency=${CURRENCY}`)).data;
            return geckoResult.prices.map((p) => priceData(symbol, provider, p[1], p[0]));
        } else {
            return await redstone
                .query()
                .symbol(symbol)
                .forLastDays(daysCount)
                .exec({provider});
        }
    },
    getAllPrices: async function (opts) {
        return await redstone.getAllPrices(opts);
    }
}

