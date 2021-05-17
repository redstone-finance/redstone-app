<template>
  <div>
    <b-tabs nav-class="bg-transparent">
      <b-tab title="All" active>
        <TokenCards />
      </b-tab>
      <b-tab title="Crypto" active>
        <TokenCards type="crypto" />
      </b-tab>
      <b-tab title="Stocks">
        <TokenCards type="stocks" />
      </b-tab>
      <b-tab title="Currencies">
        <TokenCards type="currencies" />
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
import { BTabs, BTab } from 'bootstrap-vue';
import Tokens from "@/components/Tokens/Tokens";
// import Widget from '@/components/Widget/Widget';


export default {
  name: "Tokens",
  components: {
    TokenCards: Tokens,
    // Widget,
    BTabs,
    BTab,
  },
}
</script>

<style src="./Tokens.scss" lang="scss" scoped />
