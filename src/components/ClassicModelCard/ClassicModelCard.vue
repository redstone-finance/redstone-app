<template>
  <div>
    <div class="mb-lg">
      <b-row>
        <b-col
          xxl="3"
          xl="4"
          lg="6"
          md="12"
          sm="12"
          xs="12"
          class="py-1 py-md-2"
          v-for="(token, index) in filteredTokens"
          :key="index"
        >
          <div
            class="pb-xlg"
            @click="
              $router.push(`/app/token/${token.symbol.includes('/') ? token.symbol.replace('/', '\\') : token.symbol}`)
            "
          >
            <Widget class="mb-0 token-card">
              <b-row class="token-details">
                <b-col cols="2" class="token-logo">
                  <img v-if="token.logoURI" :src="token.logoURI" loading="lazy" />
                  <span class="no-token-emoji" v-else>🤔</span>
                </b-col>
                <!-- <b-col cols="5" sm="4" md="6" class="h4 token-title pr-0" v-if="isCustom(token.tags)">
                  {{ token.symbol | maxLength(15) }}
                  <br />
                  <div class="token-name">
                    {{ token?.comment }}
                  </div>
                </b-col> -->
                <!-- <b-col cols="5" sm="4" md="6" class="h4 token-title pr-0" v-else-if="token.tags?.includes('lens')">
                  {{ token.symbol | maxLength(15) }}
                  <br />
                  <div class="token-name">
                    {{ token.name }}
                  </div>
                </b-col> -->
                <b-col cols="5" sm="4" md="6" class="h4 token-title pr-0">
                  <div class="token-name">{{ token.tokenName }} on {{ token.chain.name }}</div>
                </b-col>
                <!-- <b-col cols="5" sm="6" md="4" class="token-price pl-0">
                  <span v-if="(prices[token.symbol] || prices[token.symbol] === 0) && isNotCurrencyToken(token.tags)">
                    {{ prices[token.symbol] | value({ eNotationForSmallValues: true }) | maxLength(8) }}
                  </span>
                  <span v-else-if="prices[token.symbol] || prices[token.symbol] === 0">
                    {{ prices[token.symbol] | price({ eNotationForSmallValues: true }) }}
                  </span>

                  <vue-loaders-ball-beat v-else color="var(--redstone-red-color)" scale="0.5"></vue-loaders-ball-beat>
                  </span>
                </b-col> -->
              </b-row>
              <b-row class="d-flex justify-content-end see-more-wrapper">
                <div class="see-more">See more<i class="fa fa-angle-right" /></div>
              </b-row>
            </Widget>
          </div>
        </b-col>
      </b-row>
      <!-- <b-row>
        <div
          v-if="!allTokensVisible"
          v-observe-visibility="loadMoreSectionVisibilityChanged"
          class="loading-more-container"
        >
          <vue-loaders-ball-beat color="var(--redstone-red-color)" scale="0.5"></vue-loaders-ball-beat>
        </div>
      </b-row> -->
    </div>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import _ from 'lodash';
import { mapState } from 'vuex';
import showMoreTokensMixin from '@/mixins/show-more-tokens';

export default {
  name: 'ClassicModelCard',

  mixins: [showMoreTokensMixin],

  props: {
    tokens: Array,
    tokenNames: Array,
    activeTabName: String,
  },

  components: {
    Widget,
  },
  data() {
    return {
      preparedTokens: [],
    };
  },
  async created() {
    //await this.$nextTick();
    // console.log(this.tokens);
    // console.log(this.tokenNames)
    //await this.prepareTokens();
    // console.log(this.filteredTokens);
  },
  computed: {
    filteredTokens() {
      const filteredArray = this.tokens.filter((obj) => obj.chain.name === this.activeTabName);
      return filteredArray;
    },
  },
  methods: {
    // async filterTokens() {
    //   this.filteredTokens = this.tokens.filter((obj) => obj.chain.name === this.activeTabName);
    // },
    // async prepareTokens() {
    //   const newArray = this.tokens.map((obj, index) => ({
    //     ...obj,
    //     tokenName: this.tokenNames[index],
    //   }));
    //   this.preparedTokens = newArray;
    //   console.log(newArray);
    // },
    // async prepareTokens() {
    //   await this.$nextTick();
    //   const newArray = [];

    //   for (const [index, obj] of this.tokens.entries()) {
    //     const tokenName = this.tokenNames[index];
    //     newArray.push({ ...obj, tokenName });
    //   }

    //   this.preparedTokens = newArray;
    //   //console.log(newArray);
    // },
  },
  // this.specificFileData.forEach((obj, index) => {
  //   console.log('hello2');
  //   const key = this.tokenNames[index];
  //   const resultObject = {};
  //   resultObject[key] = obj;
  //   resultArray.push(resultObject);
  //   console.log(resultObject);
  // });
};
</script>

<style lang="scss" src="../Tokens/Tokens.scss" scoped />
