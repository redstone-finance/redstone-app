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
                <b-col cols="5" sm="4" md="6" class="h4 token-title pr-0">
                  <div class="token-name">{{ token.tokenName }} on {{ token.chain.name }}</div>
                </b-col>
              </b-row>
              <b-row class="d-flex justify-content-end see-more-wrapper">
                <div class="see-more">See more<i class="fa fa-angle-right" /></div>
              </b-row>
            </Widget>
          </div>
        </b-col>
      </b-row>
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
  computed: {
    filteredTokens() {
      const filteredArray = this.tokens.filter((obj) => obj.chain.name === this.activeTabName);
      return filteredArray;
    },
  },
};
</script>

<style lang="scss" src="../Tokens/Tokens.scss" scoped />
