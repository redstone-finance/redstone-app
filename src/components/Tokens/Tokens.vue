<template>
  <div>
    <div class="d-flex align-items-center mb-lg">
      <b-row>
        <b-col md="6" xl="4" sm="6" xs="12" v-for="(token, index) in tokens" :key="index">
          <div class="pb-xlg" @click="$router.push('/app/token/ETH')">
            <Widget class="mb-0" style="height: 60px; cursor: pointer;">
              <div class="d-flex align-items-center mb-lg">
                <img :src="token.logo" style="height: 30px;">
                <h4 style="margin-bottom: 0px; margin-left: 10px;">{{token.name}}</h4>
                <h2 style="position:absolute; right:20px;">${{token.price}}</h2>
                <!--
                <i class="la la-arrow-right text-success la-lg rotate-315" />
                -->
              </div>
            </Widget>
          </div>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import Widget from "@/components/Widget/Widget";

export default {
  name: 'Tokens',
  data() {
    return {
      tokens: [],
    };
  },

  created() {
    this.loadTokens();
  },

  methods: {
    async loadTokens() {
      this.tokens = [
        {name: "Ethereum", price: "1,750.23", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"},
        {name: "Bitcoin", price: "57,267.64", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=010"},
        {name: "AR", price: "14.73", logo: "https://cryptologos.cc/logos/arweave-ar-logo.png?v=010"},
        {name: "Ethereum", price: "1,750.23", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"},
        {name: "Bitcoin", price: "57,267.64", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=010"},
        {name: "AR", price: "14.73", logo: "https://cryptologos.cc/logos/arweave-ar-logo.png?v=010"},
        {name: "Ethereum", price: "1,750.23", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"},
        {name: "Bitcoin", price: "57,267.64", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=010"},
        {name: "AR", price: "14.73", logo: "https://cryptologos.cc/logos/arweave-ar-logo.png?v=010"},
        {name: "Ethereum", price: "1,750.23", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"},
        {name: "Bitcoin", price: "57,267.64", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=010"},
        {name: "AR", price: "14.73", logo: "https://cryptologos.cc/logos/arweave-ar-logo.png?v=010"},
        {name: "Ethereum", price: "1,750.23", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"},
        {name: "Bitcoin", price: "57,267.64", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=010"},
        {name: "AR", price: "14.73", logo: "https://cryptologos.cc/logos/arweave-ar-logo.png?v=010"},
        {name: "Ethereum", price: "1,750.23", logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"},
        {name: "Bitcoin", price: "57,267.64", logo: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=010"},
        {name: "AR", price: "14.73", logo: "https://cryptologos.cc/logos/arweave-ar-logo.png?v=010"},
      ]
    },
  },

  components: {
    Widget,
  },
}
</script>

<style>

</style>