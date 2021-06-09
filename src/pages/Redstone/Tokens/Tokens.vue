<template>
  <div>
    <b-tabs nav-class="bg-transparent">
      <b-tab active>
        <template #title>
          All <span class="tokens-number">{{ allTokens(prices).length }}</span>
        </template>
        <TokenCards :tokens="allTokens(prices)" />
      </b-tab>
      <b-tab>
        <template #title>
          Crypto <span class="tokens-number">{{ cryptoTokens(prices).length }}</span>
        </template>
        <TokenCards :tokens="cryptoTokens(prices)" />
      </b-tab>
      <b-tab>
        <template #title>
          Stocks <span class="tokens-number">{{ stockTokens(prices).length }}</span>
        </template>
        <TokenCards :tokens="stockTokens(prices)" />
      </b-tab>
      <b-tab>
        <template #title>
          Currencies <span class="tokens-number">{{ currencyTokens(prices).length }}</span>
        </template>
        <TokenCards :tokens="currencyTokens(prices)" />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import redstone from 'redstone-api';
import { BTabs, BTab } from 'bootstrap-vue';
import Tokens from "@/components/Tokens/Tokens";
import tokensData from "@/assets/data/tokens.json";

async function getAllAvailableCurrentPrices() {
  const mainPrices = await redstone.getAllPrices();
  const rapidPrices = await redstone.getAllPrices({
    provider: 'redstone-rapid',
  });
  const stocksPrices = await redstone.getAllPrices({
    provider: 'redstone-stocks',
  });

  return {
    ...mainPrices,
    ...rapidPrices,
    ...stocksPrices,
  };
}

let currentPrices;

export default {
  name: "Tokens",

  data() {
    return {
      prices: {}
    };
  },

  components: {
    TokenCards: Tokens,
    BTabs,
    BTab,
  },

  async mounted() {
    if (currentPrices) {
      this.prices = currentPrices;
    } else {
      currentPrices = await getAllAvailableCurrentPrices();
      this.prices = currentPrices;
    }
  },
  
  methods: {
    filteredTokenWithPrices(fetchedPrices, type) {
      const result = [];
      for (const symbol of Object.keys(tokensData)) {
        const token = tokensData[symbol];
        let shouldBeAdded = true;

        if (type) {
          if (!token.tags || !token.tags.includes(type)) {
            shouldBeAdded = false;
          }
        }

        const { searchTerm } = this.$store.state.layout;
        const searchTermLowerCase = searchTerm.toLowerCase();
        if (searchTerm) {
          const nameIncludesSearchTerm =
            (token.name || '').toLowerCase().includes(searchTermLowerCase);
          const symbolIncludesSearchTerm =
            (symbol || '').toLowerCase().includes(searchTermLowerCase);
          if (!nameIncludesSearchTerm && !symbolIncludesSearchTerm) {
            shouldBeAdded = false;
          }
        }

        //TODO: remove when price fetching is corrected
        if (['BTMX', 'NPXS', 'MDX', 'AMP'].includes(symbol)) {
          shouldBeAdded = false;
        }

        if (shouldBeAdded) {
          result.push({
              symbol: symbol,
              ...token,
              price: fetchedPrices[symbol]?.value
            }
          );
        }
      }

      return result;
    },
    allTokens(prices) {
      return this.filteredTokenWithPrices(prices);
    },
    cryptoTokens(prices) {
      return this.filteredTokenWithPrices(prices, 'crypto');
    },
    stockTokens(prices) {
      return this.filteredTokenWithPrices(prices, 'stocks');
    },
    currencyTokens(prices) {
      return this.filteredTokenWithPrices(prices, 'currencies');
    },

  },
}
</script>

<style src="./Tokens.scss" lang="scss" scoped />
