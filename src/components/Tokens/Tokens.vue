<template>
  <div>
    <div class="mb-lg">
      <b-row>
        <b-col md="6" xl="4" lg="4" sm="6" xs="12" v-for="(token, index) in filteredTokens" :key="index">
          <div class="pb-xlg" @click="$router.push('/app/token/' + token.symbol)">
            <Widget class="mb-0 enlarge-on-hover" style="height: 60px; cursor: pointer;">
              <div class="d-flex align-items-center mb-lg">
                <img :src="token.logoURI" style="height: 30px;">
                <h4 style="margin-bottom: 0px; margin-left: 10px;">{{token.name}}</h4>
                <!-- <h2 style="position:absolute; right:20px;">${{token.price}}</h2> -->
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
import tokensData from "@/assets/data/tokens.json";

export default {
  name: 'Tokens',

  props: {
    type: String,
  },

  computed: {
    filteredTokens() {
      const result = [];
      for (const symbol of Object.keys(tokensData)) {
        const token = tokensData[symbol];
        let shouldBeAdded = true;

        if (this.type) {
          if (!token.tags || !token.tags.includes(this.type)) {
            shouldBeAdded = false;
          }
        }

        const { searchTerm } = this.$store.state.layout;
        const searchTermLowerCase = searchTerm.toLowerCase();
        if (searchTerm) {
          const nameIncludesSearchTerm =
            token.name.toLowerCase().includes(searchTermLowerCase);
          const symbolIncludesSearchTerm =
            symbol.toLowerCase().includes(searchTermLowerCase);
          if (!nameIncludesSearchTerm && !symbolIncludesSearchTerm) {
            shouldBeAdded = false;
          }
        }

        if (shouldBeAdded) {
          result.push({
            ...token,
            symbol,
          });
        }
      }

      return result;
    },
  },

  methods: {},

  components: {
    Widget,
  },
}
</script>

<style scoped>

.enlarge-on-hover {
  transition: all 0.5s ease;
}

.enlarge-on-hover:hover {
  transform: scale(1.1);
}

</style>