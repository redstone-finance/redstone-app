<template>
  <div>
    <b-tabs nav-class="bg-transparent">
      <b-tab title="All" active>
        <TokenCards :prices="prices" />
      </b-tab>
      <b-tab title="Crypto">
        <TokenCards :prices="prices" type="crypto" />
      </b-tab>
      <b-tab title="Stocks">
        <TokenCards :prices="prices" type="stocks" />
      </b-tab>
      <b-tab title="Currencies">
        <TokenCards :prices="prices" type="currencies" />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import limestone from 'limestone-api';
import { BTabs, BTab } from 'bootstrap-vue';
import Tokens from "@/components/Tokens/Tokens";

async function getAllAvailableCurrentPrices() {
  const mainPrices = await limestone.getAllPrices();
  const rapidPrices = await limestone.getAllPrices({
    provider: 'limestone-rapid',
  });
  const stocksPrices = await limestone.getAllPrices({
    provider: 'limestone-stocks',
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
}
</script>

<style src="./Tokens.scss" lang="scss" scoped />
