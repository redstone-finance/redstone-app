<template>
  <div>
    <b-tabs nav-class="bg-transparent">
      <b-tab active>
        <template #title>
          All <span class="tokens-number">{{ allTokens.length }}</span>
        </template>
        <TokenCards :tokens="allTokens" />
      </b-tab>
      <b-tab>
        <template #title>
          Crypto <span class="tokens-number">{{ cryptoTokens.length }}</span>
        </template>
        <TokenCards :tokens="cryptoTokens" />
      </b-tab>
      <b-tab>
        <template #title>
          Stocks <span class="tokens-number">{{ stockTokens.length }}</span>
        </template>
        <TokenCards :tokens="stockTokens" />
      </b-tab>
      <b-tab>
        <template #title>
          Currencies <span class="tokens-number">{{ currencyTokens.length }}</span>
        </template>
        <TokenCards :tokens="currencyTokens" />
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
      prices: {},
      allTokens: [],
      cryptoTokens: [],
      stockTokens: [],
      currencyTokens: []
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
            (symbol || '').toLowerCase().includes0(searchTermLowerCase);
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
  },

  watch: {
    prices: {
        immediate: true,
        handler: function(val) {
        this.allTokens = this.filteredTokenWithPrices(val)
        this.cryptoTokens = this.filteredTokenWithPrices(val, 'crypto')
        this.stockTokens = this.filteredTokenWithPrices(val, 'stocks')
        this.currencyTokens = this.filteredTokenWithPrices(val, 'currencies')
        console.log(this.allTokens)
      }
    }

  }
}
</script>

<style src="./Tokens.scss" lang="scss" scoped />
