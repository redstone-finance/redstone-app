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
    <!-- <Widget
      title="Tokens"
      close collapse settings customHeader
    >
    </Widget> -->
  </div>
</template>

<script>
import limestone from 'limestone-api';
import { BTabs, BTab } from 'bootstrap-vue';
import Tokens from "@/components/Tokens/Tokens";

export default {
  name: "Tokens",

  data() {
    return {
      prices: {},
    };
  },

  components: {
    TokenCards: Tokens,
    // Widget,
    BTabs,
    BTab,
  },

  mounted() {
    this.loadPrices();
  },

  methods: {
    async loadPrices() {
      const mainPrices = await limestone.getAllPrices();
      const rapidPrices = await limestone.getAllPrices({
        provider: 'limestone-rapid',
      });
      const stocksPrices = await limestone.getAllPrices({
        provider: 'limestone-stocks',
      });
      this.prices = {
        ...mainPrices,
        ...rapidPrices,
        ...stocksPrices,
      };
    },
  },
}
</script>

<style src="./Tokens.scss" lang="scss" scoped />
